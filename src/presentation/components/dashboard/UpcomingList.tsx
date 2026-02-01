import { Appointment } from "@/domain/entities/Appointment";
import { ClockIcon, PhoneIcon } from "@heroicons/react/24/outline";
import React from "react";

type UpcomingListProps = {
  items: Appointment[];
  onJoin: (id: string) => void;
};

export function UpcomingList({ items, onJoin }: UpcomingListProps) {
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-xs text-gray-500">No upcoming appointments</p>}
      {items.map((appt) => (
        <div key={appt.id} className="flex items-center justify-between bg-purple-50 rounded-2xl px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-700">
              {appt.doctorName?.[0] ?? appt.patientName?.[0] ?? "A"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{appt.doctorName || appt.patientName}</p>
              <p className="text-xs text-gray-600 capitalize">{appt.appointmentType}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full bg-white px-3 py-1 text-purple-700 font-semibold flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {appt.preferredTime}
            </span>
            <button
              className="h-9 w-9 rounded-full border border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white flex items-center justify-center"
              onClick={() => onJoin(appt.id)}
            >
              <PhoneIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
