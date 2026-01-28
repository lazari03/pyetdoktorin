'use client';

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function WebsiteFeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="website-grid">
      {features.map((feature) => (
        <div key={feature.title} className="website-card">
          <div className="website-card-icon">{feature.icon}</div>
          <h3 className="website-card-title">{feature.title}</h3>
          <p className="website-card-body">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
