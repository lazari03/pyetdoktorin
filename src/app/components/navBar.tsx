'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function NavBar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    router.push('/login');
  };

  const handleSignUpClick = () => {
    setIsMenuOpen(false);
    router.push('/register');
  };

  const handleNavItemClick = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };


  // Lock scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[9999] drop-shadow-xl"
    >
      {/* Main NavBar */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-5 mt-4 h-24 md:h-auto rounded-2xl bg-white/80 backdrop-blur shadow-lg relative flex items-center justify-between z-[9999]">
        {/* Left - Hamburger or X */}
        <div className="md:hidden z-[10000]">
          <button
            className="text-[#ea580c]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-8 w-8 text-[#ea580c]" />
            ) : (
              <Bars3Icon className="h-8 w-8 text-[#ea580c]" />
            )}
          </button>
        </div>

        {/* Center - Logo */}
        <div className="absolute inset-x-0 flex justify-center z-[9999]">
          <Link href="/">
            <Image
              src="/img/logo.png"
              alt="Portokalle Health"
              width={140}
              height={60}
              priority
            />
          </Link>
        </div>

        {/* Right - Mobile Sign In */}
        <div className="md:hidden z-[10000]">
          <button
            className="flex items-center space-x-1 text-[#ea580c] font-medium"
            onClick={handleLoginClick}
          >
            <i className="fa-solid fa-arrow-right text-lg"></i>
            <span>Sign in</span>
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-10 text-[15px] font-medium text-gray-800 z-[9999]">
          <Link
            href="/individuals"
            className="text-black hover:text-[#ea580c] cursor-pointer"
            onClick={() => handleNavItemClick('/individuals')}
          >
            Individuals
          </Link>
          <Link
            href="/organizations"
            className="text-black hover:text-[#ea580c] cursor-pointer"
            onClick={() => handleNavItemClick('/organizations')}
          >
            Organizations
          </Link>
          <Link
            href="/clinicians"
            className="text-black hover:text-[#ea580c] cursor-pointer"
            onClick={() => handleNavItemClick('/clinicians')}
          >
            Clinicians
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4 ml-auto z-[9999]">
          <button
            className="text-[#ea580c] hover:underline font-medium cursor-pointer"
            onClick={handleLoginClick}
          >
            Sign in
          </button>
          <button
            className="bg-[#ea580c] text-white rounded-full px-6 py-2 font-semibold hover:bg-orange-700 transition-colors cursor-pointer"
            onClick={handleSignUpClick}
          >
            Register now
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown - Full Screen with White Background - Matching Screenshot */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md z-[10001] flex flex-col rounded-b-2xl overflow-hidden">
          {/* Menu Items */}
          <nav className="flex flex-col">
            <Link
              href="/individuals"
              className="text-blue-600 py-4 px-6 border-b border-gray-100 cursor-pointer"
              onClick={() => handleNavItemClick('/individuals')}
            >
              Individuals
            </Link>
            <Link
              href="/organizations"
              className="text-blue-600 py-4 px-6 border-b border-gray-100 cursor-pointer"
              onClick={() => handleNavItemClick('/organizations')}
            >
              Organizations
            </Link>
            <Link
              href="/clinicians"
              className="text-blue-600 py-4 px-6 border-b border-gray-100 cursor-pointer"
              onClick={() => handleNavItemClick('/clinicians')}
            >
              Clinicians
            </Link>
          </nav>

          {/* Register Button */}
          <div className="p-4 border-t border-gray-100">
            <button
              className="bg-[#ea580c] text-white rounded-full py-3 px-6 w-full font-semibold cursor-pointer"
              onClick={handleSignUpClick}
            >
              Register now
            </button>
          </div>
        </div>
      )}

    </header>
  );
}