"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAppointmentsPage } from "../../hooks/useAppointmentsPage";
import Link from "next/link";
import { db } from "../../../../config/firebaseconfig"; // Import Firestore instance
import { doc, updateDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id") || null; // Add null-safe access

  const {
    user,
    role,
    authLoading,
    appointments,
    isLoading,
    error,
    appointmentDetails,
  } = useAppointmentsPage();

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handlePayNow = async (appointmentId: string, amount: number) => {
    console.log(`Pay Now clicked for appointment ID: ${appointmentId}`);
    setLoadingPayment(true);
    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, amount }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", errorText);
        throw new Error(errorText || "Failed to create payment intent");
      }

      const { url } = await response.json();
      console.log("Redirecting to Stripe Checkout page:", url);

      // Redirect to Stripe's hosted checkout page
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleJoinCall = (appointmentId: string) => {
    console.log(`Join Call clicked for appointment ID: ${appointmentId}`);
    // Add join call logic here
  };

  const updateAppointmentStatus = async (appointmentId: string) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, { isPaid: true });
      console.log(`Appointment ${appointmentId} marked as paid.`);
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const verifyPayment = async (sessionId: string) => {
    console.log("Verifying payment for sessionId:", sessionId);
    try {
      const response = await fetch(`/api/stripe/verify-payment?session_id=${sessionId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from verify-payment API:", errorText);
        throw new Error("Failed to verify payment");
      }

      const { appointmentId } = await response.json();
      console.log(`Payment verified for appointment ID: ${appointmentId}`);

      // Update the appointment status in Firestore
      await updateAppointmentStatus(appointmentId);

      // Show success message
      setShowSuccessMessage(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [sessionId]);

  if (authLoading || isLoading || !role || appointmentDetails.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    console.warn(error);
    return router.push("/dashboard");
  }

  const statusClasses = {
    completed: "badge badge-success",
    pending: "badge badge-warning",
    canceled: "badge badge-error",
  };

  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <h1 className="card-title mb-4">Dashboard</h1>
      {showSuccessMessage && (
        <div className="alert alert-success mb-4 flex justify-between items-center">
          <span>Payment was successful!</span>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={() => setShowSuccessMessage(false)}
          >
            ✕
          </button>
        </div>
      )}
      <h2 className="card-title mb-4">Appointment History</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Name</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
              const details = appointmentDetails.find((d) => d.id === appointment.id);

              return (
                <tr key={appointment.id}>
                  <td>
                    {appointment.preferredDate && appointment.preferredTime
                      ? `${appointment.preferredDate} at ${appointment.preferredTime}`
                      : "N/A"}
                  </td>
                  <td>{appointment.appointmentType}</td>
                  <td>
                    {details
                      ? role === "doctor"
                        ? details.patientName || "Unknown"
                        : details.doctorName || "Unknown"
                      : "Loading..."}
                  </td>
                  <td>{appointment.notes}</td>
                  <td>
                    <span className={statusClasses[appointment.status]}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {appointment.isPaid ? (
                      <button
                        className="btn btn-primary btn-sm" // Same size as Pay Now button
                        onClick={() => handleJoinCall(appointment.id)}
                      >
                        Join Call
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handlePayNow(appointment.id, 5000)} // Pass the appointmentId and amount (e.g., $50.00 = 5000 cents)
                        disabled={loadingPayment}
                      >
                        {loadingPayment ? "Processing..." : "Pay Now"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}