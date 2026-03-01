"use client";

import React, { useState } from 'react';
import { useDI } from '@/context/DIContext';
import { Button } from '@/presentation/ui/Button';
import { Card } from '@/presentation/ui/Card';
import { Input } from '@/presentation/ui/Input';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
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
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2">
                Reset Password
              </Button>
            </form>
          )}
          <div className="text-center mt-4">
            <a href="/login" className="link text-primary">
              Back to Login
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
