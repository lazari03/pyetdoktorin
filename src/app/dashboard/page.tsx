'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStore } from '../../store/dashboardStore';
import Link from 'next/link';
import { isProfileIncomplete } from '../../store/generalStore';
import DoctorSearchModal from '../components/DoctorSearchModal';
import { UserRole } from '../../models/UserRole'; // Import UserRole model
import DashboardNotifications from '../components/DashboardNotifications'; // Import the notification widget
import Loader from '../components/Loader'; // Import Loader component

export default function Dashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const { totalAppointments, nextAppointment, recentAppointments, fetchAppointments } = useDashboardStore();
  const [profileIncomplete, setProfileIncomplete] = useState<boolean>(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState<DOMRect | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state for the dashboard
  const searchBarRef = useRef<HTMLDivElement>(null);

  const fetchProfileStatus = useCallback(async () => {
    if (user && role) {
      const incomplete = await isProfileIncomplete(role, user.uid);
      setProfileIncomplete(incomplete);
    }
  }, [user, role]); // Wrapped in useCallback to stabilize the function reference

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

  const handlePayNow = async (appointmentId: string) => {
    try {
      const response = await fetch("/api/appointments/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId, status: "paid" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment status");
      }

      alert("Payment successful and appointment status updated!");
      // Optionally, refresh appointments or update state here
    } catch (error) {
      console.error("Error updating appointment status:", error);
      alert("Failed to update appointment status. Please try again.");
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await fetchProfileStatus();
        if (user && role) {
          await fetchAppointments(user.uid, role);
          // Removed direct usage of nextAppointment to avoid dependency issues
        }
      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user, role, fetchAppointments, fetchProfileStatus]); // Do not include nextAppointment in the dependency array

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
                      {role !== 'doctor' && appointment.status === 'pending' && (
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => handlePayNow(appointment.id)}
                          >
                            Pay Now
                          </button>
                        </td>
                      )}
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