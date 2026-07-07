type IconProps = { className?: string };

const base = (className: string | undefined, path: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className ?? 'h-4 w-4'}>
    <path d={path} />
  </svg>
);

export const PillIcon = ({ className }: IconProps) =>
  base(className, 'M9 12h6m-3-3v6m5.25 5.25H6.75A2.25 2.25 0 014.5 19.5V6.75A2.25 2.25 0 016.75 4.5h10.5A2.25 2.25 0 0119.5 6.75v12.75a2.25 2.25 0 01-2.25 2.25z');

export const ClipboardIcon = ({ className }: IconProps) =>
  base(className, 'M9 12h6m-6 3.75h6M9 8.25h6m3 12.75H6a2.25 2.25 0 01-2.25-2.25V6A2.25 2.25 0 016 3.75h1.5m9 0H18A2.25 2.25 0 0120.25 6v12.75A2.25 2.25 0 0118 21zM8.25 3.75a1.5 1.5 0 011.5-1.5h4.5a1.5 1.5 0 011.5 1.5v.75a.75.75 0 01-.75.75h-6a.75.75 0 01-.75-.75v-.75z');

export const UserIcon = ({ className }: IconProps) =>
  base(className, 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z');

export const GoogleIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className ?? 'h-4 w-4'} aria-hidden>
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 01-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0012 24z" />
    <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 014.9 12c0-.79.14-1.56.37-2.28V6.61H1.27A12 12 0 000 12c0 1.94.46 3.77 1.27 5.39l4-3.11z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);
