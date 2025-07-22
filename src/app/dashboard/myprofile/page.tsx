'use client';

import { useMyProfile } from "../../../hooks/useMyProfile";
import Loader from "../../components/Loader";
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Profile Settings</h1>
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
      <PasswordResetSection
        handlePasswordReset={handlePasswordReset}
        resetEmailSent={resetEmailSent}
      />
    </div>
  );
}