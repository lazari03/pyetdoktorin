import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";
import { useCurrentUserProfile } from "@/presentation/hooks/useCurrentUserProfile";
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";
import { useTranslation } from "react-i18next";
import { BackendError } from "@/application/errors/BackendError";
import { useToast } from "@/presentation/components/Toast/ToastProvider";
import { notifyFormSubmission } from "@/presentation/utils/formNotifications";

export const useMyProfile = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth(); // Access user, role, and loading from AuthContext
  const {
    authService,
    updateUserProfileUseCase,
    uploadProfilePictureUseCase,
    resetUserPasswordUseCase,
  } = useDI();
  // Shares the same SWR cache entry AuthContext already primed for this uid,
  // so opening the profile page doesn't re-fetch /api/users/me.
  const { data: profileData, error: profileFetchError, isLoading: profileLoading, mutate: mutateProfile } =
    useCurrentUserProfile(user?.uid ?? null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    about: "",
    specializations: [""],
    education: [""],
    profilePicture: "",
    preferredLanguage: "",
    timeZone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    signatureDataUrl: "",
    reimbursementCode: "",
    consultationFee: "",
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isFetching = profileLoading;
  const fetchError = profileFetchError instanceof BackendError
    ? profileFetchError
    : profileFetchError instanceof Error
      ? profileFetchError
      : null;

  const recentLoginAt = useMemo(() => {
    if (!user?.uid) return undefined;
    const lastSignInTime = authService.getLastSignInTime();
    if (!lastSignInTime) return undefined;
    const date = new Date(lastSignInTime);
    if (Number.isNaN(date.getTime())) return undefined;
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, [user?.uid, authService]);
  // Handle profile picture upload
  const handleProfilePictureChange = async (file: File) => {
    if (!user?.uid) return;
    setUploading(true);
    trackAnalyticsEvent("profile_picture_upload_attempt");
    try {
      const publicUrl = await uploadProfilePictureUseCase.execute(user.uid, file);
      setFormData((prev) => ({ ...prev, profilePicture: publicUrl }));
      trackAnalyticsEvent("profile_picture_upload_success");
    } catch (error) {
      trackAnalyticsEvent("profile_picture_upload_failed");
      const code = error instanceof Error ? error.message : "";
      if (code === "UPLOAD_CONFIG_MISSING") {
        toast({ variant: "error", message: t("profilePictureUploadConfigMissing") });
      } else if (code === "UPLOAD_INVALID_TYPE") {
        toast({ variant: "error", message: t("profilePictureUploadInvalidType") });
      } else if (code === "UPLOAD_FILE_MISSING") {
        toast({ variant: "error", message: t("profilePictureUploadMissing") });
      } else {
        toast({ variant: "error", message: t("profilePictureUploadFailed") });
      }
    } finally {
      setUploading(false);
    }
  };

  // Helper to check if profile is complete
  // Removed unused checkProfileComplete function

  const refetchProfile = useCallback(async () => {
    await mutateProfile();
  }, [mutateProfile]);

  // Sync local editable form state whenever the cached profile changes.
  useEffect(() => {
    if (!profileData) return;
    setFormData((prev) => ({
      ...prev,
      ...profileData,
      specializations: profileData.specializations || [""],
      education: profileData.education || [""],
      preferredLanguage: profileData.preferredLanguage || "",
      timeZone: profileData.timeZone || "",
      emergencyContactName: profileData.emergencyContactName || "",
      emergencyContactPhone: profileData.emergencyContactPhone || "",
      signatureDataUrl: profileData.signatureDataUrl || "",
      reimbursementCode: profileData.reimbursementCode || "",
      consultationFee: profileData.consultationFee != null ? String(profileData.consultationFee) : "",
    }));
  }, [profileData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof typeof formData,
    index?: number
  ) => {
    if (index !== undefined) {
      const updatedArray = [...(formData[field] as string[])];
      updatedArray[index] = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: updatedArray }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleAddField = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ""],
    }));
  };

  const handleRemoveField = (field: keyof typeof formData, index: number) => {
    const updatedArray = [...(formData[field] as string[])];
    updatedArray.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: updatedArray }));
  };

  const handlePasswordReset = async () => {
    try {
      const email = formData.email;
      trackAnalyticsEvent("password_reset_requested");
      await resetUserPasswordUseCase.execute(email);
      setResetEmailSent(true);
      trackAnalyticsEvent("password_reset_success");
      toast({
        variant: "success",
        message: t("passwordResetEmailSent", { defaultValue: "Password reset email sent. Please check your inbox." }),
      });
    } catch {
      trackAnalyticsEvent("password_reset_failed");
      toast({
        variant: "error",
        message: t("passwordResetEmailFailed", { defaultValue: "Failed to send password reset email. Please try again." }),
      });
    }
  };

  const handleSignatureChange = (dataUrl: string) => {
    setFormData((prev) => ({ ...prev, signatureDataUrl: dataUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userId = user?.uid;
      if (!userId) throw new Error("User not authenticated");

      trackAnalyticsEvent("profile_update_attempt");
      const { reimbursementCode: _, consultationFee, ...profileUpdates } = formData;
      const parsedFee = consultationFee ? Number(consultationFee) : undefined;
      await updateUserProfileUseCase.execute(userId, {
        ...profileUpdates,
        ...(parsedFee !== undefined && Number.isFinite(parsedFee) ? { consultationFee: parsedFee } : {}),
      });
      void mutateProfile();
      void notifyFormSubmission({
        formType: "profile_update",
        source: "my_profile",
        subject: `Profile updated: ${formData.name || user?.name || userId}`,
        replyTo: formData.email || user?.email || undefined,
        data: {
          userId,
          role: role || "",
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          about: formData.about,
          specializations: formData.specializations,
          education: formData.education,
          preferredLanguage: formData.preferredLanguage,
          timeZone: formData.timeZone,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          profilePicture: formData.profilePicture ? "[uploaded profile picture]" : "",
          signatureDataUrl: formData.signatureDataUrl ? "[saved signature]" : "",
          reimbursementCode: formData.reimbursementCode || "",
        },
      });
      trackAnalyticsEvent("profile_update_success");
      toast({
        variant: "success",
        message: t("profileUpdateSuccess", { defaultValue: "Profile updated successfully!" }),
      });
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
      if (code === "auth/requires-recent-login") {
        toast({ variant: "error", message: t("reauthRequired", { defaultValue: "Please re-login to change your email." }) });
      } else if (code === "auth/email-already-in-use") {
        toast({ variant: "error", message: t("emailInUse", { defaultValue: "This email is already in use." }) });
      } else if (code === "auth/invalid-email") {
        toast({ variant: "error", message: t("invalidEmailAddress", { defaultValue: "Please enter a valid email address." }) });
      } else {
        toast({ variant: "error", message: t("profileUpdateFailed", { defaultValue: "Failed to update profile!" }) });
      }
      trackAnalyticsEvent("profile_update_failed");
    }
  };

  return {
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
  };
};
