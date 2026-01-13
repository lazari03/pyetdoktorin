"use client";

import { useMemo } from "react";
import { useMyProfile } from "@/hooks/useMyProfile";

/**
 * Known profile field names for type-safe form handling
 */
export type ProfileFieldName =
  | "name"
  | "surname"
  | "email"
  | "phoneNumber"
  | "about"
  | "specializations"
  | "education"
  | "profilePicture";

/**
 * Form data structure for the profile
 */
export interface ProfileFormData {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  about: string;
  specializations: string[];
  education: string[];
  profilePicture: string;
  [key: string]: unknown; // Index signature for compatibility with MyProfileForm
}

/**
 * View model result interface - defines what the UI can access
 */
export interface MyProfileViewModelResult {
  // Form data
  formData: ProfileFormData;
  role: string;

  // Loading states
  isLoading: boolean;
  isUploading: boolean;

  // Password reset
  resetEmailSent: boolean;

  // Derived display values
  initials: string;
  displayName: string;
  displayEmail: string;

  // Form handlers (using explicit field type, not keyof)
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: ProfileFieldName,
    index?: number
  ) => void;
  handleAddField: (field: ProfileFieldName) => void;
  handleRemoveField: (field: ProfileFieldName, index: number) => void;

  // Actions
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handlePasswordReset: () => Promise<void>;
  handleProfilePictureChange: (file: File) => Promise<void>;
}

/**
 * Generates initials from a name string
 */
function generateInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * MyProfile View Model
 * 
 * Separates presentation logic from the page component.
 * The page only needs to render UI based on the values returned here.
 */
export function useMyProfileViewModel(): MyProfileViewModelResult {
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

  // Combined loading state
  const isLoading = authLoading || isFetching;

  // Derive display name (fallback chain: name → email → "User")
  const displayName = useMemo(() => {
    return formData.name || formData.email || "User";
  }, [formData.name, formData.email]);

  // Derive display email
  const displayEmail = useMemo(() => {
    return formData.email || "Add your email";
  }, [formData.email]);

  // Generate initials from display name
  const initials = useMemo(() => {
    return generateInitials(displayName);
  }, [displayName]);

  return {
    // Form data
    formData: formData as ProfileFormData,
    role: role || "",

    // Loading states
    isLoading,
    isUploading: uploading,

    // Password reset
    resetEmailSent,

    // Derived display values
    initials,
    displayName,
    displayEmail,

    // Form handlers
    handleInputChange,
    handleAddField,
    handleRemoveField,

    // Actions
    handleSubmit,
    handlePasswordReset,
    handleProfilePictureChange,
  };
}
