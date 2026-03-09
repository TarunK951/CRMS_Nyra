"use server";

import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/types/database";
import { GAMIFICATION_POINTS } from "@/types/database";

export async function createLead(
  formData: FormData,
  assignToRepId?: string,
  existingId?: string
) {
  const supabase = await createClient();
  const monthly = formData.get("monthly_appointments");
  const branchCount = formData.get("branch_count");

  const nextFollowUp = formData.get("next_follow_up") as string | null;
  const payload = {
    clinic_name: String(formData.get("clinic_name") ?? ""),
    doctor_name: String(formData.get("doctor_name") ?? ""),
    specialization: String(formData.get("specialization") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    area: String(formData.get("area") ?? ""),
    city: String(formData.get("city") ?? ""),
    monthly_appointments: monthly ? Number(monthly) : null,
    branch_count: branchCount ? Number(branchCount) : 1,
    lead_source: String(formData.get("lead_source") ?? ""),
    lead_status: (formData.get("lead_status") as LeadStatus) ?? "new_lead",
    ...(assignToRepId ? { assigned_rep_id: assignToRepId } : {}),
    ...(existingId && nextFollowUp !== undefined ? { next_follow_up: nextFollowUp || null } : {}),
  };

  if (existingId) {
    const { error } = await supabase.from("leads").update(payload).eq("id", existingId);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from("leads").insert(payload);
  return { error: error?.message ?? null };
}

export async function updateLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
  repId: string
) {
  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("leads")
    .update({ lead_status: newStatus })
    .eq("id", leadId);
  if (updateError) return { error: updateError.message };

  await supabase.from("lead_activities").insert({
    lead_id: leadId,
    type: "stage_change",
    content: `Stage changed to ${newStatus}`,
    rep_id: repId,
    metadata: { new_status: newStatus },
  });

  const points =
    newStatus === "pitch_delivered" ? GAMIFICATION_POINTS.pitch_delivered :
    newStatus === "sprint_started" ? GAMIFICATION_POINTS.sprint_sold :
    newStatus === "subscription_closed" ? GAMIFICATION_POINTS.subscription_closed : 0;
  if (points > 0) {
    await supabase.from("gamification_events").insert({
      rep_id: repId,
      action_type: newStatus,
      points,
      lead_id: leadId,
    });
  }
  return { error: null };
}

export async function updateLeadNextFollowUp(leadId: string, nextFollowUp: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ next_follow_up: nextFollowUp }).eq("id", leadId);
  return { error: error?.message ?? null };
}
