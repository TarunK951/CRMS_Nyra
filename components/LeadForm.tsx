"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLead } from "@/app/actions/leads";
import { PIPELINE_STAGES, LEAD_STATUS_LABELS } from "@/types/database";
import type { LeadStatus } from "@/types/database";

const LEAD_SOURCES = ["Walk-in", "Referral", "Google", "Practo", "Other"];
const SPECIALIZATIONS = ["Dental", "General", "Ortho", "Other"];

interface LeadFormProps {
  redirectTo: string;
  assignToRepId?: string | null;
  initial?: Partial<{
    clinic_name: string;
    doctor_name: string;
    specialization: string;
    phone: string;
    address: string;
    area: string;
    city: string;
    monthly_appointments: number;
    branch_count: number;
    lead_source: string;
    lead_status: LeadStatus;
    next_follow_up: string | null;
  }>;
  leadId?: string;
}

export default function LeadForm({ redirectTo, assignToRepId, initial, leadId }: LeadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="max-w-2xl space-y-4"
      action={async (formData: FormData) => {
        setError(null);
        setLoading(true);
        const res = await createLead(formData, assignToRepId ?? undefined, leadId);
        setLoading(false);
        if (res.error) {
          setError(res.error);
          return;
        }
        router.push(redirectTo);
        router.refresh();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Clinic name *</label>
          <input name="clinic_name" required defaultValue={initial?.clinic_name} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Doctor name *</label>
          <input name="doctor_name" required defaultValue={initial?.doctor_name} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Specialization</label>
          <select name="specialization" defaultValue={initial?.specialization || ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground">
            <option value="">Select</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Phone *</label>
          <input name="phone" type="tel" required defaultValue={initial?.phone} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Address</label>
        <input name="address" defaultValue={initial?.address} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Area</label>
          <input name="area" defaultValue={initial?.area} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">City</label>
          <input name="city" defaultValue={initial?.city} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Monthly appointments (est.)</label>
          <input name="monthly_appointments" type="number" min={0} defaultValue={initial?.monthly_appointments} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Number of branches</label>
          <input name="branch_count" type="number" min={1} defaultValue={initial?.branch_count ?? 1} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Lead source</label>
        <select name="lead_source" defaultValue={initial?.lead_source || ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground">
          <option value="">Select</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {typeof initial !== "undefined" && (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select name="lead_status" defaultValue={initial?.lead_status || "new_lead"} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground">
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Next follow-up date</label>
            <input name="next_follow_up" type="date" defaultValue={initial?.next_follow_up ?? ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground" />
          </div>
        </>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {loading ? "Saving..." : leadId ? "Update lead" : "Create lead"}
      </button>
    </form>
  );
}
