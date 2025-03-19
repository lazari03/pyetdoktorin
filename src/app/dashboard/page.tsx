import DoctorSearchWidget from '@/app/components/DoctorSearchWidget'

export default function Dashboard() {
  return (
    <div className="container mx-auto">
      <DoctorSearchWidget />
      <div className="grid gap-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Appointments</div>
            <div className="stat-value">89</div>
            <div className="stat-desc">21% more than last month</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Upcoming</div>
            <div className="stat-value">3</div>
            <div className="stat-desc">Next appointment in 2 days</div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Activity</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2024-01-20</td>
                    <td>Check-up</td>
                    <td><div className="badge badge-success">Completed</div></td>
                  </tr>
                  <tr>
                    <td>2024-01-25</td>
                    <td>Follow-up</td>
                    <td><div className="badge badge-warning">Pending</div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
