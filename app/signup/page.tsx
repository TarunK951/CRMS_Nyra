"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "sales_rep">("sales_rep");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    setLoading(false);
    if (signUpError) {
      const msg = signUpError.message;
      if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("email rate limit")) {
        setError(
          "Too many sign-up emails. In Supabase Dashboard go to Authentication → Providers → Email and turn OFF \"Confirm email\", then try again."
        );
      } else if (msg.toLowerCase().includes("already registered")) {
        setError("This email is already registered. Sign in instead.");
      } else {
        setError(msg);
      }
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background px-4 py-10">
      <div className="w-full max-w-[400px] rounded-button border border-border bg-card p-8 shadow-card">
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="Nyra" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="text-center text-xl font-semibold text-foreground">Create account</h1>
        <p className="text-center text-sm text-muted-foreground mt-1 mb-6">Nyra Sales Command Center</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground input-focus"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground input-focus"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground input-focus"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "sales_rep")}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground input-focus"
            >
              <option value="sales_rep">Sales Rep</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
