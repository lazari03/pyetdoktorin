interface ProfileWarningProps {
  show: boolean;
}

export default function ProfileWarning({ show }: ProfileWarningProps) {
  if (!show) return null;
  return (
    <div className="alert alert-warning mb-6">
      <span>Your profile is incomplete. Please complete your profile</span>
    </div>
  );
}
