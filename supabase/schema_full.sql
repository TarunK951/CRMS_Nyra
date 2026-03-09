-- =============================================================================
-- Nyra CRM - Full database schema for Supabase
-- Run this entire file once in: Supabase Dashboard → SQL Editor → New query
-- Paste, then click "Run". Fixes "Could not find the table 'public.leads'" error.
-- =============================================================================

-- 1. Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom types (idempotent: skip if already exist)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'sales_rep', 'operations');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM (
    'new_lead', 'contacted', 'meeting_scheduled', 'pitch_delivered',
    'sprint_offered', 'sprint_started', 'sprint_completed',
    'subscription_closed', 'lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM ('visit', 'meeting', 'note', 'stage_change');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('micro', 'small', 'growth', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE contract_type AS ENUM ('monthly', 'quarterly', 'half_year', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'sales_rep',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'sales_rep')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  specialization TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  monthly_appointments INT,
  branch_count INT NOT NULL DEFAULT 1,
  lead_source TEXT NOT NULL DEFAULT '',
  lead_status lead_status NOT NULL DEFAULT 'new_lead',
  assigned_rep_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  next_follow_up DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Lead activities
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  content TEXT,
  rep_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Sprints
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  appointment_confirmations INT,
  calls_handled INT,
  rescheduled INT,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  plan_type plan_type NOT NULL,
  contract_type contract_type NOT NULL,
  start_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  minutes_allocation INT,
  branch_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Daily activities
CREATE TABLE IF NOT EXISTS public.daily_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rep_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clinic_visits INT NOT NULL DEFAULT 0,
  doctor_meetings INT NOT NULL DEFAULT 0,
  pitches_delivered INT NOT NULL DEFAULT 0,
  sprints_sold INT NOT NULL DEFAULT 0,
  subscriptions_closed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rep_id, date)
);

-- 10. Gamification events
CREATE TABLE IF NOT EXISTS public.gamification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rep_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  points INT NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_rep ON public.leads(assigned_rep_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created ON public.lead_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_sprints_lead_id ON public.sprints(lead_id);
CREATE INDEX IF NOT EXISTS idx_sprints_end_date ON public.sprints(end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lead_id ON public.subscriptions(lead_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal ON public.subscriptions(renewal_date);
CREATE INDEX IF NOT EXISTS idx_daily_activities_rep_date ON public.daily_activities(rep_id, date);
CREATE INDEX IF NOT EXISTS idx_gamification_events_rep_created ON public.gamification_events(rep_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- 13. RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 14. Policies (drop if exists so re-run is safe)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can read all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
);

DROP POLICY IF EXISTS "Admin sees all leads" ON public.leads;
DROP POLICY IF EXISTS "Rep sees assigned leads" ON public.leads;
DROP POLICY IF EXISTS "Rep can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Rep can update assigned leads" ON public.leads;
CREATE POLICY "Admin sees all leads" ON public.leads FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
);
CREATE POLICY "Rep sees assigned leads" ON public.leads FOR ALL USING (assigned_rep_id = auth.uid());
CREATE POLICY "Rep can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Rep can update assigned leads" ON public.leads FOR UPDATE USING (assigned_rep_id = auth.uid());

DROP POLICY IF EXISTS "Admin all lead_activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Rep own activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Rep read activities for assigned leads" ON public.lead_activities;
CREATE POLICY "Admin all lead_activities" ON public.lead_activities FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
);
CREATE POLICY "Rep own activities" ON public.lead_activities FOR ALL USING (rep_id = auth.uid());
CREATE POLICY "Rep read activities for assigned leads" ON public.lead_activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.leads l WHERE l.id = lead_activities.lead_id AND l.assigned_rep_id = auth.uid())
);

DROP POLICY IF EXISTS "Admin all sprints" ON public.sprints;
DROP POLICY IF EXISTS "Rep sprints for assigned leads" ON public.sprints;
CREATE POLICY "Admin all sprints" ON public.sprints FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
);
CREATE POLICY "Rep sprints for assigned leads" ON public.sprints FOR ALL USING (
  EXISTS (SELECT 1 FROM public.leads l WHERE l.id = sprints.lead_id AND l.assigned_rep_id = auth.uid())
);

DROP POLICY IF EXISTS "Admin all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Rep subscriptions for assigned leads" ON public.subscriptions;
CREATE POLICY "Admin all subscriptions" ON public.subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
);
CREATE POLICY "Rep subscriptions for assigned leads" ON public.subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.leads l WHERE l.id = subscriptions.lead_id AND l.assigned_rep_id = auth.uid())
);

DROP POLICY IF EXISTS "Admin all daily_activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Rep own daily_activities" ON public.daily_activities;
CREATE POLICY "Admin all daily_activities" ON public.daily_activities FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
);
CREATE POLICY "Rep own daily_activities" ON public.daily_activities FOR ALL USING (rep_id = auth.uid());

DROP POLICY IF EXISTS "Admin read gamification_events" ON public.gamification_events;
DROP POLICY IF EXISTS "Rep own gamification_events" ON public.gamification_events;
CREATE POLICY "Admin read gamification_events" ON public.gamification_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
);
CREATE POLICY "Rep own gamification_events" ON public.gamification_events FOR ALL USING (rep_id = auth.uid());

DROP POLICY IF EXISTS "Users own notifications" ON public.notifications;
CREATE POLICY "Users own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- 15. updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS sprints_updated_at ON public.sprints;
CREATE TRIGGER sprints_updated_at BEFORE UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS daily_activities_updated_at ON public.daily_activities;
CREATE TRIGGER daily_activities_updated_at BEFORE UPDATE ON public.daily_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Done. Reload schema cache: Supabase Dashboard → Settings → API → "Reload schema cache" (if needed).
