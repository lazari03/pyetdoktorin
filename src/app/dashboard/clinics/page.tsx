'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Clinic } from '@/domain/entities/Clinic';
import { z } from '@/config/zIndex';
import { backendFetch } from '@/network/backendClient';
import { UserRole } from '@/domain/entities/UserRole';

export default function ClinicsPage() {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [note, setNote] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const userEmail = (user as { email?: string } | null)?.email ?? '';
  const userPhone = (user as { phoneNumber?: string } | null)?.phoneNumber ?? '';
  const userDisplayName = user?.name || userEmail.split('@')[0] || 'Patient';

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const response = await backendFetch<{ items: Clinic[] }>('/api/clinics/catalog', { method: 'GET' });
        setClinics(response.items);
      } catch (error) {
        console.error('Failed to load clinics', error);
      } finally {
        setLoading(false);
      }
    };
    loadClinics();
  }, []);

  const canBook = role === UserRole.Patient;

  const handleBooking = async () => {
    if (!selectedClinic || !user) return;
    if (!note.trim()) {
      setFeedback({ type: 'error', text: t('noteRequired') || 'Please add a short note' });
      return;
    }
    setSubmitting(true);
    try {
      await backendFetch('/api/clinics/bookings', {
        method: 'POST',
        body: JSON.stringify({
          clinicId: selectedClinic.id,
          clinicName: selectedClinic.name,
          patientName: userDisplayName,
          patientEmail: userEmail,
          patientPhone: userPhone,
          note,
          preferredDate,
        }),
      });
      setFeedback({ type: 'success', text: t('bookingSubmitted') || 'Booking request sent' });
      setNote('');
      setPreferredDate('');
      setSelectedClinic(null);
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', text: t('bookingFailed') || 'Failed to submit booking' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!canBook) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('patientsOnly') || 'This section is available to patients only'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('privateClinics') || 'Private Clinics'}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {t('privateClinicsSubtitle') || 'Choose a clinic and send a booking request'}
            </p>
          </div>
          <Link
            href="/dashboard/clinics/history"
            className="text-sm font-semibold text-purple-600 hover:underline"
          >
            {t('viewRequests') || 'View requests'}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">{t('loading') || 'Loading...'}</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {clinics.map((clinic) => (
              <div key={clinic.id} className="bg-white rounded-2xl shadow-md border border-purple-50 overflow-hidden flex flex-col">
                {clinic.imageUrl && (
                  <div className="relative h-40 w-full">
                    <Image src={clinic.imageUrl} alt={clinic.name} fill className="object-cover" />
                  </div>
                )}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{clinic.name}</h2>
                    <p className="text-sm text-gray-500">{clinic.address}</p>
                  </div>
                  <p className="text-sm text-gray-600">{clinic.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {clinic.specialties.map((spec) => (
                      <span key={spec} className="px-3 py-1 rounded-full text-xs bg-purple-50 text-purple-700">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{clinic.phone}</p>
                    <p>{clinic.email}</p>
                  </div>
                  <button
                    className="mt-auto inline-flex justify-center items-center rounded-full bg-purple-600 text-white text-sm font-semibold px-4 py-2 hover:bg-purple-500 transition"
                    onClick={() => {
                      setSelectedClinic(clinic);
                    }}
                  >
                    {t('bookClinic') || 'Book this clinic'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {feedback && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-green-50 border-green-100 text-green-700'
                : 'bg-red-50 border-red-100 text-red-700'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {selectedClinic && (
        <div className={`fixed inset-0 bg-black/40 flex items-center justify-center px-4 ${z.modal}`}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button className="absolute top-4 right-4 text-gray-500" onClick={() => setSelectedClinic(null)}>
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              {t('bookingRequest') || 'Booking Request'} – {selectedClinic.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">{t('yourName') || 'Your name'}</label>
                <input type="text" value={userDisplayName} disabled className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Email</label>
                  <input type="email" value={userEmail} disabled className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">{t('phone') || 'Phone'}</label>
                  <input type="tel" value={userPhone} disabled className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">{t('preferredDate') || 'Preferred date'}</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">{t('noteToClinic') || 'Note for the clinic'}</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder={t('notePlaceholder') || 'Describe your request or symptoms'}
                />
              </div>
              <button
                onClick={handleBooking}
                disabled={submitting}
                className="w-full rounded-full bg-purple-600 text-white font-semibold py-3 text-sm hover:bg-purple-500 transition disabled:opacity-50"
              >
                {submitting ? t('sending') || 'Sending...' : t('submitBooking') || 'Submit booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
