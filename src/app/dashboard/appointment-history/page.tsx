import { useAppointments } from '../../hooks/useAppointments';

export default function AppointmentHistoryPage() {
  const { appointments, loading, error } = useAppointments();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Appointment History</h1>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <p>Doctor: {appointment.doctorName || 'N/A'}</p>
              <p>Date: {appointment.preferredDate || 'N/A'}</p>
              <p>Time: {appointment.preferredTime || 'N/A'}</p>
              <p>Status: {appointment.status || 'N/A'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
