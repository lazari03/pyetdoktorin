'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bars3Icon } from '@heroicons/react/24/outline'
import Image from 'next/image'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Search Doctors', href: '/dashboard/search' },
        { name: 'New Appointment', href: '/dashboard/new-appointment' },
        { name: 'Appointment History', href: '/dashboard/appointments' },
        { name: 'Sent Requests', href: '/dashboard/appointments' },
    ]

    return (
        <div className="min-h-screen bg-base-200">
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-base-100 shadow-xl transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'
                    } overflow-hidden`}
            >
                <div className="p-4 w-64"> {/* Fixed width container for content */}
                    <nav className="mt-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block py-2.5 px-4 rounded-lg hover:bg-base-200 transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <header className="bg-base-100 shadow-md">
                    <div className="flex items-center justify-between p-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="btn btn-square btn-ghost"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>

                        <div className='absolute left-1/2 -translate-x-1/2'>
                            <Image src="/img/logo.png" alt="logo" width={200} height={100} />
                        </div>

                        <div className="w-10"></div> {/* Spacer to balance the layout */}
                    </div>
                </header>
                <main className="p-6">{children}</main>
            </div>
        </div>
    )
}
