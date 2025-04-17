'use client';

import { useState, useEffect } from 'react';
import RoleGuard from '../../../components/RoleGuard';
import { UserRole } from '../../../../models/UserRole';
import Calendar from '../Calendar';
import Loader from '../../../components/Loader';

export default function DoctorCalendarPage() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate actual data fetching or initialization
        await fetch('/api/calendar'); // Replace with actual API call
      } catch (error) {
        console.error('Error loading calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <RoleGuard allowedRoles={[UserRole.Doctor]} fallbackPath="/dashboard">
      <div>
        <h1 className="text-2xl font-bold">Doctor's Calendar</h1>
        <Calendar />
      </div>
    </RoleGuard>
  );
}
