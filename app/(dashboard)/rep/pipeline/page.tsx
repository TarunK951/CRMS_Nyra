import { createClient } from "@/lib/supabase/server";
import { PipelineBoard } from "@/components/PipelineBoard";
import type { Lead } from "@/types/database";

export default async function RepPipelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("assigned_rep_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Pipeline</h1>
      <PipelineBoard initialLeads={(leads ?? []) as Lead[]} repId={user.id} />
    </div>
  );
}
