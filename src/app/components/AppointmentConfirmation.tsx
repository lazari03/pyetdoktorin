import Link from 'next/link';

export default function AppointmentConfirmation({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-0 overflow-hidden border border-primary/20">
        {/* X Close Button */}
        <button
          className="absolute top-3 right-3 text-primary hover:text-primary/80 text-2xl font-bold z-10 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {/* Primary Success Top Section */}
        <div className="flex flex-col items-center justify-center bg-primary p-7 rounded-t-3xl">
          {/* Success Icon */}
          <svg className="w-16 h-16 mb-2 drop-shadow-lg" fill="none" viewBox="0 0 48 48" stroke="white" strokeWidth="3">
            <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="3" fill="none" />
            <path d="M16 25l6 6 10-12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-white text-xl font-bold tracking-wide mt-1">Success!</span>
        </div>
        {/* Message Section */}
        <div className="flex flex-col items-center bg-white px-8 py-10">
          <p className="text-gray-800 text-center mb-7 text-base font-medium">
            Your appointment request has been sent successfully.<br />You will be notified once it is accepted or declined.
          </p>
          <Link href="/dashboard/appointments" className="w-full">
            <button
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-full shadow transition-all text-lg tracking-wide"
              style={{ boxShadow: '0 4px 16px 0 rgba(88,190,204,0.15)' }}
            >
              Go to Appointment History
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
