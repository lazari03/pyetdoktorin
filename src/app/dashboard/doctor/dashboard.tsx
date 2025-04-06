export default function DoctorDashboard() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
      <div className="grid gap-6 mt-6">
        {[
          { title: "Dashboard", desc: "Quick access widgets" },
          { title: "Upcoming Appointments", desc: "Manage your upcoming appointments here." },
        ].map((card, idx) => (
          <div key={idx} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{card.title}</h2>
              <p>{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}