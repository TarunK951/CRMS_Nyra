"use server";

import { createClient } from "@/lib/supabase/server";

export async function logDailyActivity(
  repId: string,
  data: {
    clinic_visits: number;
    doctor_meetings: number;
    pitches_delivered: number;
    sprints_sold: number;
    subscriptions_closed: number;
  }
) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("daily_activities").upsert(
    {
      rep_id: repId,
      date: today,
      ...data,
    },
    { onConflict: "rep_id,date" }
  );
  return { error: error?.message ?? null };
}
