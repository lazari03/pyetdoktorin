"use client";

import { useMyProfile } from "@/presentation/hooks/useMyProfile";
import Loader from "@/presentation/components/Loader/Loader";
import { ProfileLayout } from "@/presentation/components/MyProfile/ProfileLayout";

export default function MyProfilePage() {
  const {
    formData,
    role,
    resetEmailSent,
    isFetching,
    authLoading,
    uploading,
    recentLoginAt,
    handleInputChange,
    handleAddField,
    handleRemoveField,
    handlePasswordReset,
    handleSubmit,
    handleProfilePictureChange,
    handleSignatureChange,
  } = useMyProfile();

  if (authLoading || isFetching || !role) {
    return <Loader />;
  }

  return (
    <ProfileLayout
      formData={formData}
      role={role}
      uploading={uploading}
      resetEmailSent={resetEmailSent}
      recentLoginAt={recentLoginAt}
      handleInputChange={handleInputChange}
      handleAddField={handleAddField}
      handleRemoveField={handleRemoveField}
      handleSubmit={handleSubmit}
      handleProfilePictureChange={handleProfilePictureChange}
      handlePasswordReset={handlePasswordReset}
      handleSignatureChange={handleSignatureChange}
    />
  );
}
