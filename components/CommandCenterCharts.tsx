"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

interface FunnelData { stage: string; count: number }
interface RepData { name: string; points: number; subs: number; leads: number }
interface MonthlyData { month: string; leads: number; subs: number }
interface DailyTrendData { date: string; visits: number; meetings: number; pitches: number; sprints: number; subs: number }

interface CommandCenterChartsProps {
  funnel: FunnelData[];
  repPerformance: RepData[];
  monthlyAcquisition: MonthlyData[];
  dailyActivityTrend?: DailyTrendData[];
}

const primary = "hsl(var(--primary))";
const muted = "hsl(var(--muted-foreground))";

export function CommandCenterCharts({ funnel, repPerformance, monthlyAcquisition, dailyActivityTrend = [] }: CommandCenterChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-button border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Sales funnel (Lead → Meeting → Sprint → Subscription)</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="stage" width={75} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill={primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-button border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Rep comparison (points &amp; subs)</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={repPerformance} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="points" fill={primary} name="Points" radius={[4, 4, 0, 0]} />
              <Bar dataKey="subs" fill={muted} name="Subscriptions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-button border border-border bg-card p-5 shadow-card lg:col-span-2">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Clinic acquisition &amp; revenue growth (last 6 months)</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyAcquisition} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill={muted} name="Leads" radius={[4, 4, 0, 0]} />
              <Bar dataKey="subs" fill={primary} name="Subscriptions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {dailyActivityTrend.length > 0 && (
        <div className="rounded-button border border-border bg-card p-5 shadow-card lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Daily activity (last 14 days) — all reps</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivityTrend} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="visits" stackId="1" stroke={muted} fill={muted} fillOpacity={0.4} name="Visits" />
                <Area type="monotone" dataKey="meetings" stackId="1" stroke={primary} fill={primary} fillOpacity={0.3} name="Meetings" />
                <Area type="monotone" dataKey="subs" stackId="2" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} name="Subs closed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
