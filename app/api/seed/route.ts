import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SAMPLE_LEADS = [
  { clinic_name: "Smile Dental Clinic", doctor_name: "Dr. Rajesh Kumar", specialization: "Dental", phone: "9876543210", address: "12 MG Road", area: "MG Road", city: "Bangalore", monthly_appointments: 120, branch_count: 1, lead_source: "Referral", lead_status: "new_lead" as const },
  { clinic_name: "City Ortho Care", doctor_name: "Dr. Priya Sharma", specialization: "Ortho", phone: "9876543211", address: "45 Indiranagar", area: "Indiranagar", city: "Bangalore", monthly_appointments: 80, branch_count: 2, lead_source: "Google", lead_status: "contacted" as const },
  { clinic_name: "Family Health Center", doctor_name: "Dr. Amit Patel", specialization: "General", phone: "9876543212", address: "78 Koramangala", area: "Koramangala", city: "Bangalore", monthly_appointments: 200, branch_count: 1, lead_source: "Walk-in", lead_status: "meeting_scheduled" as const },
  { clinic_name: "Perfect Smile Dental", doctor_name: "Dr. Sneha Reddy", specialization: "Dental", phone: "9876543213", address: "23 HSR Layout", area: "HSR", city: "Bangalore", monthly_appointments: 90, branch_count: 1, lead_source: "Practo", lead_status: "pitch_delivered" as const },
  { clinic_name: "Kids Dental Hub", doctor_name: "Dr. Vikram Singh", specialization: "Dental", phone: "9876543214", address: "56 Whitefield", area: "Whitefield", city: "Bangalore", monthly_appointments: 60, branch_count: 1, lead_source: "Referral", lead_status: "sprint_offered" as const },
];

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role as string | undefined;
  const assignTo = role === "sales_rep" ? user.id : null;

  const leadsToInsert = SAMPLE_LEADS.map((l) => ({
    ...l,
    assigned_rep_id: assignTo,
  }));

  const { data: inserted, error } = await supabase.from("leads").insert(leadsToInsert).select("id");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const leadIds = (inserted ?? []).map((r) => r.id);
  const today = new Date().toISOString().slice(0, 10);
  if (role === "sales_rep") {
    await supabase.from("daily_activities").upsert(
      {
        rep_id: user.id,
        date: today,
        clinic_visits: 3,
        doctor_meetings: 2,
        pitches_delivered: 1,
        sprints_sold: 0,
        subscriptions_closed: 0,
      },
      { onConflict: "rep_id,date" }
    );
  }

  return NextResponse.json({ ok: true, count: leadIds.length });
}
