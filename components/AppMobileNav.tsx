"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";
import { Bell, LogOut } from "lucide-react";

interface AppMobileNavProps {
  userEmail: string | null;
  userRole: UserRole;
  unreadCount?: number;
}

const adminLinks = [
  { href: "/admin", label: "Center" },
  { href: "/admin/war-room", label: "War Room" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/pipeline", label: "Pipeline" },
  { href: "/admin/subscriptions", label: "Subs" },
  { href: "/admin/reps", label: "Reps" },
];

const repLinks = [
  { href: "/rep", label: "Home" },
  { href: "/rep/leads", label: "Leads" },
  { href: "/rep/pipeline", label: "Pipeline" },
  { href: "/rep/activity", label: "Activity" },
  { href: "/rep/leaderboard", label: "Board" },
];

export function AppMobileNav({ userEmail, userRole, unreadCount = 0 }: AppMobileNavProps) {
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
    <header className="lg:hidden sticky top-0 z-10 border-b border-border bg-card">
      <div className="flex h-13 items-center justify-between px-4">
        <Link href={userRole === "admin" || userRole === "operations" ? "/admin" : "/rep"} className="flex items-center gap-2">
          <img src="/logo.svg" alt="Nyra" className="h-6 w-auto" />
          <span className="font-semibold text-sm text-foreground">Nyra CRM</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/notifications" className="relative p-2.5 text-muted-foreground hover:text-foreground rounded-button">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <button onClick={handleSignOut} className="p-2.5 text-muted-foreground hover:text-foreground rounded-button" aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
      <nav className="flex gap-1.5 overflow-x-auto px-3 pb-2.5 scrollbar-hide">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`shrink-0 rounded-button px-3 py-2 text-sm font-medium ${pathname === href ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
