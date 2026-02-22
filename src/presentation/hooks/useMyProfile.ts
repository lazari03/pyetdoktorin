import { useState, useEffect, useMemo } from "react";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";
import { useTranslation } from "react-i18next";

export const useMyProfile = () => {
  const { t } = useTranslation();
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
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // To handle data fetching state
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
    } catch {
      trackAnalyticsEvent("profile_picture_upload_failed");
      alert("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  // Helper to check if profile is complete
  // Removed unused checkProfileComplete function

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

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
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            email: "", // Keep email empty if profile is missing
          }));
        }
      } catch {
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [user, getUserProfileUseCase]);

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
      alert("Password reset email sent. Please check your inbox.");
    } catch {
      trackAnalyticsEvent("password_reset_failed");
      alert("Failed to send password reset email. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userId = user?.uid;
      if (!userId) throw new Error("User not authenticated");

      trackAnalyticsEvent("profile_update_attempt");
      await updateUserProfileUseCase.execute(userId, formData);
      trackAnalyticsEvent("profile_update_success");
      alert("Profile updated successfully!");
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
      if (code === "auth/requires-recent-login") {
        alert(t("reauthRequired") || "Please re-login to change your email.");
      } else if (code === "auth/email-already-in-use") {
        alert(t("emailInUse") || "This email is already in use.");
      } else if (code === "auth/invalid-email") {
        alert(t("invalidEmailAddress") || "Please enter a valid email address.");
      } else {
        alert("Failed to update profile!");
      }
      trackAnalyticsEvent("profile_update_failed");
    }
  };

  return {
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
  };
};
