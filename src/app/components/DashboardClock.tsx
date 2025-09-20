import { useEffect, useState } from "react";

export default function DashboardClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format as HH:MM:SS (24-hour)
      const formatted = now.toLocaleTimeString([], { hour12: false });
      setTime(formatted);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start justify-center min-w-[300px] min-h-[100px]">
      <span className="text-lg font-semibold text-gray-700 mb-2">Current Time</span>
      <span className="text-3xl font-extrabold text-blue-500 mb-1">{time}</span>
      <span className="text-base text-gray-500 mb-2">Local time</span>
    </div>
  );
}
