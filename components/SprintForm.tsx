"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSprint } from "@/app/actions/sprints";

export default function SprintForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 15);
  const defaultEnd = endDate.toISOString().slice(0, 10);
  const defaultStart = new Date().toISOString().slice(0, 10);

  return (
    <form
      className="space-y-3"
      action={async (formData: FormData) => {
        setLoading(true);
        await createSprint(leadId, formData);
        setLoading(false);
        router.refresh();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Start date</label>
          <input name="start_date" type="date" required defaultValue={defaultStart} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">End date (15-day sprint)</label>
          <input name="end_date" type="date" required defaultValue={defaultEnd} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Status</label>
        <select name="status" defaultValue="active" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground">
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Appointment confirmations</label>
          <input name="appointment_confirmations" type="number" min={0} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Calls handled</label>
          <input name="calls_handled" type="number" min={0} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Rescheduled</label>
          <input name="rescheduled" type="number" min={0} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Feedback</label>
        <textarea name="feedback" rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
      </div>
      <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? "Saving..." : "Add sprint"}
      </button>
    </form>
  );
}
