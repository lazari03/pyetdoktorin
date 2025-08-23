"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../../../config/firebaseconfig";
import { doc, getDoc, collection, updateDoc } from "firebase/firestore";
import { useAppointmentStore } from "../../../store/appointmentStore";
import Link from "next/link";
import styles from "./notifications.module.css";

function NotificationsPage() {
  const router = useRouter();
  const { appointments, loading: isLoading, error, fetchAppointments } = useAppointmentStore();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<
    { id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string }[]
  >([]);
  const [pendingAppointments, setPendingAppointments] = useState<
    { id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string; status?: string }[]
  >([]);

  useEffect(() => {
    const fetchUserRoleAndAppointments = async () => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role;
        setUserRole(role);
        // Always fetch latest notifications when visiting the page
        await fetchAppointments(auth.currentUser.uid, role === "doctor");
      } else {
        console.warn("User not found");
        router.push("/login");
      }
    };

    fetchUserRoleAndAppointments();
  }, [router, fetchAppointments]);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      const details = await Promise.all(
        appointments.map(async (appointment) => {
          try {
            const appointmentRef = doc(collection(db, "appointments"), appointment.id);
            const appointmentSnap = await getDoc(appointmentRef);

            if (!appointmentSnap.exists()) {
              throw new Error("Appointment not found");
            }

            const { patientId, doctorId, preferredDate, notes } = appointmentSnap.data();

            let patientName: string | null = null;
            let doctorName: string | null = null;

            if (patientId) {
              const patientRef = doc(collection(db, "users"), patientId);
              const patientSnap = await getDoc(patientRef);
              if (patientSnap.exists()) {
                patientName = patientSnap.data().name;
              }
            }

            if (doctorId) {
              const doctorRef = doc(collection(db, "users"), doctorId);
              const doctorSnap = await getDoc(doctorRef);
              if (doctorSnap.exists()) {
                doctorName = doctorSnap.data().name;
              }
            }

            return {
              id: appointment.id,
              patientName,
              doctorName,
              preferredDate: preferredDate || '',
              notes: notes || ''
            };
          } catch (err) {
            console.error(`Error fetching details for appointment ${appointment.id}:`, err);
            return { id: appointment.id, patientName: null, doctorName: null, preferredDate: '', notes: '' };
          }
        })
      );
      setAppointmentDetails(details);
    };

    if (appointments.length > 0) {
      fetchAppointmentDetails();
    }
  }, [appointments]);

  useEffect(() => {
    const fetchRelevantAppointments = async () => {
      if (userRole === "doctor") {
        const pending = appointmentDetails.filter(
          (appointment) => appointments.find((a) => a.id === appointment.id)?.status === "pending"
        );
        setPendingAppointments(pending);
      } else if (userRole === "patient") {
        // For patients, show all their appointments with status and doctor name
        const withStatus = appointmentDetails.map((appointment) => {
          const found = appointments.find((a) => a.id === appointment.id);
          return { ...appointment, status: found?.status || "pending", doctorName: found?.doctorName || appointment.doctorName };
        });
        setPendingAppointments(withStatus);
      }
    };

    if (userRole && appointmentDetails.length > 0) {
      fetchRelevantAppointments();
    }
  }, [userRole, appointmentDetails, appointments]);

  const handleAppointmentAction = async (appointmentId: string, action: "accepted" | "rejected") => {
    try {
      const appointmentRef = doc(collection(db, "appointments"), appointmentId);
      await updateDoc(appointmentRef, { status: action }); // Ensure status is updated correctly
      setPendingAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentId)
      );
      // Send SMS to patient if accepted
      if (action === "accepted") {
        // Notify patient via API
        const appointmentSnap = await getDoc(appointmentRef);
        if (appointmentSnap.exists()) {
          const { patientId, doctorName } = appointmentSnap.data();
          if (patientId && doctorName) {
            await fetch('/api/sms/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'appointment-accepted',
                patientId,
                doctorName,
              }),
            });
          }
        }
      }
    } catch (err) {
      console.error(`Error updating appointment ${appointmentId}:`, err);
    }
  };

  if (error) {
    console.warn(error);
    return router.push("/dashboard");
  }

  if (isLoading || !userRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading notifications...</span>
      </div>
    );
  }

  if (pendingAppointments.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-500">
        <p className="mb-4">No new notifications</p>
        <Link href="/dashboard">
          <button className="btn btn-primary">Back to Home</button>
        </Link>
      </div>
    );
  }

    return (
  <div className="min-h-screen bg-base-100 py-8 px-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 text-center tracking-tight">Pending Appointments</h1>
        <div className={`overflow-x-auto max-w-6xl mx-auto ${styles['animate-pop-up']} ${styles['widget-elevated']}`}> 
          <table className="w-full text-base font-medium bg-transparent">
            <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
              <tr>
                <th className="px-3 py-3 text-left text-gray-700 font-semibold">Patient Name</th>
                <th className="px-3 py-3 text-left text-gray-700 font-semibold">Doctor</th>
                <th className="px-3 py-3 text-left text-gray-700 font-semibold">Date</th>
                <th className="px-3 py-3 text-left text-gray-700 font-semibold">Notes</th>
                <th className="px-3 py-3 text-center text-gray-700 font-semibold">Status</th>
                <th className="px-3 py-3 text-center text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAppointments.map((appointment, idx) => (
                <tr key={appointment.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-3 align-middle text-gray-800 whitespace-nowrap rounded-l-xl">{appointment.patientName || "Unknown"}</td>
                  <td className="px-3 py-3 align-middle text-gray-700 whitespace-nowrap">{appointment.doctorName || "Unknown"}</td>
                  <td className="px-3 py-3 align-middle text-gray-700 whitespace-nowrap">{appointment.preferredDate || "-"}</td>
                  <td className="px-3 py-3 align-middle text-gray-700 whitespace-nowrap">{appointment.notes || "-"}</td>
                  <td className="px-3 py-3 align-middle text-center">
                    {appointment.status === 'accepted' && <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Accepted</span>}
                    {appointment.status === 'rejected' && <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Rejected</span>}
                    {appointment.status === 'pending' && <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">Pending</span>}
                  </td>
                  <td className="px-3 py-3 align-middle text-center rounded-r-xl">
                    <div className="flex flex-row gap-2 justify-center items-center">
                      {userRole === 'doctor' ? (
                        <>
                          <button
                            className="transition-all duration-150 ease-in-out bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 w-24"
                            onClick={() => handleAppointmentAction(appointment.id, "accepted")}
                          >
                            Accept
                          </button>
                          <button
                            className="transition-all duration-150 ease-in-out bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 w-24"
                            onClick={() => handleAppointmentAction(appointment.id, "rejected")}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        appointment.status === 'rejected' && (
                          <Link href="/dashboard/new-appointment">
                            <button className="transition-all duration-150 ease-in-out bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 w-28">
                              Reschedule
                            </button>
                          </Link>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
}

export default NotificationsPage;
