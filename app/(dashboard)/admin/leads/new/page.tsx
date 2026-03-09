import LeadForm from "@/components/LeadForm";
import Link from "next/link";

export default function NewLeadPageAdmin() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/leads" className="text-muted-foreground hover:text-foreground">← Leads</Link>
        <h1 className="text-2xl font-semibold text-foreground">Add lead</h1>
      </div>
      <LeadForm redirectTo="/admin/leads" assignToRepId={null} />
    </div>
  );
}
