'use client';

import { useMyProfile } from "../../../hooks/useMyProfile";
import Loader from "@/app/components/Loader";

export default function MyProfile() {
  const {
    formData,
    role,
    resetEmailSent,
    isFetching,
    authLoading,
    handleInputChange,
    handleAddField,
    handleRemoveField,
    handlePasswordReset,
    handleSubmit,
  } = useMyProfile();

  if (authLoading || isFetching) {
    return <Loader />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Profile Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
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
              {formData.specializations.map((spec, index) => (
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

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={handlePasswordReset}
          className="text-black hover:text-orange-500 underline focus:outline-none"
        >
          Request to reset your password
        </button>
        {resetEmailSent && (
          <p className="text-green-500 mt-4">
            Password reset email sent successfully!
          </p>
        )}
      </div>
    </div>
  );
}