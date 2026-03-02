import { cookies } from 'next/headers';
import NavBar from './navBar';
import { AUTH_COOKIE_NAMES } from '@/config/cookies';

export default async function NavBarServer() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get(AUTH_COOKIE_NAMES.session)?.value);
  return <NavBar hasSession={hasSession} />;
}

