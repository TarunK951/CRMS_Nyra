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
} from "recharts";

interface RepRow {
  name: string;
  fullName: string;
  visits: number;
  meetings: number;
  pitches: number;
  sprints: number;
  subs: number;
  points: number;
}

interface RepProgressChartsProps {
  data: RepRow[];
  monthLabel: string;
}

const primary = "hsl(var(--primary))";
const muted = "hsl(var(--muted-foreground))";

export function RepProgressCharts({ data, monthLabel }: RepProgressChartsProps) {
  if (data.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        Activity this month — {monthLabel}
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-button border border-border bg-card p-5 shadow-card">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Visits &amp; meetings by rep
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="visits" fill={muted} name="Visits" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meetings" fill={primary} name="Meetings" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-button border border-border bg-card p-5 shadow-card">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Pitches, sprints &amp; subs by rep
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pitches" fill={muted} name="Pitches" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sprints" fill={primary} name="Sprints" radius={[4, 4, 0, 0]} />
                <Bar dataKey="subs" fill="hsl(var(--destructive))" name="Subs" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="rounded-button border border-border bg-card p-5 shadow-card">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Points (gamification) by rep
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => [value, "Points"]} labelFormatter={(_, payload) => payload[0]?.payload?.fullName ?? ""} />
              <Bar dataKey="points" fill={primary} name="Points" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
