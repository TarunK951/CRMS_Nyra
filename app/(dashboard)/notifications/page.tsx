import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { markNotificationsRead } from "@/app/actions/notifications";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: list } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  await markNotificationsRead(user.id);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
      <ul className="space-y-2">
        {(list ?? []).map((n: { id: string; title: string; body: string | null; read: boolean; created_at: string }) => (
          <li key={n.id} className={`rounded-button border border-border bg-card p-3 shadow-card ${!n.read ? "border-primary/50" : ""}`}>
            <p className="font-medium text-foreground">{n.title}</p>
            {n.body && <p className="text-sm text-muted-foreground mt-1">{n.body}</p>}
            <p className="text-xs text-muted-foreground mt-2">{format(new Date(n.created_at), "PPp")}</p>
          </li>
        ))}
      </ul>
      {(!list || list.length === 0) && <p className="text-muted-foreground">No notifications.</p>}
    </div>
  );
}
