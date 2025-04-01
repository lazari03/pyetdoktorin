'use client';

import { useAuth } from '../../context/AuthContext';
import DoctorSearch from '../components/DoctorSearch';
import DashboardNotifications from '../components/DashboardNotifications';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebaseconfig';
import { formatDate } from '../../utils/dateUtils'; // Import the utility function
import Link from 'next/link'; // Import Link for navigation

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [nextAppointment, setNextAppointment] = useState<string | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]); // State for recent appointments

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('patientId', '==', user.uid)
        );
        const querySnapshot = await getDocs(appointmentsQuery);

        const appointments = querySnapshot.docs.map((doc) => doc.data());
        setTotalAppointments(appointments.length);

        const upcomingAppointments = appointments
          .filter((appointment) => new Date(appointment.preferredDate) > new Date())
          .sort((a, b) => new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime());

        if (upcomingAppointments.length > 0) {
          const next = upcomingAppointments[0];
          setNextAppointment(`${formatDate(next.preferredDate)} at ${next.preferredTime}`);
        } else {
          setNextAppointment(null);
        }

        // Fetch the last 5 appointments
        const lastFiveAppointments = appointments
          .sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime())
          .slice(0, 5);
        setRecentAppointments(lastFiveAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
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

        {role !== 'doctor' && (
          <div className="mb-6">
            <DoctorSearch />
          </div>
        )}

        {role === 'doctor' ? (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total Appointments</div>
                <div className="stat-value">{totalAppointments}</div>
                <div className="stat-desc">Appointments completed</div>
              </div>

              <div className="stat">
                <div className="stat-title">Upcoming</div>
                <div className="stat-value text-sm">{nextAppointment || 'N/A'}</div> {/* Smaller font size */}
                <div className="stat-desc">{nextAppointment ? 'Next appointment' : 'No upcoming appointments'}</div>
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
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Appointments</div>
                <div className="stat-value">{totalAppointments}</div>
                <div className="stat-desc">In the last 30 days</div>
              </div>

              <div className="stat">
                <div className="stat-title">Next Appointment</div>
                <div className="stat-value text-orange-500 text-sm">{nextAppointment || 'N/A'}</div> {/* Changed to orange */}
                <div className="stat-desc">{nextAppointment ? 'Upcoming' : 'No upcoming appointments'}</div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h2 className="card-title">Your Recent Appointments</h2>
                  <Link href="/dashboard/appointments" className="text-orange-500 hover:underline">
                    View All
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>{role === 'doctor' ? 'Patient' : 'Doctor'}</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.length > 0 ? (
                        recentAppointments.map((appointment, index) => (
                          <tr key={index}>
                            <td>{formatDate(appointment.preferredDate)}</td>
                            <td>{role === 'doctor' ? appointment.patientName : appointment.doctorName}</td>
                            <td>
                              <div
                                className={`badge ${
                                  appointment.status === 'completed'
                                    ? 'badge-success' // Green for Completed
                                    : appointment.status === 'pending'
                                    ? 'badge-warning' // Yellow for Pending
                                    : appointment.status === 'accepted'
                                    ? 'badge-success' // Orange for Accepted
                                    : appointment.status === 'rejected'
                                    ? 'badge-error' // Red for Rejected
                                    : 'badge-info' // Default for unknown statuses
                                }`}
                              >
                                {appointment.status}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center">
                            No recent appointments found.
                          </td>
                        </tr>
                      )}
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