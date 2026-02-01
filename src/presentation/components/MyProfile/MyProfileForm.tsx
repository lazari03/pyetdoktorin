import Image from 'next/image';
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
  | 'emergencyContactPhone';

interface MyProfileFormProps {
  formData: MyProfileFormData;
  role: string;
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
}

const ProfileImage = React.memo<{
  previewUrl: string | null;
  profilePicture?: string;
  role: string;
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFileName: string;
}>(({ previewUrl, profilePicture, role, uploading, onFileChange, selectedFileName }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center w-full md:w-1/3 mb-6 md:mb-0">
      <Image
        src={previewUrl || profilePicture || "/img/profile_placeholder.png"}
        alt="Profile Preview"
        width={96}
        height={96}
        className="w-24 h-24 rounded-full object-cover border"
        style={{ objectFit: 'cover' }}
        priority
      />
      {role === 'doctor' && (
        <label className={`btn btn-primary cursor-pointer mt-2 ${uploading ? 'loading' : ''}`}>
          {uploading ? t('uploading') : t('chooseProfilePicture') || 'Choose Profile Picture'}
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
      {selectedFileName && (
        <span className="mt-2 text-xs text-gray-600">
          {t('selectedFile') || 'Selected File'}: {selectedFileName}
        </span>
      )}
    </div>
  );
});

ProfileImage.displayName = 'ProfileImage';

const FormInput = React.memo<{
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>(({ label, type, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="input input-bordered w-full rounded"
    />
  </div>
));

FormInput.displayName = 'FormInput';

const FormTextarea = React.memo<{
  label: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}>(({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <textarea
      value={value || ''}
      onChange={onChange}
      className="textarea textarea-bordered w-full rounded"
    />
  </div>
));

FormTextarea.displayName = 'FormTextarea';

const SpecializationField = React.memo<{
  specializations: string[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>, field: FormField, index: number) => void;
  onRemove: (field: FormField, index: number) => void;
  onAdd: (field: FormField) => void;
}>(({ specializations, onInputChange, onRemove, onAdd }) => {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {t('specializations') || 'Specializations'}
      </label>
      {specializations.map((spec, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={spec}
            onChange={(e) => onInputChange(e, 'specializations', index)}
            className="input input-bordered w-full rounded"
          />
          <button
            type="button"
            onClick={() => onRemove('specializations', index)}
            className="btn btn-error btn-xs rounded"
          >
            {t('remove') || 'Remove'}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAdd('specializations')}
        className="btn btn-primary btn-xs rounded"
      >
        {t('addSpecialization') || 'Add Specialization'}
      </button>
    </div>
  );
});

SpecializationField.displayName = 'SpecializationField';

const MyProfileForm = ({
  formData,
  role,
  handleInputChange,
  handleAddField,
  handleRemoveField,
  handleSubmit,
  onProfilePictureChange,
  uploading = false,
}: MyProfileFormProps) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (onProfilePictureChange) {
        onProfilePictureChange(file);
      }
    }
  }, [onProfilePictureChange]);

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Avatar on the left */}
        <div className="flex flex-col items-center w-full md:w-1/3 mb-6 md:mb-0">
          <Image
            src={previewUrl || formData.profilePicture || "/img/profile_placeholder.png"}
            alt="Profile Preview"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover border"
            style={{ objectFit: 'cover' }}
            priority
          />
          {role === 'doctor' && (
            <label className={`btn btn-primary cursor-pointer mt-2 ${uploading ? 'loading' : ''}`}>
              {uploading ? t('uploading') : t('chooseProfilePicture') || 'Choose Profile Picture'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
          {selectedFileName && (
            <span className="mt-2 text-xs text-gray-600">{t('selectedFile') || 'Selected File'}: {selectedFileName}</span>
          )}
        </div>
        {/* Fields on the right */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('name') || 'Name'}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange(e, 'name')}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('surname') || 'Surname'}</label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => handleInputChange(e, 'surname')}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('email') || 'Email'}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange(e, 'email')}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('phoneNumber') || 'Phone Number'}</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange(e, 'phoneNumber')}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
            </div>
            {/* Doctor-only fields */}
            {role === 'doctor' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('about') || 'About'}</label>
                  <textarea
                    value={formData.about}
                    onChange={(e) => handleInputChange(e, 'about')}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white min-h-[120px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('specializations') || 'Specializations'}</label>
                  {formData.specializations.map((spec: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={spec}
                        onChange={(e) => handleInputChange(e, 'specializations', index)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveField('specializations', index)}
                        className="inline-flex items-center rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        {t('remove') || 'Remove'}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddField('specializations')}
                    className="inline-flex items-center rounded-full border border-purple-500 px-3 py-1 text-[11px] font-semibold text-purple-600 hover:bg-purple-500 hover:text-white transition"
                  >
                    {t('addSpecialization') || 'Add Specialization'}
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition shadow-md"
            >
              {t('saveChanges') || 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default MyProfileForm;
