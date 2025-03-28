'use client';

import { useState, useEffect } from 'react';
import DoctorSearchWidget from '@/app/components/DoctorSearchWidget';
import { isAuthenticated } from '../services/authService';
import { fetchAppointments } from '../services/appointmentService';
import { db } from '../../../config/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';

export default function Dashboard() {
  const [userRole, setUserRole] = useState('');
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [profileIncomplete, setProfileIncomplete] = useState(false); // State for incomplete profile

  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedRole = localStorage.getItem('userRole');
      setUserRole(storedRole || 'patient');

      if (storedRole) {
        isAuthenticated(async (authState) => {
          if (authState.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', authState.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                // Check if required fields are empty
                const requiredFields = storedRole === 'doctor'
                  ? ['name', 'surname', 'phoneNumber', 'about', 'specializations']
                  : ['name', 'surname', 'phoneNumber'];
                const isIncomplete = requiredFields.some((field) => !userData[field]);
                setProfileIncomplete(isIncomplete);
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          } else {
            console.error('User is not authenticated.');
          }
        });
      }
    };

    fetchUserProfile();

    // Fetch total appointments if the user is a doctor
    const storedRole = localStorage.getItem('userRole');
    if (storedRole === 'doctor') {
      fetchAppointments("all")
        .then((appointments) => {
          setTotalAppointments(appointments.length); // Set the total number of appointments
        })
        .catch((error) => {
          console.error("Error fetching appointments:", error);
        });
    }
  }, []);

  return (
    <div className="container mx-auto">
      {profileIncomplete && (
        <div className="alert alert-warning mb-6">
          <span>Your profile is incomplete. Please complete your profile to access all features.</span>
        </div>
      )}
      <div className="content">
        <h1 className="text-2xl font-bold mb-6">
          Welcome to your {userRole} dashboard!
        </h1>

        <p className="mt-2 mb-6">
          You are currently logged in as a {userRole}.
          Use the sidebar menu to navigate to different sections.
        </p>

        {/* Only show doctor search widget for patients */}
        {userRole !== 'doctor' && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Find a Doctor</h2>
            <DoctorSearchWidget />
          </div>
        )}

        {userRole === 'doctor' ? (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Doctor Dashboard Content */}
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total Appointments</div>
                <div className="stat-value">{totalAppointments}</div> {/* Display total appointments */}
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
