import Image from 'next/image';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { UserRole } from '@/domain/entities/UserRole';
import { SignaturePad } from '@/presentation/components/SignaturePad';
import { APPOINTMENT_PRICE_CURRENCY } from '@/config/paywallConfig';

export interface MyProfileFormData {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  about?: string;
  specializations: string[];
  education?: string[];
  profilePicture?: string;
  preferredLanguage?: string;
  timeZone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  signatureDataUrl?: string;
  reimbursementCode?: string;
  consultationFee?: string;
  [key: string]: unknown;
}

export type FormField =
  | 'name'
  | 'surname'
  | 'email'
  | 'phoneNumber'
  | 'about'
  | 'specializations'
  | 'education'
  | 'profilePicture'
  | 'preferredLanguage'
  | 'timeZone'
  | 'emergencyContactName'
  | 'emergencyContactPhone'
  | 'consultationFee';

interface MyProfileFormProps {
  formData: MyProfileFormData;
  role: UserRole;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: FormField,
    index?: number,
  ) => void;
  handleAddField: (field: FormField) => void;
  handleRemoveField: (field: FormField, index: number) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onProfilePictureChange?: (file: File) => void;
  uploading?: boolean;
  onSignatureChange?: (dataUrl: string) => void;
}

const fieldClass =
  'w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-purple-600">
      {children}
    </p>
  );
}

const TextField = React.memo<{
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  help?: string;
  span2?: boolean;
  min?: number;
  step?: string;
}>(({ label, type = 'text', value, onChange, help, span2, min, step }) => (
  <div className={span2 ? 'sm:col-span-2' : undefined}>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input type={type} value={value} onChange={onChange} min={min} step={step} className={fieldClass} />
    {help && <p className="mt-1 text-[11px] text-gray-500">{help}</p>}
  </div>
));
TextField.displayName = 'TextField';

const ProfileImage = React.memo<{
  previewUrl: string | null;
  profilePicture?: string;
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFileName: string;
}>(({ previewUrl, profilePicture, uploading, onFileChange, selectedFileName }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center w-full md:w-36 shrink-0 gap-2.5">
      <Image
        src={previewUrl || profilePicture || "/img/profile_placeholder.png"}
        alt={t('profilePreview')}
        width={80}
        height={80}
        className="h-20 w-20 rounded-full object-cover border border-purple-100 shadow-sm"
        style={{ objectFit: 'cover' }}
        priority
      />
      <label
        className={`inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-purple-700 shadow-sm hover:bg-purple-50 cursor-pointer transition ${
          uploading ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {uploading ? (t('uploading') || 'Uploading...') : (t('chooseProfilePicture') || 'Choose Profile Picture')}
        <input type="file" accept="image/*" onChange={onFileChange} className="hidden" disabled={uploading} />
      </label>
      {selectedFileName && (
        <span className="text-[10.5px] text-gray-500 text-center truncate max-w-full">
          {selectedFileName}
        </span>
      )}
    </div>
  );
});
ProfileImage.displayName = 'ProfileImage';

// ---------------------------------------------------------------------------
// Doctor view — "Console": a dark, tabbed tool panel rather than a long
// scrolling form. One section visible at a time via the left rail; all field
// values still live in the shared `formData` state regardless of which tab
// is mounted, so switching tabs never loses anything and Save always submits
// everything together.
// ---------------------------------------------------------------------------

type ConsoleTabKey = 'basic' | 'professional' | 'signature';

const consoleFieldBox = 'rounded-lg border border-[#262a35] bg-[#191c24] px-3.5 py-2.5';
const consoleLabel = 'block text-[10px] font-bold uppercase tracking-[0.09em] text-[#8b93a7] mb-1';
const consoleInput = 'w-full bg-transparent text-[13.5px] text-[#e7eaee] focus:outline-none placeholder:text-[#5a6070]';

const ConsoleTab = React.memo<{ active: boolean; onClick: () => void; children: React.ReactNode }>(
  ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold transition ${
        active ? 'bg-[#7c6ffa]/15 text-[#e7eaee]' : 'text-[#8b93a7] hover:text-[#e7eaee]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full transition ${
          active ? 'bg-[#7c6ffa] shadow-[0_0_0_3px_rgba(124,111,250,0.15)]' : 'bg-[#262a35]'
        }`}
      />
      {children}
    </button>
  )
);
ConsoleTab.displayName = 'ConsoleTab';

