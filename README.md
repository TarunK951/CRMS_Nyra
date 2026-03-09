# Nyra Sales Command Center

A full-stack, mobile-first CRM for the Nyra marketing team. Built with Next.js 14 (App Router), Supabase (PostgreSQL + Auth), and Tailwind CSS.

## Features

- **Roles**: Admin (founder), Sales Rep, Operations (optional)
- **Lead database**: CRUD, filters, activity history
- **Sales pipeline**: Kanban board with drag-and-drop (9 stages)
- **Sprint tracking**: 15-day trials, metrics (confirmations, calls, feedback)
- **Subscription management**: Plans (Micro/Small/Growth/Enterprise), contract types, MRR
- **Rep performance**: Daily War Room (Rep | Visits | Meetings | Pitches | Sprints | Subs), leaderboard, gamification points
- **Admin Command Center**: KPIs, sales funnel chart, rep comparison, clinic acquisition, MRR
- **Clinic profile**: Basic info, timeline, notes, sprints, subscriptions
- **Daily activity**: Reps log visits, meetings, pitches, sprints, subs
- **Automation**: Cron-driven alerts for sprint end, renewal, inactive leads (7 days)
- **Notifications**: In-app notifications with bell icon in nav
- **Voice-to-text**: Browser Web Speech API on clinic activity notes (mic button)
- **Sample data**: “Add sample data” on Admin and Rep dashboards seeds demo leads
- **Logo**: Replace `public/logo.svg` with your logo (or use `public/logo.png` and set `src="/logo.png"` on login/signup/nav)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. In the SQL Editor, run the migration: copy the contents of `supabase/migrations/20240309000001_initial_schema.sql` and execute it.
3. In Project Settings > API, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key (optional, for cron) → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# Optional: for cron notifications (bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# Optional: set to secure the cron endpoint
CRON_SECRET=your_random_secret
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up (choose Admin or Sales Rep role). After login you’ll be redirected to `/admin` or `/rep` based on role.

### 5. Cron (optional)

To run automation (sprint/renewal/inactive reminders), call the cron endpoint daily from an external scheduler:

```
GET /api/cron/notifications
Authorization: Bearer YOUR_CRON_SECRET
```

If `CRON_SECRET` is not set, the endpoint still runs (useful for local testing).

## Project structure

- `app/` – Next.js App Router (auth, dashboard, admin, rep, clinic, API)
- `components/` – UI (LeadForm, PipelineBoard, SprintForm, SubscriptionForm, charts, nav)
- `lib/supabase/` – Browser and server Supabase clients, middleware helper, service role
- `app/actions/` – Server actions (leads, activities, daily-activity, sprints, subscriptions, notifications)
- `types/database.ts` – Shared types and constants (stages, points, plan labels)
- `supabase/migrations/` – SQL schema, RLS, triggers

## Gamification points

- Clinic visit: 1  
- Doctor meeting: 3  
- Pitch delivered: 5  
- Sprint sold: 20  
- Subscription closed: 50  
- Enterprise deal: 100  

Leaderboard resets monthly.
