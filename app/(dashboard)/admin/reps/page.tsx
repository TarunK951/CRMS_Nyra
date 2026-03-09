import { createClient } from "@/lib/supabase/server";
import { format, startOfMonth, endOfMonth } from "date-fns";
import Link from "next/link";
import { RepProgressCharts } from "@/components/RepProgressCharts";

export default async function AdminRepsPage() {
  const supabase = await createClient();
  const { data: reps } = await supabase.from("profiles").select("id, full_name, email").eq("role", "sales_rep");
  const now = new Date();
  const monthStart = startOfMonth(now).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(now).toISOString().slice(0, 10);

  const leaderboard: { rep_id: string; full_name: string; points: number }[] = [];
  for (const rep of reps ?? []) {
    const { data: events } = await supabase
      .from("gamification_events")
      .select("points")
      .eq("rep_id", rep.id)
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd + "T23:59:59");
    const points = (events ?? []).reduce((s, e) => s + e.points, 0);
    leaderboard.push({ rep_id: rep.id, full_name: rep.full_name ?? "—", points });
  }
  leaderboard.sort((a, b) => b.points - a.points);

  const { data: dailyToday } = await supabase
    .from("daily_activities")
    .select("rep_id, clinic_visits, doctor_meetings, pitches_delivered, sprints_sold, subscriptions_closed")
    .eq("date", now.toISOString().slice(0, 10));

  const { data: monthActivities } = await supabase
    .from("daily_activities")
    .select("rep_id, clinic_visits, doctor_meetings, pitches_delivered, sprints_sold, subscriptions_closed")
    .gte("date", monthStart)
    .lte("date", monthEnd);

  const dailyByRep = new Map(dailyToday?.map((d) => [d.rep_id, d]) ?? []);

  const monthByRep = new Map<
    string,
    { visits: number; meetings: number; pitches: number; sprints: number; subs: number }
  >();
  for (const r of reps ?? []) {
    monthByRep.set(r.id, { visits: 0, meetings: 0, pitches: 0, sprints: 0, subs: 0 });
  }
  for (const a of monthActivities ?? []) {
    const row = monthByRep.get(a.rep_id);
    if (row) {
      row.visits += a.clinic_visits ?? 0;
      row.meetings += a.doctor_meetings ?? 0;
      row.pitches += a.pitches_delivered ?? 0;
      row.sprints += a.sprints_sold ?? 0;
      row.subs += a.subscriptions_closed ?? 0;
    }
  }
  const monthChartData = (reps ?? []).map((r) => ({
    name: (r.full_name ?? "—").split(" ")[0] || "Rep",
    fullName: r.full_name ?? "—",
    visits: monthByRep.get(r.id)?.visits ?? 0,
    meetings: monthByRep.get(r.id)?.meetings ?? 0,
    pitches: monthByRep.get(r.id)?.pitches ?? 0,
    sprints: monthByRep.get(r.id)?.sprints ?? 0,
    subs: monthByRep.get(r.id)?.subs ?? 0,
    points: leaderboard.find((l) => l.rep_id === r.id)?.points ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">Team progress</h1>
        <p className="text-sm text-muted-foreground mt-0.5">View everyone&apos;s data and compare reps</p>
      </div>

      <RepProgressCharts data={monthChartData} monthLabel={format(now, "MMMM yyyy")} />

      <section>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Leaderboard — {format(now, "MMMM yyyy")}</h2>
        <div className="rounded-button border border-border overflow-hidden bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-foreground">Rank</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Rep</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr key={row.rep_id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{row.full_name}</td>
                  <td className="px-4 py-3 text-right text-foreground">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Today&apos;s activity</h2>
        <div className="rounded-button border border-border overflow-hidden bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-foreground">Rep</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Visits</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Meetings</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Pitches</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Sprints</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Subs</th>
              </tr>
            </thead>
            <tbody>
              {(reps ?? []).map((rep) => {
                const d = dailyByRep.get(rep.id);
                return (
                  <tr key={rep.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{rep.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{d?.clinic_visits ?? 0}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{d?.doctor_meetings ?? 0}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{d?.pitches_delivered ?? 0}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{d?.sprints_sold ?? 0}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{d?.subscriptions_closed ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Link href="/admin/war-room" className="btn-secondary mt-3">Daily War Room →</Link>
      </section>
    </div>
  );
}
