import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LEAD_STATUS_LABELS } from "@/types/database";
import type { LeadStatus } from "@/types/database";

export default async function RepLeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: leads } = await supabase
    .from("leads")
    .select("id, clinic_name, doctor_name, city, lead_status, created_at")
    .eq("assigned_rep_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">My Leads</h1>
        <Link href="/rep/leads/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Add lead
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-foreground">Clinic</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Doctor</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">City</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => (
              <tr key={lead.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">{lead.clinic_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.doctor_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.city}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {LEAD_STATUS_LABELS[lead.lead_status as LeadStatus]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/clinic/${lead.id}`} className="text-primary hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(!leads || leads.length === 0) && (
        <p className="text-center text-muted-foreground py-8">No leads yet. Add your first lead.</p>
      )}
    </div>
  );
}
