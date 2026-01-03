import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface AppointmentEvent {
  appointmentType?: string;
  start: Date;
  end: Date;
  [key: string]: unknown;
}

interface AppointmentsCalendarProps {
  appointments: AppointmentEvent[];
  isLoading?: boolean;
  error?: string | null;
}

export default function AppointmentsCalendar({ appointments, isLoading, error }: AppointmentsCalendarProps) {
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
          start: appointment.start,
          end: appointment.end,
        }))}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}
