'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Here you would implement actual authentication logic
            console.log('Login attempt with:', email, password)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // On success, redirect to dashboard
            router.push('/dashboard')
        } catch (error) {
            console.error('Login failed:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex justify-center mb-6">
                        <div className="w-48">
                            <Link href="/">
                                <Image
                                    src="/img/logo.png"
                                    alt="Portokalle"
                                    width={200}
                                    height={100}
                                    className="w-full h-auto"
                                />
                            </Link>
                        </div>
                    </div>

                    <h2 className="card-title text-2xl font-bold text-center mx-auto mb-4 text-gray-800">Login</h2>

                    <form onSubmit={handleSubmit} className="form-control gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text text-gray-700">Email</span>
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
                                <span className="label-text text-gray-700">Password</span>
                                <Link href="/forgot-password" className="label-text-alt link link-hover text-primary">
                                    Forgot password?
                                </Link>
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

                        <button
                            type="submit"
                            className={`btn btn-primary w-full mt-2 ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="divider my-6">OR</div>

                    <div className="text-center">
                        <p className="mb-2 text-gray-700">Don&apos;t have an account?</p>
                        <Link href="/register" className="btn btn-outline btn-wide">
                            Register Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
