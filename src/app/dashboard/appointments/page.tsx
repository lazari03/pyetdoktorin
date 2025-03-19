export default function AppointmentsPage() {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Appointment History</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  <td>2024-01-{20 - i}</td>
                  <td>Check-up</td>
                  <td>Regular check-up appointment</td>
                  <td>
                    <div className="badge badge-success">Completed</div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-ghost">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
