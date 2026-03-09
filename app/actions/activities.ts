"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActivityType } from "@/types/database";
import { GAMIFICATION_POINTS } from "@/types/database";

export async function addLeadActivity(leadId: string, type: ActivityType, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("lead_activities").insert({
    lead_id: leadId,
    type,
    content,
    rep_id: user.id,
  });
  if (error) return { error: error.message };

  const points =
    type === "visit" ? GAMIFICATION_POINTS.clinic_visit :
    type === "meeting" ? GAMIFICATION_POINTS.doctor_meeting : 0;
  if (points > 0) {
    await supabase.from("gamification_events").insert({
      rep_id: user.id,
      action_type: type,
      points,
      lead_id: leadId,
    });
  }

  await upsertDailyActivity(supabase, user.id, type);
  return { error: null };
}

async function upsertDailyActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  repId: string,
  type: ActivityType
) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("daily_activities")
    .select("*")
    .eq("rep_id", repId)
    .eq("date", today)
    .single();

  const inc = {
    visit: { clinic_visits: 1 },
    meeting: { doctor_meetings: 1 },
    note: {},
    stage_change: {},
  }[type];

  if (Object.keys(inc).length === 0) return;

  if (existing) {
    await supabase
      .from("daily_activities")
      .update({
        clinic_visits: type === "visit" ? existing.clinic_visits + 1 : existing.clinic_visits,
        doctor_meetings: type === "meeting" ? existing.doctor_meetings + 1 : existing.doctor_meetings,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("daily_activities").insert({
      rep_id: repId,
      date: today,
      clinic_visits: type === "visit" ? 1 : 0,
      doctor_meetings: type === "meeting" ? 1 : 0,
      pitches_delivered: 0,
      sprints_sold: 0,
      subscriptions_closed: 0,
    });
  }
}
