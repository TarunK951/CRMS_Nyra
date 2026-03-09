# Database setup – fix "Could not find the table 'public.leads' in the schema cache"

This error means the Supabase database tables have not been created yet. Create them **once** in your Supabase project.

## Steps

1. Open **Supabase Dashboard** → your project.
2. Go to **SQL Editor** (left sidebar).
3. Click **New query**.
4. Open **`supabase/schema_full.sql`** from this project and **copy its entire contents**.
5. Paste into the SQL Editor and click **Run** (or Ctrl+Enter).
6. Wait for "Success". This creates all tables, indexes, RLS policies, and triggers.
7. (Optional) If the app still shows the error: **Settings → API** → scroll down → **Reload schema cache**.
8. Refresh your app.

## Which file to use

- **`supabase/schema_full.sql`** – **Use this.** Idempotent: safe to run more than once. Creates everything in `public` and fixes the schema cache error.
- `supabase/migrations/20240309000001_initial_schema.sql` – Original migration; use only if you prefer a one-time run (fails if objects already exist).

## Tables created (all in `public`)

| Table | Purpose |
|-------|--------|
| `profiles` | User profile and role (admin, sales_rep, operations). Linked to `auth.users`. |
| `leads` | Clinic/lead records: clinic_name, doctor_name, specialization, phone, address, area, city, monthly_appointments, branch_count, lead_source, lead_status, assigned_rep_id, next_follow_up. |
| `lead_activities` | Activity log per lead: type (visit, meeting, note, stage_change), content, rep_id, metadata. |
| `sprints` | Sprints per lead: start_date, end_date, status, appointment_confirmations, calls_handled, rescheduled, feedback. |
| `subscriptions` | Subscriptions per lead: plan_type, contract_type, start_date, renewal_date, minutes_allocation, branch_count. |
| `daily_activities` | Daily rep metrics: date, clinic_visits, doctor_meetings, pitches_delivered, sprints_sold, subscriptions_closed. One row per rep per day. |
| `gamification_events` | Points per action: rep_id, action_type, points, lead_id. |
| `notifications` | User notifications: user_id, title, body, read. |

All of these are used by the app; the backend reads and writes only to these tables. After running `schema_full.sql`, the schema cache will include `public.leads` and the error will be resolved.
