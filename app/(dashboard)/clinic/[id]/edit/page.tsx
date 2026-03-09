import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import type { LeadStatus } from "@/types/database";

export default async function ClinicEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lead, error } = await supabase.from("leads").select("*").eq("id", id).single();
  if (error || !lead) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href={`/clinic/${id}`} className="text-muted-foreground hover:text-foreground">← Clinic</Link>
        <h1 className="text-2xl font-semibold text-foreground">Edit lead</h1>
      </div>
      <LeadForm
        redirectTo={`/clinic/${id}`}
        assignToRepId={lead.assigned_rep_id}
        initial={{
          clinic_name: lead.clinic_name,
          doctor_name: lead.doctor_name,
          specialization: lead.specialization,
          phone: lead.phone,
          address: lead.address,
          area: lead.area,
          city: lead.city,
          monthly_appointments: lead.monthly_appointments ?? undefined,
          branch_count: lead.branch_count,
          lead_source: lead.lead_source,
          lead_status: lead.lead_status as LeadStatus,
          next_follow_up: lead.next_follow_up ?? null,
        }}
        leadId={id}
      />
    </div>
  );
}
