"use client";

import Calendar from "./Calendar";

export default function DoctorDashboard() {
  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <h1 className="card-title mb-4">Doctor's Dashboard</h1>
      <Calendar />
    </div>
  );
}
