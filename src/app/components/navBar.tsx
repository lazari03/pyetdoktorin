'use client'
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NavBar() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/dashboard'); // Redirect to the dashboard page
  };

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li><a>Faqja Kryesore</a></li>
            <li>
              <a>Si funksionon</a>
              <ul className="p-2">
                <li><a>Submenu 1</a></li>
                <li><a>Submenu 2</a></li>
              </ul>
            </li>
            <li><a>Kontakt</a></li>
          </ul>
        </div>
        <a className="btn btn-ghost text-xl" href='/'><Image src="/img/logo.png" alt={'logo'} width={200} height={100} /></a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><a> Faqja Kryesore</a></li>
          <li>
            <details>
              <summary>Si Funksionon</summary>
              <ul className="p-2">
                <li><a>Submenu 1</a></li>
                <li><a>Submenu 2</a></li>
              </ul>
            </details>
          </li>
          <li><a>Kontakt</a></li>
        </ul>
      </div>
      <div className="navbar-end">
        <button className="btn" onClick={handleLoginClick}>
          Login
        </button>
      </div>
    </div>
  );
}
