"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLeadNextFollowUp } from "@/app/actions/leads";

export function NextFollowUpForm({ leadId, current }: { leadId: string; current: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(current ?? new Date().toISOString().slice(0, 10));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await updateLeadNextFollowUp(leadId, value || null);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground input-focus"
      />
      <button type="submit" disabled={loading} className="rounded-button bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? "Saving..." : "Set"}
      </button>
    </form>
  );
}
