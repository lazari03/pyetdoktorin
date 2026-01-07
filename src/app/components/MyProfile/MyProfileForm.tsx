import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Accept the more specific union type for field names
interface MyProfileFormData {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  about?: string;
  specializations: string[];
  education?: string[];
  profilePicture?: string;
  [key: string]: unknown;
}

interface MyProfileFormProps {
  formData: MyProfileFormData;
  role: string;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: 'name' | 'surname' | 'email' | 'phoneNumber' | 'about' | 'specializations' | 'education',
    index?: number,
  ) => void;
  handleAddField: (field: 'name' | 'surname' | 'email' | 'phoneNumber' | 'about' | 'specializations' | 'education') => void;
  handleRemoveField: (field: 'name' | 'surname' | 'email' | 'phoneNumber' | 'about' | 'specializations' | 'education', index: number) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onProfilePictureChange?: (file: File) => void;
  uploading?: boolean;
}

const MyProfileForm: React.FC<MyProfileFormProps> = ({
  formData,
  role,
  handleInputChange,
  handleAddField,
  handleRemoveField,
  handleSubmit,
  onProfilePictureChange,
  uploading = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (onProfilePictureChange) {
        onProfilePictureChange(file);
      }
    }
  };

  const { t } = useTranslation();
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Preview & Upload for Doctors - Centered at Top */}
      {role === 'doctor' && (
        <div className="flex flex-col items-center mb-6">
          <Image
            src={previewUrl || formData.profilePicture || '/img/profile_placeholder.png'}
            alt="Profile Preview"
            width={112}
            height={112}
            className="w-28 h-28 rounded-full object-cover border mb-2"
            style={{ objectFit: 'cover' }}
            priority
          />
          <label className="inline-flex items-center justify-center px-4 py-2 mt-2 text-sm font-medium text-white bg-indigo-500 rounded-full cursor-pointer hover:bg-indigo-600 disabled:opacity-60">
            {uploading ? t('uploading') : t('chooseProfilePicture')}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {selectedFileName && (
            <span className="mt-2 text-sm text-gray-600">
              {t('selectedFile')}: {selectedFileName}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">{t('name')}</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange(e, 'name')}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">{t('surname')}</label>
          <input
            type="text"
            value={formData.surname}
            onChange={(e) => handleInputChange(e, 'surname')}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">{t('email')}</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange(e, 'email')}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">{t('phoneNumber')}</label>
          <input
            type="text"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange(e, 'phoneNumber')}
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>
      </div>

      {role === 'doctor' && (
        <>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('doctorProfile')}</h2>
            <label className="block text-sm font-medium text-gray-600 mb-2">{t('about')}</label>
            <textarea
              value={formData.about}
              onChange={(e) => handleInputChange(e, 'about')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-h-[96px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">{t('specializations')}</label>
            {formData.specializations.map((spec: string, index: number) => (
              <div key={index} className="flex items-center space-x-3 mb-3">
                <input
                  type="text"
                  value={spec}
                  onChange={(e) => handleInputChange(e, 'specializations', index)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveField('specializations', index)}
                  className="inline-flex items-center justify-center rounded-full border border-red-400 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                >
                  {t('remove')}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddField('specializations')}
              className="inline-flex items-center justify-center rounded-full border border-indigo-400 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-500 hover:text-white transition-colors"
            >
              {t('addSpecialization')}
            </button>
          </div>
        </>
      )}

      <div className="mt-6 text-center">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors disabled:opacity-60"
        >
          {t('saveChanges')}
        </button>
      </div>
    </form>
  );
};

export default MyProfileForm;
