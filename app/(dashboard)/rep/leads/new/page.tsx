import LeadForm from "@/components/LeadForm";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NewLeadPageRep() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rep/leads" className="text-muted-foreground hover:text-foreground">← Leads</Link>
        <h1 className="text-2xl font-semibold text-foreground">Add lead</h1>
      </div>
      <LeadForm redirectTo="/rep/leads" assignToRepId={user?.id ?? undefined} />
    </div>
  );
}
