"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAppointments } from "../../services/appointmentService";
import { auth } from "../../../../config/firebaseconfig";

export default function AppointmentsPage() {
  const router = useRouter();
  
  interface Appointment {
    id: string;
    createdAt: string;
    appointmentType: string;
    notes: string;
    status: "completed" | "pending" | "canceled";
  }

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      if (!user) return router.push("/login");

      try {
        if (new Date((await user.getIdTokenResult()).expirationTime).getTime() - Date.now() < 3600000) {
          await user.getIdToken(true);
        }

        const fetchedAppointments = await fetchAppointments("all");
        setAppointments(
          fetchedAppointments
            .map((appointment: any) => ({
              id: appointment.id,
              createdAt: appointment.createdAt ?? "", // Default to empty string
              appointmentType: appointment.appointmentType ?? "Unknown",
              notes: appointment.notes ?? "No notes",
              status: (appointment.status ?? "pending") as Appointment["status"], // Explicitly cast status
            }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        
      } catch (error) {
        console.error("Error loading appointments:", error);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

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
            <tr>{["Date", "Type", "Notes", "Status", "Actions"].map((header) => <th key={header} className="text-left">{header}</th>)}</tr>
          </thead>
          <tbody>
            {appointments.map(({ id, createdAt, appointmentType, notes, status }) => (
              <tr key={id} className="hover:bg-gray-100">
                <td>{new Date(createdAt).toLocaleDateString()}</td>
                <td>{appointmentType}</td>
                <td>{notes}</td>
                <td><div className={statusClasses[status]}>{status[0].toUpperCase() + status.slice(1)}</div></td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => router.push(`/dashboard/appointments/video-session?appointmentId=${id}`)}>
                    View
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
