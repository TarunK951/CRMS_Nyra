import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function BackToLeadsLink() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <span className="text-sm text-muted-foreground">← Back</span>;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const href = profile?.role === "admin" || profile?.role === "operations" ? "/admin/leads" : "/rep/leads";
  return <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">← Back to leads</Link>;
}
