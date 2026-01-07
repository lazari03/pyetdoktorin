'use client';

import { useMyProfile } from '../../../hooks/useMyProfile';
import Loader from '../../components/Loader';
import MyProfileForm from '@/app/components/MyProfile/MyProfileForm';
import PasswordResetSection from '@/app/components/MyProfile/PasswordResetSection';

export default function MyProfile() {
  const {
    formData,
    role,
    resetEmailSent,
    isFetching,
    authLoading,
    uploading,
    handleInputChange,
    handleAddField,
    handleRemoveField,
    handlePasswordReset,
    handleSubmit,
    handleProfilePictureChange,
  } = useMyProfile();

  if (authLoading || isFetching) {
    return <Loader />;
  }

  const nameForInitials = formData.name || formData.email || 'User';
  const initials = nameForInitials
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-6 lg:py-10">
        <header className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Preview your profile on the left and update your details on the right.
          </p>
        </header>

        <div className="bg-white rounded-3xl border border-gray-100 px-4 sm:px-6 py-5 sm:py-6 flex flex-col md:flex-row gap-6">
          {/* LEFT: avatar preview */}
          <section className="md:w-1/3 flex flex-col items-center md:items-start gap-4 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-6">
            <div className="flex flex-col items-center gap-3">
              {/* Avatar circle */}
              <div className="h-20 w-20 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-semibold">
                {initials}
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {formData.name || 'Your name'}
                </p>
                <p className="text-xs text-gray-500">
                  {formData.email || 'Add your email'}
                </p>
              </div>
            </div>

            <div className="mt-2 w-full text-xs text-gray-500">
              <p>
                This is how your avatar appears across the dashboard.
              </p>
            </div>
          </section>

          {/* RIGHT: profile form and password section */}
          <section className="md:w-2/3 flex flex-col gap-4">
            <MyProfileForm
              formData={formData}
              role={role || ''}
              handleInputChange={handleInputChange}
              handleAddField={handleAddField}
              handleRemoveField={handleRemoveField}
              handleSubmit={handleSubmit}
              onProfilePictureChange={handleProfilePictureChange}
              uploading={uploading}
            />

            <div className="mt-2">
              <PasswordResetSection
                handlePasswordReset={handlePasswordReset}
                resetEmailSent={resetEmailSent}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}