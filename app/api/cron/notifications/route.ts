import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const in3Days = new Date();
  in3Days.setDate(in3Days.getDate() + 3);
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);
  const in14Days = new Date();
  in14Days.setDate(in14Days.getDate() + 14);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const notifications: { user_id: string; title: string; body: string | null }[] = [];

  const { data: sprintsEnding } = await supabase
    .from("sprints")
    .select("id, end_date, lead_id, leads(assigned_rep_id)")
    .eq("status", "active")
    .gte("end_date", today)
    .lte("end_date", in3Days.toISOString().slice(0, 10));

  for (const s of sprintsEnding ?? []) {
    const repId = (s.leads as { assigned_rep_id?: string } | null)?.assigned_rep_id;
    if (repId) {
      notifications.push({
        user_id: repId,
        title: "Sprint ending soon",
        body: `Sprint ends on ${s.end_date}. Follow up with the clinic.`,
      });
    }
  }

  const { data: renewals } = await supabase
    .from("subscriptions")
    .select("id, renewal_date, lead_id, leads(assigned_rep_id)")
    .gte("renewal_date", today)
    .lte("renewal_date", in14Days.toISOString().slice(0, 10));

  const { data: adminProfiles } = await supabase.from("profiles").select("id").in("role", ["admin", "operations"]);
  const adminIds = (adminProfiles ?? []).map((p) => p.id);

  for (const r of renewals ?? []) {
    const repId = (r.leads as { assigned_rep_id?: string } | null)?.assigned_rep_id;
    if (repId) {
      notifications.push({
        user_id: repId,
        title: "Subscription renewal approaching",
        body: `Renewal on ${r.renewal_date}.`,
      });
    }
    for (const adminId of adminIds) {
      notifications.push({
        user_id: adminId,
        title: "Subscription renewal approaching",
        body: `Renewal on ${r.renewal_date}.`,
      });
    }
  }

  const { data: activities } = await supabase
    .from("lead_activities")
    .select("lead_id")
    .gte("created_at", sevenDaysAgo.toISOString());
  const activeLeadIds = new Set((activities ?? []).map((a) => a.lead_id));

  const { data: allLeads } = await supabase.from("leads").select("id, assigned_rep_id, lead_status");
  const openLeads = (allLeads ?? []).filter((l) => l.lead_status !== "subscription_closed" && l.lead_status !== "lost");
  for (const lead of openLeads) {
    if (lead.assigned_rep_id && !activeLeadIds.has(lead.id)) {
      notifications.push({
        user_id: lead.assigned_rep_id,
        title: "Inactive lead reminder",
        body: "No activity for 7 days. Consider following up.",
      });
    }
  }

  for (const n of notifications) {
    await supabase.from("notifications").insert({ user_id: n.user_id, title: n.title, body: n.body });
  }

  return NextResponse.json({ created: notifications.length });
}
