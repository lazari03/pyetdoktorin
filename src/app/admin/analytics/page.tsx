'use client';

import { AdminHeader } from '@/presentation/components/admin/AdminHeader';

const userDistribution = [
  { label: 'Doctors', value: 142, color: '#0ea5e9' },
  { label: 'Patients', value: 980, color: '#c084fc' },
  { label: 'Admins', value: 18, color: '#22c55e' },
];

const weeklyAppointments = [
  { day: 'Mon', value: 22 },
  { day: 'Tue', value: 31 },
  { day: 'Wed', value: 28 },
  { day: 'Thu', value: 35 },
  { day: 'Fri', value: 26 },
  { day: 'Sat', value: 18 },
  { day: 'Sun', value: 14 },
];

export default function AnalyticsOverviewPage() {
  const totalUsers = userDistribution.reduce((sum, item) => sum + item.value, 0);
  const pieGradient = userDistribution
    .reduce<string[]>((segments, item, index) => {
      const start = userDistribution.slice(0, index).reduce((sum, entry) => sum + entry.value, 0);
      const end = start + item.value;
      const startPercent = (start / totalUsers) * 100;
      const endPercent = (end / totalUsers) * 100;
      segments.push(`${item.color} ${startPercent}% ${endPercent}%`);
      return segments;
    }, [])
    .join(', ');

  const maxValue = Math.max(...weeklyAppointments.map((item) => item.value));
  const points = weeklyAppointments
    .map((item, index) => {
      const x = (index / (weeklyAppointments.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <AdminHeader title="Analytics Overview" />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="card border shadow-sm">
            <div className="card-body space-y-2">
              <p className="text-xs uppercase tracking-wide text-neutral">Total users</p>
              <p className="text-3xl font-semibold">{totalUsers.toLocaleString()}</p>
              <p className="text-sm text-success">+8.4% vs last week</p>
            </div>
          </div>
          <div className="card border shadow-sm">
            <div className="card-body space-y-2">
              <p className="text-xs uppercase tracking-wide text-neutral">Total patients</p>
              <p className="text-3xl font-semibold">980</p>
              <p className="text-sm text-neutral">48 new this month</p>
            </div>
          </div>
          <div className="card border shadow-sm">
            <div className="card-body space-y-2">
              <p className="text-xs uppercase tracking-wide text-neutral">Total doctors</p>
              <p className="text-3xl font-semibold">142</p>
              <p className="text-sm text-neutral">3 onboarding</p>
            </div>
          </div>
          <div className="card border shadow-sm">
            <div className="card-body space-y-2">
              <p className="text-xs uppercase tracking-wide text-neutral">Appointments this month</p>
              <p className="text-3xl font-semibold">612</p>
              <p className="text-sm text-neutral">62 are cancer screenings</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card border shadow-sm lg:col-span-2">
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral">Weekly cadence</p>
                  <h3 className="text-lg font-semibold">Appointments trend</h3>
                </div>
                <span className="badge badge-outline">Last 7 days</span>
              </div>
              <div className="rounded-lg bg-base-200 p-4">
                <svg viewBox="0 0 100 100" className="h-48 w-full">
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {weeklyAppointments.map((item, index) => {
                    const x = (index / (weeklyAppointments.length - 1)) * 100;
                    const y = 100 - (item.value / maxValue) * 100;
                    return <circle key={item.day} cx={x} cy={y} r={1.6} fill="#2563eb" />;
                  })}
                  <g fontSize="5" fill="#6b7280">
                    {weeklyAppointments.map((item, index) => {
                      const x = (index / (weeklyAppointments.length - 1)) * 100;
                      return <text key={item.day} x={x} y={98} textAnchor="middle">{item.day}</text>;
                    })}
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="card border shadow-sm">
            <div className="card-body space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral">User mix</p>
                  <h3 className="text-lg font-semibold">Distribution</h3>
                </div>
                <span className="badge badge-outline">Pie</span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="h-32 w-32 rounded-full"
                  style={{ background: `conic-gradient(${pieGradient})` }}
                  aria-label="User distribution chart"
                />
                <div className="space-y-2 text-sm">
                  {userDistribution.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <p className="font-medium">{item.label}</p>
                      <p className="text-neutral">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border shadow-sm">
          <div className="card-body space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral">Cancer-screening statistics</p>
                <h3 className="text-lg font-semibold">Performance & outcomes</h3>
              </div>
              <button className="btn btn-outline btn-sm">Download CSV</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-neutral">Screenings scheduled</p>
                <p className="text-2xl font-semibold">62</p>
                <p className="text-success text-xs">+12 vs last month</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-neutral">Completed</p>
                <p className="text-2xl font-semibold">54</p>
                <p className="text-success text-xs">87% completion</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-neutral">Elevated risk flagged</p>
                <p className="text-2xl font-semibold">9</p>
                <p className="text-warning text-xs">Requires review</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-neutral">Average turnaround</p>
                <p className="text-2xl font-semibold">36h</p>
                <p className="text-xs text-neutral">From sample to report</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
