
"use client";

import { useMyProfile } from "@/presentation/hooks/useMyProfile";
import Loader from "@/presentation/components/Loader/Loader";
import { ProfileLayout } from "@/presentation/components/MyProfile/ProfileLayout";

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
    <ProfileLayout
      formData={formData}
      role={role || ""}
      uploading={uploading}
      resetEmailSent={resetEmailSent}
      handleInputChange={handleInputChange}
      handleAddField={handleAddField}
      handleRemoveField={handleRemoveField}
      handleSubmit={handleSubmit}
      handleProfilePictureChange={handleProfilePictureChange}
      handlePasswordReset={handlePasswordReset}
    />
  );
}
