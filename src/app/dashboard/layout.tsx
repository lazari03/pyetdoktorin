'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bars3Icon } from '@heroicons/react/24/outline'
import Image from 'next/image'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Default sidebar state - closed on mobile, open on desktop
    const [sidebarOpen, setSidebarOpen] = useState(false)
    
    // Handle responsiveness with useEffect
    useEffect(() => {
        // Check if window exists (client-side only)
        if (typeof window !== 'undefined') {
            // Set sidebar based on initial screen size
            const handleResize = () => {
                if (window.innerWidth < 768) {
                    setSidebarOpen(false)
                } else {
                    setSidebarOpen(true)
                }
            }
            
            // Set initial state
            handleResize()
            
            // Add event listener for window resize
            window.addEventListener('resize', handleResize)
            
            // Clean up the event listener
            return () => {
                window.removeEventListener('resize', handleResize)
            }
        }
    }, [])

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Search Doctors', href: '/dashboard/search' },
        { name: 'New Appointment', href: '/dashboard/new-appointment' },
        { name: 'Appointment History', href: '/dashboard/appointments' },
        { name: 'Sent Requests', href: '/dashboard/appointments' },
    ]

    return (
        <div className="min-h-screen bg-base-200">
            {/* Sidebar - with overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-base-100 shadow-xl transition-all duration-300 z-30 
                    ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}
            >
                <div className="p-4 w-64"> {/* Fixed width container for content */}
                    <nav className="mt-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block py-2.5 px-4 rounded-lg hover:bg-base-200 transition-colors"
                                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
                <header className="bg-base-100 shadow-md">
                    <div className="flex items-center justify-between p-4 relative">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="btn btn-square btn-ghost z-10"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>

                        {/* Logo centered using flex and responsive width */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 max-w-[50%]">
                            <Image 
                                src="/img/logo.png" 
                                alt="logo" 
                                width={200} 
                                height={100} 
                                className="w-auto h-auto" 
                                style={{ maxHeight: '2.5rem' }}
                            />
                        </div>
                        
                        <div className="w-10 invisible">{/* Spacer to balance the layout */}</div>
                    </div>
                </header>
                <main className="p-3 md:p-6">{children}</main>
            </div>
        </div>
    )
}
