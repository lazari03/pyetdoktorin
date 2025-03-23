'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '../services/authService'; // Import the register function

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient'); // Default role
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
    const router = useRouter();

    const handleRegister = async () => {
        setLoading(true);
        try {
            const { user, role: registeredRole } = await register(email, password, role);
            console.log('Registered:', user.email, 'Role:', registeredRole);
            console.log('Redirecting to /login...');
            setShowModal(true);

            setTimeout(() => {
                setShowModal(false);
                router.push('/login'); // Redirect to login
            }, 3000);
        } catch (error: any) {
            console.error('Registration failed:', error.message);
            alert(error.message); // Show error message to the user
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-center mx-auto mb-4 text-gray-800">Register</h2>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleRegister();
                        }}
                        className="form-control gap-4"
                    >
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

                        <div>
                            <label className="label">
                                <span className="label-text text-gray-900">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-gray-900">Role</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary w-full mt-2 ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-2xl font-bold mb-4">Registration Successful!</h3>
                        <p className="text-gray-700">You will be redirected to the login page shortly.</p>
                    </div>
                </div>
            )}
        </div>
    );
}