'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAppointments } from '../../services/appointmentService';

interface Appointment {
  id: string;
  doctorId: string;
  appointmentType: string;
  // Add other fields as needed
}

export default function UpcomingRequestsPage() {
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const fetchedRequests = await fetchAppointments('pending');
        const mappedRequests = fetchedRequests.map((request: { id: string; doctorId?: string; appointmentType?: string }) => ({
          id: request.id,
          doctorId: request.doctorId || 'Unknown Doctor',
          appointmentType: request.appointmentType || 'Unknown Type',
        }));
        setRequests(mappedRequests);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleJoin = (requestId: string) => {
    router.push(`/dashboard/chat-room/${requestId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upcoming Requests</h1>
      {requests.length === 0 ? (
        <p>No upcoming requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">Appointment with {request.doctorId}</h2>
                <p>Type: {request.appointmentType}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleJoin(request.id)}
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
