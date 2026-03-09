import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { PLAN_LABELS, CONTRACT_LABELS } from "@/types/database";
import type { PlanType, ContractType } from "@/types/database";

const MRR_PER_PLAN: Record<PlanType, number> = {
  micro: 99,
  small: 199,
  growth: 399,
  enterprise: 999,
};

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, leads!inner(clinic_name, id)")
    .order("renewal_date", { ascending: true });

  let mrr = 0;
  const byContract: Record<ContractType, number> = {
    monthly: 1,
    quarterly: 1 / 3,
    half_year: 1 / 6,
    yearly: 1 / 12,
  };
  for (const s of subscriptions ?? []) {
    const base = MRR_PER_PLAN[s.plan_type as PlanType] ?? 0;
    const factor = byContract[s.contract_type as ContractType] ?? 1;
    mrr += base * factor;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Subscriptions</h1>
        <div className="rounded-xl border border-border bg-card px-4 py-2">
          <p className="text-xs text-muted-foreground">MRR (est.)</p>
          <p className="text-xl font-semibold text-foreground">₹{Math.round(mrr).toLocaleString()}</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-foreground">Clinic</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Plan</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Contract</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Start</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Renewal</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(subscriptions ?? []).map((s: { id: string; lead_id: string; plan_type: string; contract_type: string; start_date: string; renewal_date: string; leads: { clinic_name: string; id: string } }) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{s.leads?.clinic_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{PLAN_LABELS[s.plan_type as PlanType]}</td>
                <td className="px-4 py-3 text-muted-foreground">{CONTRACT_LABELS[s.contract_type as ContractType]}</td>
                <td className="px-4 py-3 text-muted-foreground">{format(new Date(s.start_date), "PP")}</td>
                <td className="px-4 py-3 text-muted-foreground">{format(new Date(s.renewal_date), "PP")}</td>
                <td className="px-4 py-3">
                  <Link href={`/clinic/${s.lead_id}`} className="text-primary hover:underline">View clinic</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(!subscriptions || subscriptions.length === 0) && (
        <p className="text-center text-muted-foreground py-8">No subscriptions yet.</p>
      )}
    </div>
  );
}
