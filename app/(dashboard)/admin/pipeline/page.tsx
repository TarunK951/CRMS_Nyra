import { createClient } from "@/lib/supabase/server";
import { PipelineBoard } from "@/components/PipelineBoard";
import type { Lead } from "@/types/database";

export default async function AdminPipelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Pipeline</h1>
      <PipelineBoard initialLeads={(leads ?? []) as Lead[]} repId={user?.id ?? null} />
    </div>
  );
}
