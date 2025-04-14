'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStore } from '../../store/dashboardStore';
import Link from 'next/link';
import { isProfileIncomplete } from '../../store/generalStore';
import DoctorSearchModal from '../components/DoctorSearchModal';
import { UserRole } from '../../models/UserRole'; // Import UserRole model

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const { totalAppointments, nextAppointment, recentAppointments, fetchAppointments } = useDashboardStore();
  const [profileIncomplete, setProfileIncomplete] = useState<boolean>(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState<DOMRect | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const fetchProfileStatus = async () => {
    if (user && role) {
      const incomplete = await isProfileIncomplete(role, user.uid);
      setProfileIncomplete(incomplete);
    }
  };

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
    fetchProfileStatus();
  }, [user, role]);

  useEffect(() => {
    if (user && role) fetchAppointments(user.uid, role);
  }, [user, fetchAppointments]);

  if (loading) return <p>Loading...</p>;

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
      <h1 className="text-2xl font-bold mb-6">Welcome to your {role || 'user'} dashboard!</h1>
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
            <div className="stat-value text-base text-orange-500">{nextAppointment || 'N/A'}</div>
          </div>
        </div>
      </div>
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title">Appointments</h2>
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
                      <td>{appointment.preferredDate}</td>
                      <td>{role === 'doctor' ? appointment.patientName : appointment.doctorName}</td>
                      <td>
                        <div
                          className={`badge ${
                            appointment.status === 'completed'
                              ? 'badge-success'
                              : appointment.status === 'pending'
                              ? 'badge-warning'
                              : appointment.status === 'accepted'
                              ? 'badge-info'
                              : appointment.status === 'rejected'
                              ? 'badge-error'
                              : 'badge-secondary'
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
  );
}