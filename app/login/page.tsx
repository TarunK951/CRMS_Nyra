"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      const msg = signInError.message;
      if (msg.toLowerCase().includes("rate limit")) {
        setError(
          "Too many login attempts. Wait a few minutes or in Supabase turn OFF \"Confirm email\" under Auth → Providers → Email."
        );
      } else if (msg.toLowerCase().includes("invalid login") || msg.toLowerCase().includes("email not confirmed")) {
        setError("Invalid email or password. If you just signed up, turn OFF \"Confirm email\" in Supabase Auth → Providers → Email and try again.");
      } else {
        setError(msg);
      }
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background px-4">
      <div className="w-full max-w-[400px] rounded-button border border-border bg-card p-8 shadow-card">
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="Nyra" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="text-center text-xl font-semibold text-foreground">Sign in</h1>
        <p className="text-center text-sm text-muted-foreground mt-1 mb-6">Nyra Sales Command Center</p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground input-focus"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
