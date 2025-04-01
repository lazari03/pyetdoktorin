'use client';

import { useAuth } from '../../context/AuthContext'; // Import the AuthContext
import DoctorSearchWidget from '../components/DoctorSearchWidget';
import DashboardNotifications from '../components/DashboardNotifications';

export default function Dashboard() {
  const { user, role, loading } = useAuth(); // Access user, role, and loading from AuthContext
  const doctorId = user?.id || 'doctor-id-placeholder'; // Use user ID from context or fallback

  if (loading) {
    return <p>Loading...</p>; // Show a loading state while fetching authentication data
  }

  const profileIncomplete = role === 'doctor'
    ? !user?.name || !user?.surname || !user?.phoneNumber || !user?.about || !user?.specializations
    : !user?.name || !user?.surname || !user?.phoneNumber;

  return (
    <div className="container mx-auto">
      {profileIncomplete && (
        <div className="alert alert-warning mb-6">
          <span>Your profile is incomplete. Please complete your profile</span>
        </div>
      )}
      <div className="content">
        <h1 className="text-2xl font-bold mb-6">
          Welcome to your {role || 'user'} dashboard!
        </h1>

        <p className="mt-2 mb-6">
          You are currently logged in as a {role || 'user'}.
          Use the sidebar menu to navigate to different sections.
        </p>

        {/* Only show doctor search widget for patients */}
        {role !== 'doctor' && (
          <div className="mb-6">
            <DoctorSearchWidget />
          </div>
        )}

        {role === 'doctor' ? (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Doctor Dashboard Content */}
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total Appointments</div>
                <div className="stat-value">10</div> {/* Replace with dynamic data if needed */}
                <div className="stat-desc">Appointments completed</div>
              </div>

              <div className="stat">
                <div className="stat-title">Upcoming</div>
                <div className="stat-value">3</div>
                <div className="stat-desc">Next: Today at 2:30 PM</div>
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
                        <th>Patient</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2024-01-20</td>
                        <td>John Doe</td>
                        <td><div className="badge badge-success">Completed</div></td>
                      </tr>
                      <tr>
                        <td>2024-01-25</td>
                        <td>Jane Smith</td>
                        <td><div className="badge badge-warning">Pending</div></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
            {/* Patient Dashboard Content */}
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Appointments</div>
                <div className="stat-value">4</div>
                <div className="stat-desc">In the last 30 days</div>
              </div>

              <div className="stat">
                <div className="stat-title">Next Appointment</div>
                <div className="stat-value text-primary">1</div>
                <div className="stat-desc">Tomorrow at 10:00 AM</div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Your Recent Appointments</h2>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Doctor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2024-01-15</td>
                        <td>Dr. Johnson</td>
                        <td><div className="badge badge-success">Completed</div></td>
                      </tr>
                      <tr>
                        <td>2024-01-28</td>
                        <td>Dr. Williams</td>
                        <td><div className="badge badge-warning">Scheduled</div></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}