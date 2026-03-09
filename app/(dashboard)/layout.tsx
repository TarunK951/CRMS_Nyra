import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/AppSidebar";
import { AppMobileNav } from "@/components/AppMobileNav";
import { getUnreadCount } from "@/app/actions/notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as "admin" | "sales_rep" | "operations") ?? "sales_rep";
  const unreadCount = await getUnreadCount(user.id);

  return (
    <div className="min-h-screen flex">
      <AppSidebar userEmail={user.email ?? null} userRole={role} unreadCount={unreadCount} />
      <div className="flex-1 flex flex-col lg:pl-52">
        <AppMobileNav userEmail={user.email ?? null} userRole={role} unreadCount={unreadCount} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
