import React from "react";

const RedirectingModal: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-md rounded-3xl bg-white shadow-2xl border border-purple-100 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-400" />
        <div className="px-5 pb-5 pt-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-purple-700">Redirecting</p>
            <p className="text-base font-bold text-gray-900">We’re taking you to the secure page…</p>
            <p className="text-xs text-gray-500">Please hold on. Your session stays protected by alodoktor.al.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectingModal;
