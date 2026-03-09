import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CommandCenterCharts } from "@/components/CommandCenterCharts";
import { SeedButton } from "@/components/SeedButton";
import { LEAD_STATUS_LABELS } from "@/types/database";
import { format, subMonths, startOfMonth } from "date-fns";
import type { LeadStatus } from "@/types/database";

const PIPELINE_STAGES: LeadStatus[] = [
  "new_lead",
  "contacted",
  "meeting_scheduled",
  "pitch_delivered",
  "sprint_offered",
  "sprint_started",
  "sprint_completed",
  "subscription_closed",
  "lost",
];

const MRR_PER_PLAN: Record<string, number> = {
  micro: 99,
  small: 199,
  growth: 399,
  enterprise: 999,
};
const CONTRACT_FACTOR: Record<string, number> = {
  monthly: 1,
  quarterly: 1 / 3,
  half_year: 1 / 6,
  yearly: 1 / 12,
};

export default async function AdminCommandCenter() {
  const supabase = await createClient();

  const [
    leadsRes,
    sprintsRes,
    subsRes,
    allLeads,
    allSubs,
    repsRes,
    gamificationRes,
  ] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("sprints").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("subscriptions").select("id, plan_type, contract_type", { count: "exact", head: false }),
    supabase.from("leads").select("id, lead_status, created_at"),
    supabase.from("subscriptions").select("id, created_at"),
    supabase.from("profiles").select("id, full_name").eq("role", "sales_rep"),
    supabase.from("gamification_events").select("rep_id, points"),
  ]);

  const totalLeads = leadsRes.count ?? 0;
  const sprintsRunning = sprintsRes.count ?? 0;
  const activeSubscriptions = subsRes.count ?? 0;
  const subscriptions = subsRes.data ?? [];
  const leads = allLeads.data ?? [];
  const subsCreated = allSubs.data ?? [];
  const reps = repsRes.data ?? [];
  const events = gamificationRes.data ?? [];

  let mrr = 0;
  for (const s of subscriptions) {
    const base = MRR_PER_PLAN[s.plan_type] ?? 0;
    const factor = CONTRACT_FACTOR[s.contract_type] ?? 1;
    mrr += base * factor;
  }

  const sprintTotal = (await supabase.from("sprints").select("id", { count: "exact", head: true })).count ?? 0;
  const conversionRate = sprintTotal > 0 ? Math.round((activeSubscriptions / sprintTotal) * 100) : 0;

  const openPipelineStages: LeadStatus[] = ["new_lead", "contacted", "meeting_scheduled", "pitch_delivered", "sprint_offered", "sprint_started", "sprint_completed"];
  const pipelineLeadCount = leads.filter((l) => openPipelineStages.includes(l.lead_status as LeadStatus)).length;
  const pipelineValueEst = pipelineLeadCount * 5000;

  const funnel = PIPELINE_STAGES.map((stage) => ({
    stage: LEAD_STATUS_LABELS[stage],
    count: leads.filter((l) => l.lead_status === stage).length,
  })).filter((f) => f.count > 0);

  const repPoints = new Map<string, number>();
  for (const r of reps) repPoints.set(r.id, 0);
  for (const e of events) {
    repPoints.set(e.rep_id, (repPoints.get(e.rep_id) ?? 0) + e.points);
  }
  const repPerformance = reps.map((r) => ({
    name: (r.full_name ?? "—").split(" ")[0] || "Rep",
    points: repPoints.get(r.id) ?? 0,
    subs: 0,
  }));

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return { key: startOfMonth(d).toISOString().slice(0, 7), label: format(d, "MMM yy") };
  });
  const monthlyAcquisition = months.map(({ key, label }) => ({
    month: label,
    leads: leads.filter((l) => l.created_at?.slice(0, 7) === key).length,
    subs: subsCreated.filter((s) => s.created_at?.slice(0, 7) === key).length,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">High-level insights and analytics</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/leads" className="rounded-card border border-border bg-card p-5 shadow-card card-hover">
          <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalLeads}</p>
        </Link>
        <Link href="/admin/pipeline" className="rounded-card border border-border bg-card p-5 shadow-card card-hover">
          <p className="text-sm font-medium text-muted-foreground">Active Pipeline Value</p>
          <p className="text-2xl font-bold text-foreground mt-1">₹{pipelineValueEst.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{pipelineLeadCount} open leads</p>
        </Link>
        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Sprints Running</p>
          <p className="text-2xl font-bold text-foreground mt-1">{sprintsRunning}</p>
        </div>
        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Sprint Conversion Rate</p>
          <p className="text-2xl font-bold text-foreground mt-1">{conversionRate}%</p>
        </div>
        <Link href="/admin/subscriptions" className="rounded-card border border-border bg-card p-5 shadow-card card-hover">
          <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
          <p className="text-2xl font-bold text-foreground mt-1">{activeSubscriptions}</p>
        </Link>
        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <p className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</p>
          <p className="text-2xl font-bold text-foreground mt-1">₹{Math.round(mrr).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/war-room" className="rounded-button bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Daily War Room
        </Link>
        <Link href="/admin/leads" className="rounded-button border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
          Leads
        </Link>
        <Link href="/admin/pipeline" className="rounded-button border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
          Pipeline
        </Link>
        <SeedButton />
      </div>
      <CommandCenterCharts funnel={funnel} repPerformance={repPerformance} monthlyAcquisition={monthlyAcquisition} />
    </div>
  );
}
