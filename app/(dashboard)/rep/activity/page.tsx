import { createClient } from "@/lib/supabase/server";
import DailyActivityForm from "@/components/DailyActivityForm";

export default async function RepActivityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const { data: todayActivity } = await supabase
    .from("daily_activities")
    .select("*")
    .eq("rep_id", user.id)
    .eq("date", today)
    .single();

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-foreground">Daily activity</h1>
      <p className="text-sm text-muted-foreground">Log your visits, meetings, pitches, sprints sold, and subscriptions closed for today.</p>
      <DailyActivityForm initial={todayActivity} repId={user.id} />
    </div>
  );
}
