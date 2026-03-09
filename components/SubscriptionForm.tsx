"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSubscription } from "@/app/actions/subscriptions";
import { PLAN_LABELS, CONTRACT_LABELS } from "@/types/database";
import type { PlanType, ContractType } from "@/types/database";

const PLAN_TYPES: PlanType[] = ["micro", "small", "growth", "enterprise"];
const CONTRACT_TYPES: ContractType[] = ["monthly", "quarterly", "half_year", "yearly"];

export default function SubscriptionForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const start = new Date().toISOString().slice(0, 10);
  const renewal = new Date();
  renewal.setMonth(renewal.getMonth() + 1);
  const defaultRenewal = renewal.toISOString().slice(0, 10);

  return (
    <form
      className="space-y-3"
      action={async (formData: FormData) => {
        setLoading(true);
        await createSubscription(leadId, formData);
        setLoading(false);
        router.refresh();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Plan type</label>
          <select name="plan_type" required className="w-full input-focus rounded-button border border-border bg-background px-3 py-2 text-foreground">
            {PLAN_TYPES.map((p) => (
              <option key={p} value={p}>{PLAN_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Contract type</label>
          <select name="contract_type" required className="w-full input-focus rounded-button border border-border bg-background px-3 py-2 text-foreground">
            {CONTRACT_TYPES.map((c) => (
              <option key={c} value={c}>{CONTRACT_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Start date</label>
          <input name="start_date" type="date" required defaultValue={start} className="w-full input-focus rounded-button border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Renewal date</label>
          <input name="renewal_date" type="date" required defaultValue={defaultRenewal} className="w-full input-focus rounded-button border border-border bg-background px-3 py-2 text-foreground" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Minutes allocation</label>
          <input name="minutes_allocation" type="number" min={0} className="w-full input-focus rounded-button border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Branch count</label>
          <input name="branch_count" type="number" min={1} defaultValue={1} className="w-full input-focus rounded-button border border-border bg-background px-3 py-2 text-foreground" />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
        {loading ? "Saving..." : "Add subscription"}
      </button>
    </form>
  );
}
