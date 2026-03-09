import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SeedButton } from "@/components/SeedButton";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default async function RepDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = startOfMonth(new Date()).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(new Date()).toISOString().slice(0, 10);

  const [myLeadsRes, todayActivityRes, monthEventsRes, monthSubsRes] = await Promise.all([
    supabase.from("leads").select("id").eq("assigned_rep_id", user.id),
    supabase.from("daily_activities").select("*").eq("rep_id", user.id).eq("date", today).single(),
    supabase.from("gamification_events").select("points").eq("rep_id", user.id).gte("created_at", monthStart).lte("created_at", monthEnd + "T23:59:59"),
    supabase.from("subscriptions").select("id, lead_id").gte("created_at", monthStart).lte("created_at", monthEnd + "T23:59:59"),
  ]);

  const myLeads = myLeadsRes.data ?? [];
  const todayActivity = todayActivityRes.data;
  const monthEvents = monthEventsRes.data ?? [];
  const monthSubs = monthSubsRes.data ?? [];
  const myLeadIds = new Set(myLeads.map((l) => l.id));
  const mySubsThisMonth = monthSubs.filter((s) => myLeadIds.has(s.lead_id)).length;
  const monthlyPoints = monthEvents.reduce((s, e) => s + e.points, 0);
  const totalLeads = myLeads.length;
  const conversionRate = totalLeads > 0 ? Math.round((mySubsThisMonth / totalLeads) * 100) : 0;
  const revenueEst = mySubsThisMonth * 199;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Daily and monthly performance</p>
      </div>
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
          <div className="rounded-button border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">Visits</p>
            <p className="text-xl font-bold text-foreground">{todayActivity?.clinic_visits ?? 0}</p>
          </div>
          <div className="rounded-button border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">Meetings</p>
            <p className="text-xl font-bold text-foreground">{todayActivity?.doctor_meetings ?? 0}</p>
          </div>
          <div className="rounded-button border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">Pitches</p>
            <p className="text-xl font-bold text-foreground">{todayActivity?.pitches_delivered ?? 0}</p>
          </div>
          <div className="rounded-button border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">Sprints</p>
            <p className="text-xl font-bold text-foreground">{todayActivity?.sprints_sold ?? 0}</p>
          </div>
          <div className="rounded-button border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">Subs</p>
            <p className="text-xl font-bold text-foreground">{todayActivity?.subscriptions_closed ?? 0}</p>
          </div>
        </div>
        <Link href="/rep/activity" className="btn-primary mt-3">Log daily activity</Link>
      </section>
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">This month ({format(new Date(), "MMMM")})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-button border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">Subscriptions closed</p>
            <p className="text-xl font-bold text-foreground">{mySubsThisMonth}</p>
          </div>
          <div className="rounded-button border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">Revenue (est.)</p>
            <p className="text-xl font-bold text-foreground">₹{revenueEst.toLocaleString()}</p>
          </div>
          <div className="rounded-button border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">Conversion rate</p>
            <p className="text-xl font-bold text-foreground">{conversionRate}%</p>
          </div>
          <div className="rounded-button border border-border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">Points</p>
            <p className="text-xl font-bold text-foreground">{monthlyPoints}</p>
          </div>
        </div>
      </section>
      <section>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/rep/leads" className="rounded-button border border-border bg-card p-5 shadow-card card-hover flex-1 min-w-[120px]">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Leads</p>
            <p className="text-xl font-bold text-foreground mt-1">{totalLeads}</p>
          </Link>
          <Link href="/rep/pipeline" className="rounded-button border border-border bg-card p-5 shadow-card card-hover flex-1 min-w-[120px]">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pipeline</p>
            <p className="text-xl font-bold text-foreground mt-1">View</p>
          </Link>
          <Link href="/rep/leaderboard" className="rounded-button border border-border bg-card p-5 shadow-card card-hover flex-1 min-w-[120px]">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Leaderboard</p>
            <p className="text-xl font-bold text-foreground mt-1">→</p>
          </Link>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <SeedButton />
        </div>
      </section>
    </div>
  );
}
