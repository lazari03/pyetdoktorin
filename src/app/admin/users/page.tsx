'use client';

import { useState } from 'react';
import { AdminHeader } from '@/presentation/components/admin/AdminHeader';

const initialProfile = {
  name: 'Michael Chen',
  email: 'michael.chen@patient.com',
  role: 'patient',
  specialization: 'Oncology',
  assignedDoctors: ['Dr. Maya Patel', 'Dr. Sofia Hernandez'],
  assignedPatients: ['Daniel Murphy', 'Ava Thompson'],
  status: 'active',
  phone: '+1 (650) 555-2040',
  address: '250 Mission St, San Francisco, CA',
  appointmentHistory: [
    { id: 'APT-3412', type: 'Cancer Screening', date: 'Oct 04, 2024', doctor: 'Dr. Patel', status: 'Completed' },
    { id: 'APT-3490', type: 'Follow-up', date: 'Oct 20, 2024', doctor: 'Dr. Hernandez', status: 'Pending' },
    { id: 'APT-3522', type: 'Telehealth', date: 'Nov 01, 2024', doctor: 'Dr. Patel', status: 'Completed' },
  ],
};

type Profile = typeof initialProfile;

export default function UserProfileEditorPage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  const updateField = (key: keyof Profile, value: Profile[typeof key]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <AdminHeader title="User Profile Editor" />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card border shadow-sm lg:col-span-2">
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral">Profile</p>
                  <h2 className="text-xl font-semibold">Identity & Access</h2>
                </div>
                <div className="space-x-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => setProfile(initialProfile)}>
                    Reset
                  </button>
                  <button className="btn btn-primary btn-sm">Save Changes</button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Full name</span>
                  </div>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={profile.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Email</span>
                  </div>
                  <input
                    type="email"
                    className="input input-bordered"
                    value={profile.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Role</span>
                  </div>
                  <select
                    className="select select-bordered"
                    value={profile.role}
                    onChange={(e) => updateField('role', e.target.value as Profile['role'])}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Status</span>
                  </div>
                  <select
                    className="select select-bordered"
                    value={profile.status}
                    onChange={(e) => updateField('status', e.target.value as Profile['status'])}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                    <option value="invited">Invited</option>
                  </select>
                </label>
              </div>

              {profile.role === 'doctor' && (
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Specialization</span>
                  </div>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={profile.specialization}
                    onChange={(e) => updateField('specialization', e.target.value)}
                  />
                </label>
              )}

              {profile.role === 'patient' && (
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Assigned Doctors</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.assignedDoctors.map((doctor) => (
                      <span key={doctor} className="badge badge-outline">
                        {doctor}
                      </span>
                    ))}
                    <button className="btn btn-xs btn-ghost">Add</button>
                  </div>
                </label>
              )}

              {profile.role === 'doctor' && (
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Assigned Patients</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.assignedPatients.map((patient) => (
                      <span key={patient} className="badge badge-outline">
                        {patient}
                      </span>
                    ))}
                    <button className="btn btn-xs btn-ghost">Manage</button>
                  </div>
                </label>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Contact number</span>
                  </div>
                  <input
                    type="tel"
                    className="input input-bordered"
                    value={profile.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Address</span>
                  </div>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={profile.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card border shadow-sm">
              <div className="card-body space-y-2">
                <p className="text-xs uppercase tracking-wide text-neutral">Account quick actions</p>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-outline btn-sm">Impersonate</button>
                  <button className="btn btn-outline btn-sm">Reset MFA</button>
                  <button className="btn btn-outline btn-sm">Send welcome email</button>
                  <button className="btn btn-error btn-sm text-white">Disable account</button>
                </div>
              </div>
            </div>

            <div className="card border shadow-sm">
              <div className="card-body space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral">Appointments</p>
                    <h3 className="text-lg font-semibold">History & Signals</h3>
                  </div>
                  <span className="badge badge-primary">{profile.appointmentHistory.length} records</span>
                </div>
                <div className="space-y-3 text-sm">
                  {profile.appointmentHistory.map((item) => (
                    <div key={item.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.type}</p>
                          <p className="text-neutral">{item.date}</p>
                        </div>
                        <span className="badge badge-outline">{item.status}</span>
                      </div>
                      <p className="text-neutral">With {item.doctor}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
