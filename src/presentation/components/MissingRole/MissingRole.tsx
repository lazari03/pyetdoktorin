'use client';

type Props = {
  onLogout?: () => void;
};

export default function MissingRole({ onLogout }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-purple-50/30 px-4">
      <div className="w-full max-w-md rounded-3xl border border-purple-100 bg-white shadow-xl p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">Account</p>
        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">We couldn’t load your profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          This usually happens when your user record is missing, access is denied by Firestore rules, or your account is
          still being provisioned.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => onLogout?.()}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
          >
            Log out
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          If this persists in production, check the browser console + Network tab for Firestore <code>permission-denied</code>{' '}
          and confirm the <code>users/{'{uid}'}</code> document exists.
        </p>
      </div>
    </div>
  );
}
