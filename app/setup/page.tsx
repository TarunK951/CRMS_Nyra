import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background px-4 py-8">
      <div className="w-full max-w-md rounded-button border border-border bg-card p-8 shadow-card">
        <h1 className="text-xl font-semibold text-foreground mb-2">Setup required</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Add your Supabase URL and anon key. Create <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">.env.local</code> in the project root:
        </p>
        <pre className="bg-muted rounded-button p-4 text-xs text-foreground overflow-x-auto mb-4 font-mono">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
        </pre>
        <p className="text-sm text-muted-foreground mb-4">
          Get these from Supabase → Settings → API. Then create the database tables:
        </p>
        <div className="rounded-button border border-border bg-muted/50 p-4 mb-4">
          <p className="text-sm font-medium text-foreground mb-1">Create tables (fixes &quot;table public.leads not found&quot;)</p>
          <p className="text-xs text-muted-foreground">Supabase Dashboard → <strong>SQL Editor</strong> → New query → paste the full contents of <code className="bg-background px-1 rounded">supabase/schema_full.sql</code> → <strong>Run</strong>. Then optionally: Settings → API → Reload schema cache.</p>
        </div>
        <a
          href="https://supabase.com/dashboard/project/_/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:underline inline-block mb-4"
        >
          Open Supabase API settings →
        </a>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">Retry after setup</Link>
        </div>
      </div>
    </div>
  );
}
