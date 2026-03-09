import { createClient } from "@/lib/supabase/server";
import { format, startOfMonth } from "date-fns";

export default async function RepLeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const monthStart = startOfMonth(now).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data: reps } = await supabase.from("profiles").select("id, full_name").eq("role", "sales_rep");
  const leaderboard: { rep_id: string; full_name: string; points: number; isMe: boolean }[] = [];
  for (const rep of reps ?? []) {
    const { data: events } = await supabase
      .from("gamification_events")
      .select("points")
      .eq("rep_id", rep.id)
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd + "T23:59:59");
    const points = (events ?? []).reduce((s, e) => s + e.points, 0);
    leaderboard.push({ rep_id: rep.id, full_name: rep.full_name ?? "—", points, isMe: rep.id === user.id });
  }
  leaderboard.sort((a, b) => b.points - a.points);

  const myRank = leaderboard.findIndex((r) => r.rep_id === user.id) + 1;
  const myPoints = leaderboard.find((r) => r.rep_id === user.id)?.points ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Leaderboard</h1>
      <p className="text-sm text-muted-foreground">Resets monthly. Your rank: <strong>{myRank}</strong> · Your points: <strong>{myPoints}</strong> ({format(now, "MMMM yyyy")})</p>
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
              <tr key={row.rep_id} className={`border-b border-border last:border-0 ${row.isMe ? "bg-primary/10" : ""}`}>
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-foreground">{row.full_name} {row.isMe ? "(You)" : ""}</td>
                <td className="px-4 py-3 text-right text-foreground">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
