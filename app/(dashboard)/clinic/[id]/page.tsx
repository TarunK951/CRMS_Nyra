import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LEAD_STATUS_LABELS, PLAN_LABELS, CONTRACT_LABELS } from "@/types/database";
import type { LeadStatus, PlanType, ContractType } from "@/types/database";
import { format } from "date-fns";
import ClinicActivityForm from "@/components/ClinicActivityForm";
import { BackToLeadsLink } from "@/components/BackToLeadsLink";
import SprintForm from "@/components/SprintForm";
import SubscriptionForm from "@/components/SubscriptionForm";
import { NextFollowUpForm } from "@/components/NextFollowUpForm";

export default async function ClinicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (leadError || !lead) notFound();

  const [activitiesRes, sprintsRes, subsRes, repRes] = await Promise.all([
    supabase.from("lead_activities").select("*, profiles:rep_id(full_name)").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("sprints").select("*").eq("lead_id", id).order("start_date", { ascending: false }),
    supabase.from("subscriptions").select("*").eq("lead_id", id).order("start_date", { ascending: false }),
    lead.assigned_rep_id ? supabase.from("profiles").select("full_name").eq("id", lead.assigned_rep_id).single() : { data: null },
  ]);

  const activities = activitiesRes.data ?? [];
  const sprints = sprintsRes.data ?? [];
  const subscriptions = subsRes.data ?? [];
  const repName = repRes.data?.full_name ?? null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <BackToLeadsLink />
          <h1 className="text-2xl font-bold text-foreground mt-1 tracking-tight">{lead.clinic_name}</h1>
          <p className="text-muted-foreground">{lead.doctor_name} · {lead.specialization || "—"}</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
          {LEAD_STATUS_LABELS[lead.lead_status as LeadStatus]}
        </span>
      </div>

      <section className="rounded-button border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Basic information</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Phone</dt><dd className="text-foreground font-medium">{lead.phone || "—"}</dd></div>
          <div><dt className="text-muted-foreground">Address</dt><dd className="text-foreground">{lead.address || "—"}</dd></div>
          <div><dt className="text-muted-foreground">Area</dt><dd className="text-foreground">{lead.area || "—"}</dd></div>
          <div><dt className="text-muted-foreground">City</dt><dd className="text-foreground">{lead.city || "—"}</dd></div>
          <div><dt className="text-muted-foreground">Monthly appointments</dt><dd className="text-foreground">{lead.monthly_appointments ?? "—"}</dd></div>
          <div><dt className="text-muted-foreground">Branches</dt><dd className="text-foreground">{lead.branch_count}</dd></div>
          <div><dt className="text-muted-foreground">Lead source</dt><dd className="text-foreground">{lead.lead_source || "—"}</dd></div>
          <div><dt className="text-muted-foreground">Assigned rep</dt><dd className="text-foreground">{repName ?? "—"}</dd></div>
        </dl>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground mb-2">Next follow-up date</p>
          <NextFollowUpForm leadId={id} current={lead.next_follow_up} />
          {lead.next_follow_up && <p className="text-xs text-muted-foreground mt-1">Current: {format(new Date(lead.next_follow_up), "PPP")}</p>}
        </div>
        <Link href={`/clinic/${id}/edit`} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">Edit full lead</Link>
      </section>

      <section className="rounded-button border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Notes from sales rep</h2>
        <ClinicActivityForm leadId={id} />
      </section>

      <section className="rounded-button border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Communication history & timeline</h2>
        <ul className="space-y-4">
          {activities.length === 0 ? (
            <li className="text-sm text-muted-foreground">No activities yet.</li>
          ) : (
            activities.map((a: { id: string; type: string; content: string | null; created_at: string; profiles?: { full_name: string } | null }) => (
              <li key={a.id} className="flex gap-3 text-sm border-l-2 border-primary/30 pl-4 py-2">
                <span className="text-muted-foreground shrink-0">{format(new Date(a.created_at), "MMM d, HH:mm")}</span>
                <div>
                  <span className="font-medium text-foreground capitalize">{a.type.replace("_", " ")}</span>
                  {" · "}
                  {(a.profiles as { full_name?: string } | null)?.full_name ?? "—"}
                  {a.content && <p className="text-muted-foreground mt-0.5">{a.content}</p>}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-button border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Add sprint (15-day trial)</h2>
        <SprintForm leadId={id} />
      </section>

      {sprints.length > 0 && (
        <section className="rounded-button border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Sprint performance summary</h2>
          <ul className="space-y-4">
            {sprints.map((s: { id: string; start_date: string; end_date: string; status: string; appointment_confirmations?: number | null; calls_handled?: number | null; rescheduled?: number | null; feedback?: string | null }) => (
              <li key={s.id} className="rounded-button border border-border bg-muted/30 p-4">
                <p className="font-medium text-foreground">{format(new Date(s.start_date), "PP")} – {format(new Date(s.end_date), "PP")} · {s.status}</p>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm">
                  <div><dt className="text-muted-foreground">Confirmations</dt><dd className="font-medium">{s.appointment_confirmations ?? 0}</dd></div>
                  <div><dt className="text-muted-foreground">Calls handled</dt><dd className="font-medium">{s.calls_handled ?? 0}</dd></div>
                  <div><dt className="text-muted-foreground">Rescheduled</dt><dd className="font-medium">{s.rescheduled ?? 0}</dd></div>
                  {s.feedback && <div className="sm:col-span-2"><dt className="text-muted-foreground">Feedback</dt><dd className="text-foreground">{s.feedback}</dd></div>}
                </dl>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-button border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Subscription details</h2>
        <SubscriptionForm leadId={id} />
      </section>

      {subscriptions.length > 0 && (
        <section className="rounded-button border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Active subscriptions</h2>
          <ul className="space-y-2 text-sm">
            {subscriptions.map((s: { id: string; plan_type: string; contract_type: string; start_date: string; renewal_date: string; minutes_allocation?: number | null }) => (
              <li key={s.id}>
                {PLAN_LABELS[s.plan_type as PlanType]} · {CONTRACT_LABELS[s.contract_type as ContractType]}
                {" · "}Renewal: {format(new Date(s.renewal_date), "PP")}
                {s.minutes_allocation != null && ` · ${s.minutes_allocation} min`}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
