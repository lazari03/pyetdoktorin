"use client";

import React, { useState } from 'react';
import { useDI } from '@/context/DIContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { resetUserPasswordUseCase } = useDI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetUserPasswordUseCase.execute(email);
      setSubmitted(true);
    } catch {
      alert('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center mb-4 text-gray-900">
            Forgot Password
          </h2>
          {submitted ? (
            <p className="text-center text-gray-700">
              If an account with that email exists, you will receive a password reset link shortly.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="form-control gap-4">
              <div>
                <label className="label">
                  <span className="label-text text-gray-900">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-full mt-2">
                Reset Password
              </button>
            </form>
          )}
          <div className="text-center mt-4">
            <a href="/login" className="link text-primary">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
