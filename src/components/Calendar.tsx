import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAppointments } from "../hooks/useAppointments";

const localizer = momentLocalizer(moment);

export default function AppointmentsCalendar() {
  const { appointments, isLoading, error } = useAppointments();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ height: "80vh" }}>
      <Calendar
        localizer={localizer}
        events={appointments.map((appointment) => ({
          title: appointment.appointmentType || "Appointment",
          start: appointment.start, // Ensure this is a valid Date object
          end: appointment.end,     // Ensure this is a valid Date object
        }))}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}
