import { useAppointments } from '../../hooks/useAppointments';

export default function AppointmentHistoryPage() {
  const { appointments, isLoading, error } = useAppointments();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Sort appointments by preferredDate from latest to oldest
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = a.preferredDate ? new Date(a.preferredDate).getTime() : 0;
    const dateB = b.preferredDate ? new Date(b.preferredDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div>
      <h1>Appointment History</h1>
      {sortedAppointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul>
          {sortedAppointments.map((appointment) => (
            <li key={appointment.id}>
              <p>Doctor: {appointment.doctorName || 'N/A'}</p>
              <p>
                Date & Time:{" "}
                {appointment.preferredDate && appointment.preferredTime
                  ? `${appointment.preferredDate} at ${appointment.preferredTime}`
                  : "N/A"}
              </p>
              <p>Status: {appointment.status || 'N/A'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
