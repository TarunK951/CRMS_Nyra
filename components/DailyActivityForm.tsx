"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logDailyActivity } from "@/app/actions/daily-activity";
import type { DailyActivity } from "@/types/database";

export default function DailyActivityForm({
  initial,
  repId,
}: {
  initial: DailyActivity | null;
  repId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState(initial?.clinic_visits ?? 0);
  const [meetings, setMeetings] = useState(initial?.doctor_meetings ?? 0);
  const [pitches, setPitches] = useState(initial?.pitches_delivered ?? 0);
  const [sprints, setSprints] = useState(initial?.sprints_sold ?? 0);
  const [subs, setSubs] = useState(initial?.subscriptions_closed ?? 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await logDailyActivity(repId, { clinic_visits: visits, doctor_meetings: meetings, pitches_delivered: pitches, sprints_sold: sprints, subscriptions_closed: subs });
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Clinic visits</label>
          <input type="number" min={0} value={visits} onChange={(e) => setVisits(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Doctor meetings</label>
          <input type="number" min={0} value={meetings} onChange={(e) => setMeetings(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Pitches delivered</label>
          <input type="number" min={0} value={pitches} onChange={(e) => setPitches(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Sprints sold</label>
          <input type="number" min={0} value={sprints} onChange={(e) => setSprints(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Subscriptions closed</label>
          <input type="number" min={0} value={subs} onChange={(e) => setSubs(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? "Saving..." : "Save daily activity"}
      </button>
    </form>
  );
}
