'use client';

import { useState, useEffect } from "react";
import { db } from "../../../../config/firebaseconfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "../../../../config/firebaseconfig"; // Correct import for auth
import { sendPasswordResetEmail } from "firebase/auth"; // Import the reset method
import Loader from "@/app/components/Loader";

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    about: "",
    specializations: [""],
    education: [""],
  });
  const [resetEmailSent, setResetEmailSent] = useState(false); // Track reset email status

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      try {
        const userId = auth.currentUser?.uid; // Get the current user's ID
        if (!userId) throw new Error("User not authenticated");

        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setFormData((prev) => ({ ...prev, ...userDoc.data() }));
          setUserRole(userDoc.data().role); // Set the user role (doctor or patient)
        } else {
          throw new Error("User data not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
      if (!email) throw new Error("Email is required to reset password");

      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true); // Indicate that the reset email was sent
      alert("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Failed to send password reset email. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userId = auth.currentUser?.uid; // Get the current user's ID
      if (!userId) throw new Error("User not authenticated");

      await setDoc(doc(db, "users", userId), formData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile!");
    }
  };

  if (loading) {
    return <Loader />; // Show loader while loading
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

        {userRole === "doctor" && (
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

            <div>
              <label className="block text-sm font-medium mb-1">Education</label>
              {formData.education.map((edu, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={edu}
                    onChange={(e) => handleInputChange(e, "education", index)}
                    className="input input-bordered w-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField("education", index)}
                    className="btn btn-error btn-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddField("education")}
                className="btn btn-primary btn-sm"
              >
                Add Education
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