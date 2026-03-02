import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";
import { useTranslation } from "react-i18next";
import { BackendError } from "@/network/backendClient";
import { useToast } from "@/presentation/components/Toast/ToastProvider";

export const useMyProfile = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth(); // Access user, role, and loading from AuthContext
  const {
    getUserProfileUseCase,
    updateUserProfileUseCase,
    uploadProfilePictureUseCase,
    resetUserPasswordUseCase,
  } = useDI();
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
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // To handle data fetching state
  const [fetchError, setFetchError] = useState<unknown>(null);
  const [uploading, setUploading] = useState(false);

  const recentLoginAt = useMemo(() => {
    if (!user?.uid) return undefined;
    const authUser = getAuth().currentUser;
    const lastSignInTime = authUser?.metadata?.lastSignInTime;
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
  }, [user?.uid]);
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
    if (!user?.uid) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const userData = await getUserProfileUseCase.execute(user.uid);
      if (userData) {
        setFormData((prev) => ({
          ...prev,
          ...userData,
          specializations: userData.specializations || [""],
          education: userData.education || [""],
          preferredLanguage: userData.preferredLanguage || "",
          timeZone: userData.timeZone || "",
          emergencyContactName: userData.emergencyContactName || "",
          emergencyContactPhone: userData.emergencyContactPhone || "",
          signatureDataUrl: userData.signatureDataUrl || "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          email: "",
        }));
      }
    } catch (error) {
      // Prefer structured errors but never display raw messages to the user here.
      if (error instanceof BackendError) {
        setFetchError(error);
      } else {
        setFetchError(error instanceof Error ? error : new Error("PROFILE_FETCH_FAILED"));
      }
    } finally {
      setIsFetching(false);
    }
  }, [getUserProfileUseCase, user?.uid]);

  // Fetch user data on mount / user change
  useEffect(() => {
    void refetchProfile();
  }, [refetchProfile]);

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
      await updateUserProfileUseCase.execute(userId, formData);
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
