"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";
import {
  LayoutDashboard,
  Users,
  Kanban,
  CreditCard,
  Trophy,
  Calendar,
  Bell,
  LogOut,
  Mic2,
} from "lucide-react";

interface AppSidebarProps {
  userEmail: string | null;
  userRole: UserRole;
  unreadCount?: number;
}

const adminLinks = [
  { href: "/admin", label: "Command Center", icon: LayoutDashboard },
  { href: "/admin/war-room", label: "War Room", icon: Mic2 },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/reps", label: "Reps", icon: Trophy },
];

const repLinks = [
  { href: "/rep", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rep/leads", label: "Leads", icon: Users },
  { href: "/rep/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/rep/activity", label: "Daily Activity", icon: Calendar },
  { href: "/rep/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function AppSidebar({ userEmail, userRole, unreadCount = 0 }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const links = userRole === "admin" || userRole === "operations" ? adminLinks : repLinks;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-52 lg:fixed lg:inset-y-0 lg:z-20 lg:border-r lg:border-border lg:bg-card">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-border">
        <img src="/logo.svg" alt="Nyra" className="h-7 w-auto" />
        <span className="font-semibold text-sm text-foreground">Nyra CRM</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 rounded-button px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-border space-y-0.5">
        <Link
          href="/notifications"
          className="flex items-center gap-2.5 rounded-button px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground relative"
        >
          <Bell className="h-4 w-4 shrink-0" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto h-5 min-w-[20px] rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <div className="px-3 py-2 text-xs text-muted-foreground truncate" title={userEmail ?? ""}>
          {userEmail}
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-button px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
