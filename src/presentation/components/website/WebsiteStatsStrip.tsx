'use client';

type Stat = { label: string; value: string };

export default function WebsiteStatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="website-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="website-stat">
          <div className="website-stat-value">{stat.value}</div>
          <div className="website-stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
