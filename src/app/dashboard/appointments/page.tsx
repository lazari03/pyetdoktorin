"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../../config/firebaseconfig";
import { collection, query, where, getDocs, or } from "firebase/firestore";
import { db } from "../../../../config/firebaseconfig";

export default function AppointmentsPage() {
  const router = useRouter();

  interface Appointment {
    id: string;
    createdAt: string;
    appointmentType: string;
    notes: string;
    status: "pending" | "completed" | "canceled";
  }

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const user = auth.currentUser;
      if (!user) {
        return router.push("/login");
      }

      try {
        const userId = user.uid;

        const appointmentsQuery = query(
          collection(db, "appointments"),
          or(
            where("doctorId", "==", userId), // Match appointments by doctorId
            where("patientId", "==", userId) // Match appointments by patientId
          )
        );

        const querySnapshot = await getDocs(appointmentsQuery);
        const fetchedAppointments = querySnapshot.docs
          .filter((doc) => {
            const data = doc.data();
            return (
              data.doctorId === userId || data.patientId === userId // Ensure only relevant appointments are included
            );
          })
          .map((doc) => ({
            id: doc.id,
            createdAt: doc.data().createdAt || "",
            appointmentType: doc.data().appointmentType || "Unknown",
            notes: doc.data().notes || "No notes",
            status: (doc.data().status || "pending") as Appointment["status"],
          }));

        setAppointments(
          fetchedAppointments.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch (error) {
        console.error("Error loading appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading appointments...</span>
      </div>
    );
  }

  const statusClasses = {
    completed: "badge badge-success",
    pending: "badge badge-warning",
    canceled: "badge badge-error",
  };

  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <h1 className="card-title mb-4">Appointment History</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Notes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{new Date(appointment.createdAt).toLocaleString()}</td>
                <td>{appointment.appointmentType}</td>
                <td>{appointment.notes}</td>
                <td>
                  <span className={statusClasses[appointment.status]}>
                    {appointment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
