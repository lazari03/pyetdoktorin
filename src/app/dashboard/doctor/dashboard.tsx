export default function DoctorDashboard() {
    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <div className="grid gap-6 mt-6">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Dashboard</h2>
                        <p>Quick access widgets</p>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Upcoming Appointments</h2>
                        <p>Manage your upcoming appointments here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}