"use client";


import { COMPANY_NAME, FOOTER_TAGLINE } from "@/utils/strings";
export default function FooterSection() {
  return (
    <footer className="w-full bg-orange-950 text-gray-400 py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
  <img src="/img/logo.png" alt="Portokalle Logo" className="mb-3 w-3/5 h-auto max-w-xs object-contain" />
        <span className="text-lg font-semibold text-white">{COMPANY_NAME}</span>
        <span className="text-xs text-gray-500 mb-2">{FOOTER_TAGLINE}</span>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          <a href="#" className="text-black hover:text-orange-500 transition-colors">About us</a>
          <a href="#" className="text-black hover:text-orange-500 transition-colors">Contact</a>
          <a href="#" className="text-black hover:text-orange-500 transition-colors">Jobs</a>
          <a href="#" className="text-black hover:text-orange-500 transition-colors">Privacy policy</a>
        </div>
        <span className="text-[11px] text-gray-600 mt-4">&copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</span>
      </div>
    </footer>
  );
}
