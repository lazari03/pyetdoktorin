import { useState } from "react";
import { useAppointmentStore } from "../../store/appointmentStore";
import { Appointment } from "../../models/Appointment";

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  // Create a new date object for Monday of the current week (no mutation)
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};




const filterAppointments = (appointments: Appointment[], period: string) => {
  // removed unused now
  if (period === "all") {
    return appointments;
  }
  let start: Date;
  if (period === "week") {
    start = getStartOfWeek();
    const endOfWeek = new Date(start);
    endOfWeek.setDate(start.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const filtered = appointments.filter((a) => {
      const date = new Date(a.preferredDate + 'T' + (a.preferredTime || '00:00'));
      return date >= start && date <= endOfWeek;
    });
    if (process.env.NODE_ENV !== 'production') {
      // Debug log for troubleshooting
      console.log('[DoctorRevenueWidget] Week:', {
        start,
        endOfWeek,
        filtered: filtered as Appointment[],
        all: appointments as Appointment[],
      });
    }
    return filtered;
  } else if (period === "month") {
    start = getStartOfMonth();
    const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    const filtered = appointments.filter((a) => {
      const date = new Date(a.preferredDate + 'T' + (a.preferredTime || '00:00'));
      return date >= start && date <= endOfMonth;
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DoctorRevenueWidget] Month:', {
        start,
        endOfMonth,
        filtered: filtered as Appointment[],
        all: appointments as Appointment[],
      });
    }
    return filtered;
  }
  // fallback: all
  return appointments;
};

export default function DoctorRevenueWidget() {
  const { appointments } = useAppointmentStore();
  const [period, setPeriod] = useState("all");


  const filtered = filterAppointments(appointments, period);

  const earnings = filtered.length * 5;

  // Prepare graph data (simple bar graph)
  const graphData = [
    { label: "Appointments", value: filtered.length },
    { label: "Earnings (€)", value: earnings },
  ];

  return (
  <div className="bg-white rounded-2xl shadow-md p-6 min-w-[300px] min-h-[100px] flex flex-col items-start">
  <span className="text-lg font-semibold text-[#58becc  ] mb-2">Revenue</span>
      <div className="flex gap-2 mb-4">
  <button onClick={() => setPeriod("all")} className={`chip ${period === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"} px-3 py-1 rounded-full font-semibold text-sm`}>All Time</button>
  <button onClick={() => setPeriod("month")} className={`chip ${period === "month" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"} px-3 py-1 rounded-full font-semibold text-sm`}>This Month</button>
  <button onClick={() => setPeriod("week")} className={`chip ${period === "week" ? "bg-primary text-white" : "bg-gray-100 text-gray-700"} px-3 py-1 rounded-full font-semibold text-sm`}>This Week</button>
      </div>
      <span className="text-3xl font-extrabold text-green-500 mb-1">€{earnings}</span>
      <span className="text-base text-gray-500 mb-4">Doctor earns €5 per appointment</span>
      {/* Simple bar graph */}
      <div className="w-full flex gap-4 items-end h-24 mt-2">
        {graphData.map((d) => (
          <div key={d.label} className="flex flex-col items-center justify-end h-full">
            <div className="bg-green-300 w-8" style={{ height: `${d.value * 10}px` }}></div>
            <span className="text-xs mt-1 text-gray-700">{d.label}</span>
            <span className="text-xs font-bold text-gray-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
