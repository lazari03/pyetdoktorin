import { useState } from "react";
import { useAppointmentStore } from "../../store/appointmentStore";
import { Appointment } from "../../models/Appointment";

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  return new Date(now.setDate(diff));
};

const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const getStartOfYear = () => {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
};

const filterAppointments = (appointments: Appointment[], period: string) => {
  const now = new Date();
  let start;
  if (period === "week") start = getStartOfWeek();
  else if (period === "month") start = getStartOfMonth();
  else start = getStartOfYear();
  return appointments.filter((a) => {
    const date = new Date(`${a.preferredDate}T${a.preferredTime}`);
    return date >= start && date <= now;
  });
};

export default function DoctorRevenueWidget() {
  const { appointments } = useAppointmentStore();
  const [period, setPeriod] = useState("all");

  let filtered = appointments;
  if (period === "week") filtered = filterAppointments(appointments, "week");
  else if (period === "month") filtered = filterAppointments(appointments, "month");
  // 'all' shows all appointments

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
