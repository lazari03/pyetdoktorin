'use client';

import { useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default function ChatRoomPage({ params }: PageProps) {
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequestId = async () => {
      const resolvedParams = await params;
      setRequestId(resolvedParams.requestId);
    };

    fetchRequestId();
  }, [params]);

  if (!requestId) {
    return <p>Loading...</p>;
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Chat Room</h1>
      <p>Request ID: {requestId}</p>
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        {/* Video call component goes here */}
        <p>Video Call Placeholder</p>
      </div>
    </div>
  );
}
