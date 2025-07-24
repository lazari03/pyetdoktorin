import Image from 'next/image';
import React, { useState } from 'react';

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
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: "name" | "surname" | "email" | "phoneNumber" | "about" | "specializations" | "education", index?: number) => void;
  handleAddField: (field: "name" | "surname" | "email" | "phoneNumber" | "about" | "specializations" | "education") => void;
  handleRemoveField: (field: "name" | "surname" | "email" | "phoneNumber" | "about" | "specializations" | "education", index: number) => void;
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
  const [selectedFileName, setSelectedFileName] = useState<string>("");

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
      {/* Profile Picture Preview & Upload for Doctors - Centered at Top */}
      {role === "doctor" && (
        <div className="flex flex-col items-center mb-6">
          <Image
            src={previewUrl || formData.profilePicture || "/img/profile_placeholder.png"}
            alt="Profile Preview"
            width={112}
            height={112}
            className="w-28 h-28 rounded-full object-cover border mb-2"
            style={{ objectFit: 'cover' }}
            priority
          />
          <label className={`btn btn-primary cursor-pointer mt-2 ${uploading ? 'loading' : ''}`}>
            {uploading ? 'Uploading...' : 'Choose Profile Picture'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {selectedFileName && (
            <span className="mt-2 text-sm text-gray-600">Selected: {selectedFileName}</span>
          )}
        </div>
      )}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange(e, "name")}
          className="input input-bordered w-full rounded-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Surname</label>
        <input
          type="text"
          value={formData.surname}
          onChange={(e) => handleInputChange(e, "surname")}
          className="input input-bordered w-full rounded-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange(e, "email")}
          className="input input-bordered w-full rounded-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
        <input
          type="text"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange(e, "phoneNumber")}
          className="input input-bordered w-full rounded-full"
        />
      </div>
    </div>
    {role === "doctor" && (
      <>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Doctor Profile</h2>
          <label className="block text-sm font-medium text-gray-600 mb-2">About</label>
          <textarea
            value={formData.about}
            onChange={(e) => handleInputChange(e, "about")}
            className="textarea textarea-bordered w-full rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Specializations</label>
          {formData.specializations.map((spec: string, index: number) => (
            <div key={index} className="flex items-center space-x-3 mb-3">
              <input
                type="text"
                value={spec}
                onChange={(e) => handleInputChange(e, "specializations", index)}
                className="input input-bordered w-full rounded-full"
              />
              <button
                type="button"
                onClick={() => handleRemoveField("specializations", index)}
                className="btn btn-error btn-sm rounded-full"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddField("specializations")}
            className="btn btn-primary btn-sm rounded-full"
          >
            Add Specialization
          </button>
        </div>
      </>
    )}
    <div className="mt-6 text-center">
      <button type="submit" className="btn btn-primary px-8 py-3 rounded-full shadow-md hover:shadow-lg">
        Save Changes
      </button>
    </div>
    </form>
  );
};

export default MyProfileForm;
