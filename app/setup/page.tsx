import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-card-foreground mb-2">
          Supabase configuration required
        </h1>
        <p className="text-sm text-muted-foreground mb-3">
          Create a file named <code className="bg-muted px-1 rounded">.env.local</code> in the same folder as <code className="bg-muted px-1 rounded">package.json</code> and add:
        </p>
        <pre className="bg-muted rounded-lg p-4 text-xs text-foreground overflow-x-auto mb-4 font-mono">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
        </pre>
        <p className="text-sm text-muted-foreground mb-2">
          Copy <strong>Project URL</strong> and <strong>anon public</strong> from Supabase → Settings → API. Run the SQL in <code className="bg-muted px-1 rounded">supabase/migrations/20240309000001_initial_schema.sql</code> in the Supabase SQL Editor once.
        </p>
        <a
          href="https://supabase.com/dashboard/project/_/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-sm inline-block mb-4"
        >
          Open Supabase API settings →
        </a>
        <div className="border-t border-border pt-4 mt-2">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Still seeing this?</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside mb-4">
            <li>Put <code className="bg-muted px-0.5 rounded">.env.local</code> in the project root (where <code className="bg-muted px-0.5 rounded">package.json</code> is)</li>
            <li>Stop the dev server (Ctrl+C) and run <code className="bg-muted px-0.5 rounded">npm run dev</code> again</li>
            <li>On Netlify: set the same variables in Site settings → Environment variables</li>
          </ul>
        </div>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Retry after adding .env.local
        </Link>
      </div>
    </div>
  );
}
