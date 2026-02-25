import React from "react";
import { useTranslation } from "react-i18next";
import MyProfileForm, { FormField, MyProfileFormData } from "./MyProfileForm";
import PasswordResetSection from "./PasswordResetSection";
import { UserRole } from "@/domain/entities/UserRole";

type Props = {
  formData: MyProfileFormData;
  role: UserRole;
  uploading: boolean;
  resetEmailSent: boolean;
  recentLoginAt?: string;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: FormField,
    index?: number
  ) => void;
  handleAddField: (field: FormField) => void;
  handleRemoveField: (field: FormField, index: number) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleProfilePictureChange?: (file: File) => void;
  handlePasswordReset: () => void;
  handleSignatureChange?: (dataUrl: string) => void;
};

export function ProfileLayout(props: Props) {
  const { t } = useTranslation();
  const {
    formData,
    role,
    uploading,
    resetEmailSent,
    recentLoginAt,
    handleInputChange,
    handleAddField,
    handleRemoveField,
    handleSubmit,
    handleProfilePictureChange,
    handlePasswordReset,
    handleSignatureChange,
  } = props;

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: FormField,
    index?: number
  ) => {
    handleInputChange(e, field, index);
  };

  return (
    <div className="min-h-screen py-6 px-4 ">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="backdrop-blur flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
              {t("profileAccountEyebrow") ?? "Account"}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {t("profileTitle") ?? "Profile & Privacy"}
            </h1>
            <p className="text-sm text-gray-600">
              {t("profileSubtitle") ?? "Keep your details private and up to date. We only share with your consent."}
            </p>
          </div>
          <div className="text-xs text-gray-600 bg-purple-50 border border-purple-100 rounded-2xl px-4 py-2">
            {t("profileSecurityNote") ?? "We never share your personal details without consent."}
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="lg:col-span-2 bg-white rounded-3xl border border-purple-50 shadow-lg p-6">
            <MyProfileForm
              formData={formData}
              role={role}
              handleInputChange={handleInput}
              handleAddField={handleAddField}
              handleRemoveField={handleRemoveField}
              handleSubmit={handleSubmit}
              onProfilePictureChange={handleProfilePictureChange}
              uploading={uploading}
              onSignatureChange={handleSignatureChange}

            />
          </section>

          <aside className="flex flex-col h-full">
            <div className="bg-white rounded-3xl border border-purple-50 shadow-lg p-5 space-y-3 flex-1 flex flex-col">
              <p className="text-sm font-semibold text-gray-900">{t("securitySection") ?? "Security"}</p>
              <p className="text-xs text-gray-600">
                {t("securityCopy") ?? "Reset your password or add extra protection."}
              </p>
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3">
                <PasswordResetSection
                  handlePasswordReset={handlePasswordReset}
                  resetEmailSent={resetEmailSent}
                />
              </div>
              <div className="rounded-2xl border border-gray-200 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-gray-600 font-semibold">
                  {t("recentLogin") ?? "Recent login"}
                </p>
                <p className="text-sm text-gray-900">
                  {recentLoginAt || t("recentLoginInfo") || new Date().toISOString()}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
