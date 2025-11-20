'use client';

import { useMemo, useState } from 'react';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';

const appointmentTabs = ['all', 'cancer-screening', 'pending', 'completed', 'cancelled'] as const;
type AppointmentTab = (typeof appointmentTabs)[number];

type Appointment = {
  id: string;
  type: string;
  patient: string;
  doctor: string;
  datetime: string;
  status: 'pending' | 'completed' | 'cancelled';
};

const appointments: Appointment[] = [
  {
    id: 'APT-3412',
    type: 'Cancer Screening',
    patient: 'Michael Chen',
    doctor: 'Dr. Maya Patel',
    datetime: '2024-10-04 09:00',
    status: 'completed',
  },
  {
    id: 'APT-3490',
    type: 'Follow-up',
    patient: 'Michael Chen',
    doctor: 'Dr. Sofia Hernandez',
    datetime: '2024-10-20 11:30',
    status: 'pending',
  },
  {
    id: 'APT-3520',
    type: 'Cancer Screening',
    patient: 'Daniel Murphy',
    doctor: 'Dr. Maya Patel',
    datetime: '2024-10-22 14:00',
    status: 'pending',
  },
  {
    id: 'APT-3522',
    type: 'Telehealth',
    patient: 'Ava Thompson',
    doctor: 'Dr. Sofia Hernandez',
    datetime: '2024-11-01 09:30',
    status: 'completed',
  },
  {
    id: 'APT-3530',
    type: 'Cancer Screening',
    patient: 'Luis Garcia',
    doctor: 'Dr. Maya Patel',
    datetime: '2024-11-02 10:30',
    status: 'cancelled',
  },
];

const cancerLogs = [
  {
    patient: 'Michael Chen',
    doctor: 'Dr. Maya Patel',
    screeningType: 'Colorectal',
    datetime: '2024-10-04 09:00',
    risk: 'Low',
    status: 'Results ready',
  },
  {
    patient: 'Daniel Murphy',
    doctor: 'Dr. Maya Patel',
    screeningType: 'Skin',
    datetime: '2024-10-22 14:00',
    risk: 'Elevated',
    status: 'Awaiting review',
  },
  {
    patient: 'Luis Garcia',
    doctor: 'Dr. Maya Patel',
    screeningType: 'Prostate',
    datetime: '2024-11-02 10:30',
    risk: 'Moderate',
    status: 'Cancelled by patient',
  },
];

export default function AppointmentsManagementPage() {
  const [tab, setTab] = useState<AppointmentTab>('all');
  const [search, setSearch] = useState('');
  const [doctor, setDoctor] = useState('');
  const [patient, setPatient] = useState('');
  const [type, setType] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesTab =
        tab === 'all'
          ? true
          : tab === 'cancer-screening'
            ? appointment.type.toLowerCase().includes('cancer')
            : appointment.status === tab;

      const matchesSearch =
        !search ||
        appointment.patient.toLowerCase().includes(search.toLowerCase()) ||
        appointment.doctor.toLowerCase().includes(search.toLowerCase()) ||
        appointment.id.toLowerCase().includes(search.toLowerCase());

      const matchesDoctor = !doctor || appointment.doctor === doctor;
      const matchesPatient = !patient || appointment.patient === patient;
      const matchesType = !type || appointment.type === type;

      const matchesDate = (() => {
        if (!dateRange.from && !dateRange.to) return true;
        const dateValue = new Date(appointment.datetime).getTime();
        const afterStart = dateRange.from ? dateValue >= new Date(dateRange.from).getTime() : true;
        const beforeEnd = dateRange.to ? dateValue <= new Date(dateRange.to).getTime() : true;
        return afterStart && beforeEnd;
      })();

      return matchesTab && matchesSearch && matchesDoctor && matchesPatient && matchesType && matchesDate;
    });
  }, [dateRange.from, dateRange.to, doctor, patient, search, tab, type]);

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <AdminHeader title="Appointments" />
      <div className="flex-1 space-y-6 p-6">
        <div className="card border shadow-sm">
          <div className="card-body space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="tabs tabs-boxed bg-base-200 text-sm">
                {appointmentTabs.map((item) => (
                  <button
                    key={item}
                    className={`tab ${tab === item ? 'tab-active' : ''}`}
                    onClick={() => setTab(item)}
                  >
                    {item === 'cancer-screening'
                      ? 'Cancer Screenings'
                      : item.charAt(0).toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search patient, doctor, ID"
                  className="input input-bordered input-sm w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-outline btn-sm">Export</button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <label className="form-control">
                <span className="label-text text-xs uppercase">Date from</span>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={dateRange.from}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs uppercase">Date to</span>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={dateRange.to}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                />
              </label>
              <label className="form-control">
                <span className="label-text text-xs uppercase">Doctor</span>
                <select className="select select-bordered select-sm" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                  <option value="">All doctors</option>
                  <option value="Dr. Maya Patel">Dr. Maya Patel</option>
                  <option value="Dr. Sofia Hernandez">Dr. Sofia Hernandez</option>
                </select>
              </label>
              <label className="form-control">
                <span className="label-text text-xs uppercase">Patient</span>
                <select className="select select-bordered select-sm" value={patient} onChange={(e) => setPatient(e.target.value)}>
                  <option value="">All patients</option>
                  <option value="Michael Chen">Michael Chen</option>
                  <option value="Daniel Murphy">Daniel Murphy</option>
                  <option value="Ava Thompson">Ava Thompson</option>
                  <option value="Luis Garcia">Luis Garcia</option>
                </select>
              </label>
              <label className="form-control">
                <span className="label-text text-xs uppercase">Appointment type</span>
                <select className="select select-bordered select-sm" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">All types</option>
                  <option value="Cancer Screening">Cancer Screening</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Telehealth">Telehealth</option>
                </select>
              </label>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-neutral">
                    <th>ID</th>
                    <th>Type</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date &amp; time</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover">
                      <td className="font-mono text-xs">{appointment.id}</td>
                      <td>{appointment.type}</td>
                      <td>{appointment.patient}</td>
                      <td>{appointment.doctor}</td>
                      <td>{appointment.datetime}</td>
                      <td>
                        <span className="badge badge-outline capitalize">{appointment.status}</span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <button className="btn btn-ghost btn-xs">View</button>
                          <button className="btn btn-ghost btn-xs">Edit</button>
                          <button className="btn btn-ghost btn-xs">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card border shadow-sm">
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral">Cancer Appointment Logs</p>
                <h3 className="text-lg font-semibold">Screening Insights</h3>
              </div>
              <button className="btn btn-outline btn-sm">Export cancer logs</button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {cancerLogs.map((log) => (
                <div key={`${log.patient}-${log.datetime}`} className="rounded-lg border p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{log.patient}</p>
                    <span className="badge badge-primary badge-outline">{log.risk} risk</span>
                  </div>
                  <p className="text-neutral">Doctor: {log.doctor}</p>
                  <p className="text-neutral">Screening: {log.screeningType}</p>
                  <p className="text-neutral">{log.datetime}</p>
                  <p className="font-medium">Status: {log.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
