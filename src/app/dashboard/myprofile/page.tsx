'use client';

import { useMyProfile } from "../../hooks/useMyProfile";
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
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange(e, "name")}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Surname</label>
            <input
              type="text"
              value={formData.surname}
              onChange={(e) => handleInputChange(e, "surname")}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange(e, "email")}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange(e, "phoneNumber")}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        {role === "doctor" && (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-4">Doctor Profile</h2>
              <label className="block text-sm font-medium mb-1">About</label>
              <textarea
                value={formData.about}
                onChange={(e) => handleInputChange(e, "about")}
                className="textarea textarea-bordered w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Specializations</label>
              {formData.specializations.map((spec, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => handleInputChange(e, "specializations", index)}
                    className="input input-bordered w-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField("specializations", index)}
                    className="btn btn-error btn-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddField("specializations")}
                className="btn btn-primary btn-sm"
              >
                Add Specialization
              </button>
            </div>
          </>
        )}

        <div className="mt-6">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <button
          type="button"
          onClick={handlePasswordReset}
          className="btn btn-secondary"
        >
          Send Password Reset Email
        </button>
        {resetEmailSent && (
          <p className="text-green-500 mt-2">
            Password reset email sent successfully!
          </p>
        )}
      </div>
    </div>
  );
}