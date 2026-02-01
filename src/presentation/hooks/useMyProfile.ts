import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";

export const useMyProfile = () => {
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
  // Handle profile picture upload
  const handleProfilePictureChange = async (file: File) => {
    if (!user?.uid) return;
    setUploading(true);
    try {
      const publicUrl = await uploadProfilePictureUseCase.execute(user.uid, file);
      setFormData((prev) => ({ ...prev, profilePicture: publicUrl }));
    } catch {
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
      await resetUserPasswordUseCase.execute(email);
      setResetEmailSent(true);
      alert("Password reset email sent. Please check your inbox.");
    } catch {
      alert("Failed to send password reset email. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userId = user?.uid;
      if (!userId) throw new Error("User not authenticated");

      await updateUserProfileUseCase.execute(userId, formData);
      alert("Profile updated successfully!");
    } catch {
      alert("Failed to update profile!");
    }
  };

  return {
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
  };
};
