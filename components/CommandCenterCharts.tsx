"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface FunnelData { stage: string; count: number }
interface RepData { name: string; points: number; subs: number }
interface MonthlyData { month: string; leads: number; subs: number }

interface CommandCenterChartsProps {
  funnel: FunnelData[];
  repPerformance: RepData[];
  monthlyAcquisition: MonthlyData[];
}

export function CommandCenterCharts({ funnel, repPerformance, monthlyAcquisition }: CommandCenterChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-card border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Sales funnel (Lead → Meeting → Sprint → Subscription)</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="stage" width={75} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-card border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Rep performance comparison</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={repPerformance} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="points" fill="hsl(var(--primary))" name="Points" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-card border border-border bg-card p-5 shadow-card lg:col-span-2">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Clinic acquisition & revenue growth</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyAcquisition} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="hsl(var(--muted-foreground))" name="Leads" radius={[4, 4, 0, 0]} />
              <Bar dataKey="subs" fill="hsl(var(--primary))" name="Subscriptions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
