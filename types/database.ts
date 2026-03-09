export type UserRole = "admin" | "sales_rep" | "operations";

export type LeadStatus =
  | "new_lead"
  | "contacted"
  | "meeting_scheduled"
  | "pitch_delivered"
  | "sprint_offered"
  | "sprint_started"
  | "sprint_completed"
  | "subscription_closed"
  | "lost";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new_lead: "New Leads",
  contacted: "First Contact",
  meeting_scheduled: "Doctor Meeting",
  pitch_delivered: "Pitch Delivered",
  sprint_offered: "Sprint Offered",
  sprint_started: "Sprint Started",
  sprint_completed: "Sprint Review",
  subscription_closed: "Subscription Closed",
  lost: "Lost",
};

export const PIPELINE_STAGES: LeadStatus[] = [
  "new_lead",
  "contacted",
  "meeting_scheduled",
  "pitch_delivered",
  "sprint_offered",
  "sprint_started",
  "sprint_completed",
  "subscription_closed",
  "lost",
];

export type ActivityType = "visit" | "meeting" | "note" | "stage_change";

export type PlanType = "micro" | "small" | "growth" | "enterprise";
export type ContractType = "monthly" | "quarterly" | "half_year" | "yearly";

export const PLAN_LABELS: Record<PlanType, string> = {
  micro: "Micro",
  small: "Small",
  growth: "Growth",
  enterprise: "Enterprise",
};

export const CONTRACT_LABELS: Record<ContractType, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_year: "Half-Year",
  yearly: "Yearly",
};

export const GAMIFICATION_POINTS = {
  clinic_visit: 1,
  doctor_meeting: 3,
  pitch_delivered: 5,
  sprint_sold: 20,
  subscription_closed: 50,
  enterprise_deal: 100,
} as const;

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  clinic_name: string;
  doctor_name: string;
  specialization: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  monthly_appointments: number | null;
  branch_count: number;
  lead_source: string;
  lead_status: LeadStatus;
  assigned_rep_id: string | null;
  next_follow_up: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: ActivityType;
  content: string | null;
  rep_id: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface Sprint {
  id: string;
  lead_id: string;
  start_date: string;
  end_date: string;
  status: string;
  appointment_confirmations: number | null;
  calls_handled: number | null;
  rescheduled: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  lead_id: string;
  plan_type: PlanType;
  contract_type: ContractType;
  start_date: string;
  renewal_date: string;
  minutes_allocation: number | null;
  branch_count: number;
  created_at: string;
  updated_at: string;
}

export interface DailyActivity {
  id: string;
  rep_id: string;
  date: string;
  clinic_visits: number;
  doctor_meetings: number;
  pitches_delivered: number;
  sprints_sold: number;
  subscriptions_closed: number;
  created_at: string;
  updated_at: string;
}

export interface GamificationEvent {
  id: string;
  rep_id: string;
  action_type: string;
  points: number;
  lead_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}
