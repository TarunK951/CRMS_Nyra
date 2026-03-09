import { createClient } from "@/lib/supabase/server";
import { format, startOfMonth, endOfMonth } from "date-fns";
import Link from "next/link";

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

  const dailyByRep = new Map(dailyToday?.map((d) => [d.rep_id, d]) ?? []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">Rep performance</h1>

      <section>
        <h2 className="text-lg font-medium text-foreground mb-3">Leaderboard (this month — {format(now, "MMMM yyyy")})</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
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
        <h2 className="text-lg font-medium text-foreground mb-3">Today&apos;s activity</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
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
        <Link href="/admin/war-room" className="mt-2 inline-block text-sm text-primary hover:underline">Daily War Room →</Link>
      </section>
    </div>
  );
}
