"use client";

import { useMyProfile } from "@/presentation/hooks/useMyProfile";
import { ProfileLayout } from "@/presentation/components/MyProfile/ProfileLayout";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { DASHBOARD_PATHS } from "@/navigation/paths";

export default function MyProfilePage() {
  const {
    formData,
    role,
    resetEmailSent,
    isFetching,
    fetchError,
    authLoading,
    uploading,
    recentLoginAt,
    refetchProfile,
    handleInputChange,
    handleAddField,
    handleRemoveField,
    handlePasswordReset,
    handleSubmit,
    handleProfilePictureChange,
    handleSignatureChange,
  } = useMyProfile();

  return (
    <RequestStateGate
      loading={authLoading || isFetching}
      error={fetchError || (!role && !authLoading ? new Error("ROLE_MISSING") : null)}
      onRetry={refetchProfile}
      homeHref={DASHBOARD_PATHS.root}
      analyticsPrefix="profile"
    >
      {role ? (
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
      ) : null}
    </RequestStateGate>
  );
}