const MyProfileForm = ({
  formData,
  role,
  handleInputChange,
  handleAddField,
  handleRemoveField,
  handleSubmit,
  onProfilePictureChange,
  uploading = false,
  onSignatureChange,
}: MyProfileFormProps) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [signatureEditMode, setSignatureEditMode] = useState(false);
  const [signatureBackup, setSignatureBackup] = useState('');
  const [signatureDraft, setSignatureDraft] = useState('');
  const [signatureSaveSignal, setSignatureSaveSignal] = useState(0);
  const [activeTab, setActiveTab] = useState<ConsoleTabKey>('basic');

  const isDoctor = role === UserRole.Doctor;
  const hasSignature = Boolean(formData.signatureDataUrl);
  const showSignatureEditor = signatureEditMode || !hasSignature;
  const isComplete = Boolean(
    formData.name && formData.surname && formData.specializations.length > 0 && hasSignature
  );

  const handleSignatureUpdate = (dataUrl: string) => {
    onSignatureChange?.(dataUrl);
  };

  const beginSignatureEdit = () => {
    setSignatureBackup(formData.signatureDataUrl || '');
    setSignatureDraft('');
    setSignatureEditMode(true);
  };

  const cancelSignatureEdit = () => {
    onSignatureChange?.(signatureBackup);
    setSignatureDraft('');
    setSignatureEditMode(false);
  };

  const saveSignatureEdit = () => {
    if (!signatureDraft) return;
    setSignatureSaveSignal((prev) => prev + 1);
    setSignatureEditMode(false);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
      onProfilePictureChange?.(file);
    }
  }, [onProfilePictureChange]);

  const initials = `${formData.name?.[0] ?? ''}${formData.surname?.[0] ?? ''}`.toUpperCase() || '–';

  if (!isDoctor) {
    return (
      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          <ProfileImage
            previewUrl={previewUrl}
            profilePicture={formData.profilePicture}
            uploading={uploading}
            onFileChange={handleFileChange}
            selectedFileName={selectedFileName}
          />
          <div className="flex-1 w-full space-y-1.5">
            <SectionHeading>{t('basicDetails') || 'Basic details'}</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField label={t('name') || 'Name'} value={formData.name} onChange={(e) => handleInputChange(e, 'name')} />
              <TextField label={t('surname') || 'Surname'} value={formData.surname} onChange={(e) => handleInputChange(e, 'surname')} />
              <TextField label={t('email') || 'Email'} type="email" value={formData.email} onChange={(e) => handleInputChange(e, 'email')} />
              <TextField label={t('phoneNumber') || 'Phone Number'} value={formData.phoneNumber} onChange={(e) => handleInputChange(e, 'phoneNumber')} />
            </div>
            {formData.reimbursementCode ? (
              <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-3.5 py-2.5 mt-1">
                <label className="block text-xs font-medium text-sky-800 mb-0.5">
                  {t('reimbursementCodeLabel') || 'Reimbursement code'}
                </label>
                <p className="text-sm font-semibold text-sky-900 break-all">{formData.reimbursementCode}</p>
                <p className="mt-1 text-[11px] text-sky-700">
                  {t('reimbursementCodeProfileHelp') || 'This code is linked to your account and is used when a doctor issues a reimbursement prescription.'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex justify-end border-t border-gray-100 pt-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition shadow-md"
          >
            {t('saveChanges') || 'Save Changes'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full rounded-2xl bg-[#12141a] shadow-xl overflow-hidden md:flex">
      <div className="flex md:flex-col gap-1 md:w-[180px] shrink-0 bg-[#14161d] border-b md:border-b-0 md:border-r border-[#262a35] p-3 overflow-x-auto md:overflow-visible">
        <ConsoleTab active={activeTab === 'basic'} onClick={() => setActiveTab('basic')}>
          {t('basicDetails') || 'Basic details'}
        </ConsoleTab>
        <ConsoleTab active={activeTab === 'professional'} onClick={() => setActiveTab('professional')}>
          {t('professionalDetails') || 'Professional details'}
        </ConsoleTab>
        <ConsoleTab active={activeTab === 'signature'} onClick={() => setActiveTab('signature')}>
          {t('doctorSignature') || 'Signature'}
        </ConsoleTab>
      </div>

      <div className="flex-1 p-5 sm:p-6 min-w-0">
        <div className="flex items-center gap-3.5 mb-5">
          <Image
            src={previewUrl || formData.profilePicture || "/img/profile_placeholder.png"}
            alt={t('profilePreview')}
            width={52}
            height={52}
            className="h-[52px] w-[52px] rounded-xl object-cover shrink-0"
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-[#e7eaee] truncate">
              {formData.name || formData.surname ? `${formData.name} ${formData.surname}`.trim() : (initials === '–' ? t('yourName') || 'Your name' : initials)}
            </h2>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${isComplete ? 'text-[#33c9c9]' : 'text-[#8b93a7]'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isComplete ? 'bg-[#33c9c9]' : 'bg-[#8b93a7]'}`} />
              {isComplete ? (t('profileComplete') || 'Profile complete') : (t('profileIncomplete') || 'Incomplete')}
            </span>
          </div>
          <label
            className={`shrink-0 text-[11px] font-semibold text-[#8b93a7] hover:text-[#e7eaee] cursor-pointer transition ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {uploading ? (t('uploading') || 'Uploading...') : (t('changePhoto') || 'Change photo')}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
          </label>
        </div>

        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={consoleFieldBox}>
              <label className={consoleLabel}>{t('name') || 'Name'}</label>
              <input className={consoleInput} value={formData.name} onChange={(e) => handleInputChange(e, 'name')} />
            </div>
            <div className={consoleFieldBox}>
              <label className={consoleLabel}>{t('surname') || 'Surname'}</label>
              <input className={consoleInput} value={formData.surname} onChange={(e) => handleInputChange(e, 'surname')} />
            </div>
            <div className={consoleFieldBox}>
              <label className={consoleLabel}>{t('email') || 'Email'}</label>
              <input className={consoleInput} type="email" value={formData.email} onChange={(e) => handleInputChange(e, 'email')} />
            </div>
            <div className={consoleFieldBox}>
              <label className={consoleLabel}>{t('phoneNumber') || 'Phone Number'}</label>
              <input className={`${consoleInput} font-mono tabular-nums`} value={formData.phoneNumber} onChange={(e) => handleInputChange(e, 'phoneNumber')} />
            </div>
          </div>
        )}

        {activeTab === 'professional' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={consoleFieldBox}>
              <label className={consoleLabel}>{t('consultationFee') || 'Consultation fee'} ({APPOINTMENT_PRICE_CURRENCY})</label>
              <input
                className={`${consoleInput} font-mono tabular-nums text-[#33c9c9]`}
                type="number"
                min={1}
                step="0.01"
                value={formData.consultationFee ?? ''}
                onChange={(e) => handleInputChange(e, 'consultationFee')}
              />
            </div>
            <div className={consoleFieldBox}>
              <label className={consoleLabel}>{t('specializations') || 'Specializations'}</label>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {formData.specializations.map((spec: string, index: number) => (
                  <div key={index} className="flex items-center gap-1.5 rounded-md bg-[#7c6ffa]/15 pl-2.5 pr-1 py-1">
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => handleInputChange(e, 'specializations', index)}
                      placeholder={t('specialization') || 'Specialization'}
                      className="bg-transparent text-[12.5px] font-semibold text-[#7c6ffa] focus:outline-none w-24 placeholder:text-[#7c6ffa]/60"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveField('specializations', index)}
                      aria-label={t('remove') || 'Remove'}
                      className="flex h-4 w-4 items-center justify-center text-[#7c6ffa] opacity-60 hover:opacity-100 transition text-xs leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddField('specializations')}
                  className="inline-flex items-center rounded-md border border-dashed border-[#3a3f4d] px-2.5 py-1 text-[11.5px] font-semibold text-[#8b93a7] hover:text-[#e7eaee] hover:border-[#5a6070] transition"
                >
                  + {t('addSpecialization') || 'Add'}
                </button>
              </div>
            </div>
            <div className={`${consoleFieldBox} sm:col-span-2`}>
              <label className={consoleLabel}>{t('about') || 'About'}</label>
              <textarea
                value={formData.about}
                onChange={(e) => handleInputChange(e, 'about')}
                rows={3}
                className={`${consoleInput} resize-y leading-relaxed`}
              />
            </div>
          </div>
        )}

        {activeTab === 'signature' && (
          <div className={consoleFieldBox}>
            {hasSignature && !signatureEditMode ? (
              <div className="flex items-center gap-4">
                <Image
                  src={formData.signatureDataUrl!}
                  alt={t('doctorSignature') || 'Doctor signature'}
                  width={150}
                  height={60}
                  unoptimized
                  className="h-14 w-auto max-w-[150px] rounded-md bg-white p-1.5"
                />
                <div className="flex-1">
                  <p className="text-[11.5px] text-[#8b93a7]">
                    {t('signatureSavedHelp') || 'This signature will be applied to new prescriptions.'}
                  </p>
                  <button type="button" onClick={beginSignatureEdit} className="mt-1.5 text-[11.5px] font-semibold text-[#7c6ffa] hover:text-[#9a90ff]">
                    {t('replaceSignature') || 'Replace'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <SignaturePad
                  onChange={handleSignatureUpdate}
                  onDraftChange={setSignatureDraft}
                  saveSignal={signatureSaveSignal}
                  autoSave={false}
                  labelClassName={consoleLabel}
                />
                <div className="flex justify-end gap-3">
                  {hasSignature && signatureEditMode && (
                    <button type="button" onClick={cancelSignatureEdit} className="text-[11.5px] font-semibold text-[#8b93a7] hover:text-[#e7eaee]">
                      {t('cancel') || 'Cancel'}
                    </button>
                  )}
                  {showSignatureEditor && (
                    <button
                      type="button"
                      onClick={saveSignatureEdit}
                      disabled={!signatureDraft}
                      className="inline-flex items-center rounded-lg bg-[#7c6ffa] px-4 py-1.5 text-[11.5px] font-semibold text-white hover:bg-[#6c5eec] transition disabled:opacity-40"
                    >
                      {t('saveSignature') || 'Save signature'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-[#7c6ffa] px-6 py-2 text-sm font-semibold text-white hover:bg-[#6c5eec] transition shadow-lg shadow-[#7c6ffa]/20"
          >
            {t('saveChanges') || 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default MyProfileForm;
