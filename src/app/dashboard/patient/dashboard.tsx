export default function PatientDashboard() {
  const cards = [
    { title: "Search Doctors", desc: "Find and book appointments with doctors." },
    { title: "Appointment History", desc: "View your past appointments." },
  ];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Patient Dashboard</h1>
      <div className="grid gap-6 mt-6">
        {cards.map((card, idx) => (
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
