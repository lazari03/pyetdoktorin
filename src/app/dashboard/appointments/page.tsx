"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseconfig";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName?: string; // Added for doctor view
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  isPaid: boolean;
  createdAt: string;
}

export default function AppointmentsPage() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDoctor, setIsDoctor] = useState<boolean | null>(null); // Use `null` to indicate loading state

  useEffect(() => {
    if (user) {
      // Determine if the user is a doctor
      const checkIfDoctor = async () => {
        const userRole = await getUserRole(user.uid);
        setIsDoctor(userRole === "doctor");
      };

      checkIfDoctor();
    }
  }, [user]);

  useEffect(() => {
    if (user && isDoctor !== null) {
      // Fetch appointments after determining the user's role
      const fetchAppointments = async () => {
        try {
          const q = query(
            collection(db, "appointments"),
            where(isDoctor ? "doctorId" : "patientId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const fetchedAppointments = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Appointment[];
          setAppointments(fetchedAppointments);
        } catch (error) {
          console.error("Error fetching appointments:", error);
        }
      };

      fetchAppointments();
    }
  }, [user, isDoctor]);

  const handlePayNow = (appointmentId: string) => {
    console.log(`Pay Now clicked for appointment ID: ${appointmentId}`);
    // Add payment logic here
  };

  const handleJoinCall = (appointmentId: string) => {
    console.log(`Join Call clicked for appointment ID: ${appointmentId}`);
    // Add join call logic here
  };

  const isCompleted = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime < new Date();
  };

  if (isDoctor === null) {
    // Show a loading state while determining the user's role
    return <div>Loading...</div>;
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Your Appointments</h2>
        <div className="overflow-x-auto mt-6">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>{isDoctor ? "Patient" : "Doctor"}</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Notes</th>
                <th>Status</th>
                {!isDoctor && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{isDoctor ? appointment.patientName || "N/A" : appointment.doctorName}</td>
                  <td>{appointment.appointmentType}</td>
                  <td>{appointment.preferredDate}</td>
                  <td>{appointment.preferredTime}</td>
                  <td>{appointment.notes}</td>
                  <td>
                    {isCompleted(appointment.preferredDate, appointment.preferredTime) ? (
                      <span className="text-gray-500 font-bold">Completed</span>
                    ) : appointment.isPaid ? (
                      <span className="text-green-500 font-bold">Paid</span>
                    ) : (
                      <span className="text-red-500 font-bold">Unpaid</span>
                    )}
                  </td>
                  {!isDoctor && (
                    <td>
                      {isCompleted(appointment.preferredDate, appointment.preferredTime) ? (
                        <span className="text-gray-500">No Actions</span>
                      ) : appointment.isPaid ? (
                        <button
                          className="btn btn-accent"
                          onClick={() => handleJoinCall(appointment.id)}
                        >
                          Join Now
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handlePayNow(appointment.id)}
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Production-ready function to fetch user role
async function getUserRole(userId: string): Promise<string> {
  try {
    const userRef = doc(db, "users", userId); // Reference to the user's document
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role || "patient"; // Return the role, default to "patient" if not specified
    } else {
      console.error("User document does not exist.");
      return "patient"; // Default to "patient" if user document is missing
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "patient"; // Default to "patient" in case of an error
  }
}