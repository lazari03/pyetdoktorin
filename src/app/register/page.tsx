'use client'

import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center mb-4 text-gray-900">Register</h2>
          <form className="form-control gap-4">
            <div>
              <label className="label">
                <span className="label-text text-gray-900">Email</span>
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text text-gray-900">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-2">
              Register
            </button>
          </form>
          <div className="divider my-6">OR</div>
          <div className="text-center">
            <p className="mb-2 text-gray-900">Already have an account?</p>
            <Link href="/login" className="btn btn-outline btn-wide">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
