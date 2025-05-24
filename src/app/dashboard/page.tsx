'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStore } from '../../store/dashboardStore';
import Link from 'next/link';
import { isProfileIncomplete } from '../../store/generalStore';
import DoctorSearchModal from '../components/DoctorSearchModal';
import { UserRole } from '../../models/UserRole';
import DashboardNotifications from '../components/DashboardNotifications';
import Loader from '../components/Loader';
import { useAppointmentStore } from '../../store/appointmentStore';

export default function Dashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const { totalAppointments, nextAppointment, fetchAppointments } = useDashboardStore();
  const { appointments, handlePayNow, isAppointmentPast, fetchAppointments: fetchAllAppointments } = useAppointmentStore();
  const [profileIncomplete, setProfileIncomplete] = useState<boolean>(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState<DOMRect | null>(null);
  const [loading, setLoading] = useState(true);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const fetchProfileStatus = useCallback(async () => {
    if (user && role) {
      const incomplete = await isProfileIncomplete(role, user.uid);
      setProfileIncomplete(incomplete);
    }
  }, [user, role]);

  const handleSearchClick = () => {
    if (searchBarRef.current) {
      const position = searchBarRef.current.getBoundingClientRect();
      setSearchBarPosition(position);
    }
    setIsSearchModalOpen(true);
  };

  const handleModalClose = () => {
    setIsSearchModalOpen(false);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await fetchProfileStatus();
        if (user && role) {
          await fetchAppointments(user.uid, role);
          await fetchAllAppointments(user.uid, role === UserRole.Doctor); // Ensure appointments store is also loaded
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user, role, fetchAppointments, fetchProfileStatus, fetchAllAppointments]);

  if (authLoading || loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
        Welcome to Your {role || 'User'} Dashboard
      </h1>
      {role === UserRole.Patient && ( // Restrict search to patients
        <div
          ref={searchBarRef}
          onClick={handleSearchClick}
          className="relative flex items-center bg-white rounded-full shadow-lg p-3 w-full max-w-lg mx-auto cursor-pointer transform transition-transform duration-500 ease-in-out mb-8"
        >
          <input
            type="text"
            placeholder="Search for doctors..."
            className="flex-grow rounded-full px-4 py-3 text-base focus:outline-none cursor-pointer"
            readOnly
          />
        </div>
      )}
      <DoctorSearchModal
        isOpen={isSearchModalOpen}
        onClose={handleModalClose}
        position={searchBarPosition}
      />
      {profileIncomplete && (
        <div className="alert alert-warning mb-6">
          <span>Your profile is incomplete. Please complete your profile</span>
        </div>
      )}
      {role === UserRole.Doctor && user?.uid && (
        <div className="mb-6">
          <DashboardNotifications doctorId={user.uid} />
          <Link href="/dashboard/notifications" className="text-blue-500 hover:underline mt-2 block">
            View All Notifications
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Appointments</div>
            <div className="stat-value">{totalAppointments}</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Upcoming Appointment</div>
            <div className="stat-value text-base text-orange-500">
              {nextAppointment ? nextAppointment : 'No upcoming appointments'}
            </div>
          </div>
        </div>
      </div>
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title text-lg md:text-2xl">Your Appointments</h2>
            <Link href="/dashboard/appointments" className="text-orange-500 hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto mt-6">
            <table className="table table-zebra w-full text-sm md:text-base">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{role === 'doctor' ? 'Patient' : 'Doctor'}</th>
                  <th>Type</th>
                  <th>Time</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments && appointments.length > 0 ? (
                  appointments.slice(0, 3).map((appointment) => {
                    return (
                      <tr key={appointment.id}>
                        <td>{appointment.preferredDate}</td>
                        <td>
                          {role === 'doctor'
                            ? appointment.patientName || "N/A"
                            : (
                              <a
                                href={`/dashboard/doctor/${appointment.doctorId}`}
                                className="text-orange-500 underline hover:text-orange-700"
                              >
                                {appointment.doctorName}
                              </a>
                            )}
                        </td>
                        <td>{appointment.appointmentType}</td>
                        <td>{appointment.preferredTime}</td>
                        <td>{appointment.notes}</td>
                        <td>
                          {appointment.status === "accepted" ? (
                            <span className="text-green-500 font-bold">Accepted</span>
                          ) : appointment.status === "rejected" ? (
                            <span className="text-red-500 font-bold">Declined</span>
                          ) : (
                            <span className="text-gray-500 font-bold">Pending</span>
                          )}
                        </td>
                        <td>
                          {role === "doctor" ? (
                            // Doctor: Only "Finished" or "Join Now"
                            (() => {
                              if (isAppointmentPast(appointment)) {
                                return (
                                  <button className="bg-gray-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                                    Finished
                                  </button>
                                );
                              }
                              if (appointment.status === "accepted") {
                                return (
                                  <button
                                    className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full"
                                    // onClick={() => handleJoinCall(appointment.id)} // Uncomment and implement if needed
                                    disabled
                                  >
                                    Join Now
                                  </button>
                                );
                              }
                              // If not accepted or in the past, show disabled button
                              return (
                                <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                                  Waiting
                                </button>
                              );
                            })()
                          ) : (
                            // Patient: Existing logic
                            (() => {
                              if (isAppointmentPast(appointment)) {
                                return (
                                  <button className="bg-gray-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                                    Finished
                                  </button>
                                );
                              }
                              if (appointment.status === "rejected") {
                                return (
                                  <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                                    Declined
                                  </button>
                                );
                              }
                              if (appointment.status === "pending") {
                                return (
                                  <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                                    Pending
                                  </button>
                                );
                              }
                              if (appointment.status === "accepted" && !appointment.isPaid) {
                                return (
                                  <button
                                    className="bg-transparent hover:bg-orange-500 text-orange-700 font-semibold hover:text-white py-2 px-4 border border-orange-500 hover:border-transparent rounded-full"
                                    onClick={() => handlePayNow(appointment.id, 2100)}
                                  >
                                    Pay Now
                                  </button>
                                );
                              }
                              if (appointment.status === "accepted" && appointment.isPaid) {
                                return (
                                  <button
                                    className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full"
                                    disabled
                                  >
                                    Join Now
                                  </button>
                                );
                              }
                              // Default: disabled
                              return (
                                <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                                  Waiting
                                </button>
                              );
                            })()
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">
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
  );
}