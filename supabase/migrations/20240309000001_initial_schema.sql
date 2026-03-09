-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE user_role AS ENUM ('admin', 'sales_rep', 'operations');
CREATE TYPE lead_status AS ENUM (
  'new_lead',
  'contacted',
  'meeting_scheduled',
  'pitch_delivered',
  'sprint_offered',
  'sprint_started',
  'sprint_completed',
  'subscription_closed',
  'lost'
);
CREATE TYPE activity_type AS ENUM ('visit', 'meeting', 'note', 'stage_change');
CREATE TYPE plan_type AS ENUM ('micro', 'small', 'growth', 'enterprise');
CREATE TYPE contract_type AS ENUM ('monthly', 'quarterly', 'half_year', 'yearly');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'sales_rep',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to create profile on signup
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

-- Leads
CREATE TABLE leads (
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
  assigned_rep_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  next_follow_up DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lead activities
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  content TEXT,
  rep_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sprints
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
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

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  plan_type plan_type NOT NULL,
  contract_type contract_type NOT NULL,
  start_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  minutes_allocation INT,
  branch_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily activities (for War Room)
CREATE TABLE daily_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rep_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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

-- Gamification events (for leaderboard, monthly reset)
CREATE TABLE gamification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rep_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  points INT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications (for automation alerts)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_status ON leads(lead_status);
CREATE INDEX idx_leads_assigned_rep ON leads(assigned_rep_id);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created ON lead_activities(created_at);
CREATE INDEX idx_sprints_lead_id ON sprints(lead_id);
CREATE INDEX idx_sprints_end_date ON sprints(end_date);
CREATE INDEX idx_subscriptions_lead_id ON subscriptions(lead_id);
CREATE INDEX idx_subscriptions_renewal ON subscriptions(renewal_date);
CREATE INDEX idx_daily_activities_rep_date ON daily_activities(rep_id, date);
CREATE INDEX idx_gamification_events_rep_created ON gamification_events(rep_id, created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own profile; admin can read all
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
  );

-- Leads: admin sees all; rep sees assigned or created
CREATE POLICY "Admin sees all leads" ON leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
  );

CREATE POLICY "Rep sees assigned leads" ON leads
  FOR ALL USING (assigned_rep_id = auth.uid());

CREATE POLICY "Rep can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Rep can update assigned leads" ON leads
  FOR UPDATE USING (assigned_rep_id = auth.uid());

-- Lead activities: admin all; rep own activities and for assigned leads
CREATE POLICY "Admin all lead_activities" ON lead_activities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
  );

CREATE POLICY "Rep own activities" ON lead_activities
  FOR ALL USING (rep_id = auth.uid());

CREATE POLICY "Rep read activities for assigned leads" ON lead_activities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM leads l WHERE l.id = lead_activities.lead_id AND l.assigned_rep_id = auth.uid())
  );

-- Sprints: admin all; rep for their leads
CREATE POLICY "Admin all sprints" ON sprints
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
  );

CREATE POLICY "Rep sprints for assigned leads" ON sprints
  FOR ALL USING (
    EXISTS (SELECT 1 FROM leads l WHERE l.id = sprints.lead_id AND l.assigned_rep_id = auth.uid())
  );

-- Subscriptions: admin all; rep for their leads
CREATE POLICY "Admin all subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
  );

CREATE POLICY "Rep subscriptions for assigned leads" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM leads l WHERE l.id = subscriptions.lead_id AND l.assigned_rep_id = auth.uid())
  );

-- Daily activities: admin read all; rep own
CREATE POLICY "Admin all daily_activities" ON daily_activities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
  );

CREATE POLICY "Rep own daily_activities" ON daily_activities
  FOR ALL USING (rep_id = auth.uid());

-- Gamification: admin read all; rep own
CREATE POLICY "Admin read gamification_events" ON gamification_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operations'))
  );

CREATE POLICY "Rep own gamification_events" ON gamification_events
  FOR ALL USING (rep_id = auth.uid());

-- Notifications: own only
CREATE POLICY "Users own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER sprints_updated_at BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER daily_activities_updated_at BEFORE UPDATE ON daily_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
