"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";
import { Bell } from "lucide-react";

interface DashboardNavProps {
  userEmail: string | null;
  userRole: UserRole;
  unreadCount?: number;
}

const adminLinks = [
  { href: "/admin", label: "Command Center" },
  { href: "/admin/war-room", label: "War Room" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/pipeline", label: "Pipeline" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/reps", label: "Reps" },
];

const repLinks = [
  { href: "/rep", label: "Dashboard" },
  { href: "/rep/leads", label: "Leads" },
  { href: "/rep/pipeline", label: "Pipeline" },
  { href: "/rep/activity", label: "Daily Activity" },
  { href: "/rep/leaderboard", label: "Leaderboard" },
];

export function DashboardNav({ userEmail, userRole, unreadCount = 0 }: DashboardNavProps) {
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
    <header className="sticky top-0 z-10 border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={userRole === "admin" || userRole === "operations" ? "/admin" : "/rep"} className="flex items-center gap-2">
            <img src="/logo.svg" alt="Nyra" className="h-8 w-auto object-contain" />
            <span className="font-semibold text-foreground">Nyra CRM</span>
          </Link>
          <nav className="hidden gap-4 md:flex">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm ${pathname === href ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/notifications" className="relative p-1.5 text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <span className="text-sm text-muted-foreground truncate max-w-[140px]">{userEmail}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-2 md:hidden">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${pathname === href ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
