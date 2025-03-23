export default function PatientDashboard() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Patient Dashboard</h1>
      <div className="grid gap-6 mt-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Search Doctors</h2>
            <p>Find and book appointments with doctors.</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Appointment History</h2>
            <p>View your past appointments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
