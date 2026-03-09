import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

export default async function WarRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  const { data: reps } = await supabase.from("profiles").select("id, full_name").in("role", ["sales_rep"]);
  const { data: activities } = await supabase
    .from("daily_activities")
    .select("*")
    .eq("date", date);

  const byRep = new Map<string, { full_name: string; clinic_visits: number; doctor_meetings: number; pitches_delivered: number; sprints_sold: number; subscriptions_closed: number }>();
  for (const r of reps ?? []) {
    byRep.set(r.id, {
      full_name: r.full_name ?? "—",
      clinic_visits: 0,
      doctor_meetings: 0,
      pitches_delivered: 0,
      sprints_sold: 0,
      subscriptions_closed: 0,
    });
  }
  for (const a of activities ?? []) {
    const row = byRep.get(a.rep_id);
    if (row) {
      row.clinic_visits = a.clinic_visits;
      row.doctor_meetings = a.doctor_meetings;
      row.pitches_delivered = a.pitches_delivered;
      row.sprints_sold = a.sprints_sold;
      row.subscriptions_closed = a.subscriptions_closed;
    }
  }

  const rows = Array.from(byRep.entries()).map(([repId, row]) => ({ repId, ...row }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Daily War Room</h1>
        <form method="get" className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Date</label>
          <input type="date" name="date" defaultValue={date} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
          <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">View</button>
        </form>
      </div>
      <p className="text-sm text-muted-foreground">Rep | Visits | Meetings | Pitches | Sprints | Subs — {format(new Date(date), "PPP")}</p>
      <div className="overflow-x-auto rounded-card border border-border bg-card shadow-card">
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
            {rows.map((row) => (
              <tr key={row.repId} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{row.full_name}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{row.clinic_visits}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{row.doctor_meetings}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{row.pitches_delivered}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{row.sprints_sold}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{row.subscriptions_closed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p className="text-center text-muted-foreground py-8">No reps found.</p>}
    </div>
  );
}
