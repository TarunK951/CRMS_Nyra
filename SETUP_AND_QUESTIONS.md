# Setup status and clarification answers

## Terminal output you saw

- **`GET /setup 200`** – The setup page is loading correctly (200 = success).
- **`Serializing big strings (133kiB) impacts deserialization performance`** – This is a **Next.js dev-only webpack warning**. It does not break the app and is safe to ignore. It often comes from large dependencies and goes away in production build.

---

## How this project answers the clarification questions

The Nyra CRM was built according to the original plan. Here is how it maps to the questions:

| Question | Choice in this project |
|----------|------------------------|
| **1. Authentication** | **a. JWT-based (email/password)** – Supabase Auth with email/password; JWT in cookies. No Google OAuth in this codebase. |
| **2. Database** | **b. PostgreSQL** – Via Supabase (PostgreSQL). There is **no MongoDB**; the stack is Next.js + Supabase only. |
| **3. Sample data** | **b. Clean database** – No seed/demo data. You add leads and users yourself after signup. |
| **4. Voice-to-text** | **b. Browser Web Speech API** – Implemented in the clinic activity form (note field): mic button for voice input (no API key). |
| **5. Design theme** | **Light clean** – Light theme; clean, minimal (Notion/Stripe style). |
| **6. Company logo** | Logo shown on login, signup, and dashboard nav. Replace `public/logo.svg` with your own file (or use `public/logo.png` and update the `src` in those pages to `/logo.png`). |

---

## “Issues with the backend” – what to fix

The **backend is Supabase only** (PostgreSQL + Auth). There is no separate Node/MongoDB server. “Backend issues” usually mean one of these:

### 1. You’re stuck on the “Supabase configuration required” (/setup) page

**Cause:** Supabase env vars are not set or not loaded.

**Fix:**

1. Create **`.env.local`** in the project root (same folder as `package.json`) with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
2. Get the values from [Supabase Dashboard → your project → Settings → API](https://supabase.com/dashboard/project/_/settings/api).
3. Run the migration once: open Supabase **SQL Editor**, paste the contents of **`supabase/migrations/20240309000001_initial_schema.sql`**, and run it.
4. **Restart the dev server** (stop with Ctrl+C, then `npm run dev` again).

After this, `/` should redirect to login/dashboard instead of `/setup`.

### 2. You want a different backend (e.g. MongoDB or your own API)

Right now the app **only** talks to Supabase (database + auth). Switching to MongoDB or another backend would require:

- Replacing Supabase client calls with your API or MongoDB client.
- Implementing auth (e.g. your own JWT or OAuth) if you move off Supabase Auth.

That would be a larger change; the current backend is Supabase-only.

### 3. Errors after adding .env.local

- **500 or “Supabase URL and anon key are required”** – Restart the dev server so Next.js loads `.env.local`.
- **Auth/session issues** – Ensure the migration has been run so the `profiles` table and RLS exist.

---

## Quick checklist

- [ ] `.env.local` in project root with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Supabase migration run in SQL Editor
- [ ] Dev server restarted after adding env
- [ ] Open `/` or click “Retry after adding .env.local” → should go to login or dashboard
