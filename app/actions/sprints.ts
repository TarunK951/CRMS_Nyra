"use server";

import { createClient } from "@/lib/supabase/server";

export async function createSprint(leadId: string, formData: FormData) {
  const supabase = await createClient();
  const start = formData.get("start_date") as string;
  const end = formData.get("end_date") as string;
  const status = (formData.get("status") as string) || "active";
  const appointment_confirmations = formData.get("appointment_confirmations") ? Number(formData.get("appointment_confirmations")) : null;
  const calls_handled = formData.get("calls_handled") ? Number(formData.get("calls_handled")) : null;
  const rescheduled = formData.get("rescheduled") ? Number(formData.get("rescheduled")) : null;
  const feedback = (formData.get("feedback") as string) || null;

  const { error } = await supabase.from("sprints").insert({
    lead_id: leadId,
    start_date: start,
    end_date: end,
    status,
    appointment_confirmations,
    calls_handled,
    rescheduled,
    feedback,
  });
  return { error: error?.message ?? null };
}

export async function updateSprint(sprintId: string, formData: FormData) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = {};
  const start = formData.get("start_date") as string | null;
  const end = formData.get("end_date") as string | null;
  const status = formData.get("status") as string | null;
  if (start) payload.start_date = start;
  if (end) payload.end_date = end;
  if (status) payload.status = status;
  const appointment_confirmations = formData.get("appointment_confirmations");
  const calls_handled = formData.get("calls_handled");
  const rescheduled = formData.get("rescheduled");
  const feedback = formData.get("feedback");
  if (appointment_confirmations !== undefined) payload.appointment_confirmations = appointment_confirmations ? Number(appointment_confirmations) : null;
  if (calls_handled !== undefined) payload.calls_handled = calls_handled ? Number(calls_handled) : null;
  if (rescheduled !== undefined) payload.rescheduled = rescheduled ? Number(rescheduled) : null;
  if (feedback !== undefined) payload.feedback = feedback as string | null;

  const { error } = await supabase.from("sprints").update(payload).eq("id", sprintId);
  return { error: error?.message ?? null };
}
