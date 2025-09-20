'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStore } from '../../store/dashboardStore';
import Link from 'next/link';
import { isProfileIncomplete } from '../../store/generalStore';
import DashboardDoctorSearchBar from '../components/DashboardDoctorSearchBar';
import { UserRole } from '../../models/UserRole';
import DashboardNotificationsBell from '../components/DashboardNotificationsBell';
import DashboardClock from '../components/DashboardClock';
import DoctorRevenueWidget from '../components/DoctorRevenueWidget';
import Loader from '../components/Loader';
import { useAppointmentStore } from '../../store/appointmentStore';
import { AppointmentsTable } from '../components/AppointmentsTable';
import UpcomingAppointment from '../components/UpcomingAppointment';
import { useDashboardActions } from '../../hooks/useDashboardActions';
import ProfileWarning from '../components/ProfileWarning';

export default function Dashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const { totalAppointments, fetchAppointments } = useDashboardStore();
  const { appointments, isAppointmentPast, fetchAppointments: fetchAllAppointments } = useAppointmentStore();
  const { handleJoinCall, handlePayNow } = useDashboardActions();
  const [profileIncomplete, setProfileIncomplete] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const fetchProfileStatus = useCallback(async () => {
    if (user && role) {
      const incomplete = await isProfileIncomplete(role, user.uid);
      setProfileIncomplete(incomplete);
    }
  }, [user, role]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        await fetchProfileStatus();
        if (user && role) {
          await fetchAppointments(user.uid, role);
          await fetchAllAppointments(user.uid, role === UserRole.Doctor); // Ensure appointments store is also loaded
        }
  } catch {
  } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [user, role, fetchAppointments, fetchProfileStatus, fetchAllAppointments]);

  if (authLoading || loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      {role === UserRole.Patient && (
        <DashboardDoctorSearchBar />
      )}
      <ProfileWarning show={profileIncomplete} />


      {role === UserRole.Doctor && user?.uid && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start justify-center min-w-[300px] min-h-[100px]">
            <span className="text-lg font-semibold text-gray-700 mb-2">Total Appointments</span>
            <span className="text-3xl font-extrabold text-primary mb-1">{totalAppointments}</span>
            <span className="text-base text-gray-500 mb-2">All appointments</span>
          </div>
          <DashboardNotificationsBell doctorId={user.uid} />
          <DashboardClock />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingAppointment />
        <DoctorRevenueWidget />
      </div>
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h2 className="card-title text-lg md:text-2xl">Your Appointments</h2>
            <Link href="/dashboard/appointments" className="text-orange hover:underline">
              View All
            </Link>
          </div>
          <AppointmentsTable
            appointments={appointments}
            role={role || ''}
            isAppointmentPast={isAppointmentPast}
            handleJoinCall={handleJoinCall}
            handlePayNow={handlePayNow}
          />
        </div>
      </div>
    </div>
  );
}