"use server";

import { createClient } from "@/lib/supabase/server";
import type { PlanType, ContractType } from "@/types/database";
import { GAMIFICATION_POINTS } from "@/types/database";

export async function createSubscription(leadId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const plan_type = formData.get("plan_type") as PlanType;
  const contract_type = formData.get("contract_type") as ContractType;
  const start_date = formData.get("start_date") as string;
  const renewal_date = formData.get("renewal_date") as string;
  const minutes_allocation = formData.get("minutes_allocation") ? Number(formData.get("minutes_allocation")) : null;
  const branch_count = formData.get("branch_count") ? Number(formData.get("branch_count")) : 1;

  const { error } = await supabase.from("subscriptions").insert({
    lead_id: leadId,
    plan_type,
    contract_type,
    start_date,
    renewal_date,
    minutes_allocation,
    branch_count,
  });
  if (error) return { error: error.message };

  const points = plan_type === "enterprise" ? GAMIFICATION_POINTS.enterprise_deal : GAMIFICATION_POINTS.subscription_closed;
  if (user) {
    await supabase.from("gamification_events").insert({
      rep_id: user.id,
      action_type: "subscription_closed",
      points,
      lead_id: leadId,
    });
  }
  return { error: null };
}
