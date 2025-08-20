"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../../../config/firebaseconfig";
import { doc, getDoc, collection, updateDoc } from "firebase/firestore";
import { useAppointmentStore } from "../../../store/appointmentStore";
import Link from "next/link";

function NotificationsPage() {
  const router = useRouter();
  const { appointments, loading: isLoading, error, fetchAppointments } = useAppointmentStore();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<
    { id: string; patientName: string | null; doctorName: string | null }[]
  >([]);
  const [pendingAppointments, setPendingAppointments] = useState<
    { id: string; patientName: string | null; doctorName: string | null }[]
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

            const { patientId, doctorId } = appointmentSnap.data();

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
              doctorName 
            };
          } catch (err) {
            console.error(`Error fetching details for appointment ${appointment.id}:`, err);
            return { id: appointment.id, patientName: null, doctorName: null };
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
    const fetchPendingAppointments = async () => {
      if (userRole === "doctor") {
        const pending = appointmentDetails.filter(
          (appointment) => appointments.find((a) => a.id === appointment.id)?.status === "pending"
        );
        setPendingAppointments(pending);
      }
    };

    if (userRole && appointmentDetails.length > 0) {
      fetchPendingAppointments();
    }
  }, [userRole, appointmentDetails, appointments]); // Added 'appointments' to the dependency array

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
    <div className="card bg-base-100 shadow-xl p-6">
      <h1 className="card-title mb-4">Pending Appointments</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.patientName || "Unknown"}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm mr-2"
                    onClick={() => handleAppointmentAction(appointment.id, "accepted")}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => handleAppointmentAction(appointment.id, "rejected")}
                  >
                    Reject
                  </button>
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
