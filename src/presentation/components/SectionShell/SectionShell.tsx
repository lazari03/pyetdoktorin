'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  Bars3Icon,
  BellIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  ClockIcon,
  HomeModernIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { z } from '@/config/zIndex';
import type { MenuEntryDef, NavItemDef } from '@/navigation/navConfig';

export type AppSectionId = 'dashboard' | 'admin' | 'clinic' | 'pharmacy';
export type MenuActionId = Extract<MenuEntryDef, { kind: 'action' }>['actionId'];

function sectionHomeHref(sectionId: AppSectionId): string {
  switch (sectionId) {
    case 'admin':
      return '/admin';
    case 'clinic':
      return '/clinic';
    case 'pharmacy':
      return '/pharmacy';
    case 'dashboard':
    default:
      return '/dashboard';
  }
}

function AppWordmark({
  tone,
  pharmacyMark,
}: {
  tone: 'light' | 'dark';
  pharmacyMark?: boolean;
}) {
  const wordmarkClassName =
    tone === 'dark'
      ? 'text-white/95 uppercase tracking-[0.42em] font-semibold text-sm'
      : 'text-purple-700 uppercase tracking-[0.26em] font-semibold text-sm';

  const markClassName =
    tone === 'dark'
      ? 'border-white/15 bg-white/10 text-white/95'
      : 'border-purple-200 bg-purple-50 text-purple-700';

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`select-none ${wordmarkClassName}`}>PYETDOKTORIN</span>
      {pharmacyMark ? (
        <span
          aria-hidden="true"
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[12px] font-bold leading-none ${markClassName}`}
          title="+"
        >
          +
        </span>
      ) : null}
    </span>
  );
}

function menuIcon({
  iconKey,
  sectionId,
}: {
  iconKey: string;
  sectionId: AppSectionId;
}): React.ReactNode {
  const common = 'h-5 w-5';
  const muted = `${common} text-gray-500`;

  switch (iconKey) {
    case 'profile':
      return <UserCircleIcon className={muted} />;
    case 'appointments':
      return <CalendarIcon className={muted} />;
    case 'notifications':
      return <BellIcon className={muted} />;
    case 'earnings':
      return <BanknotesIcon className={muted} />;
    case 'calendar':
      return <CalendarIcon className={muted} />;
    case 'bookings':
      return <ClockIcon className={muted} />;
    case 'dashboard': {
      if (sectionId === 'clinic') return <BuildingOfficeIcon className={muted} />;
      if (sectionId === 'pharmacy') return <BuildingStorefrontIcon className={muted} />;
      return <HomeModernIcon className={muted} />;
    }
    case 'logout':
      return <ArrowRightOnRectangleIcon className={`${common} text-red-500`} />;
    default:
      return <UserCircleIcon className={muted} />;
  }
}

export default function SectionShell({
  sectionId,
  navItems,
  profileMenuItems,
  activePath,
  initials,
  onNavigate,
  onMenuAction,
  mobileCenter,
  desktopLeft,
  children,
}: {
  sectionId: AppSectionId;
  navItems: NavItemDef[];
  profileMenuItems: MenuEntryDef[];
  activePath: string;
  initials: string;
  onNavigate: (href: string) => void;
  onMenuAction: (actionId: MenuActionId) => void;
  mobileTitleKey?: string;
  mobileTitleFallback?: string;
  mobileCenter?: React.ReactNode;
  desktopLeft?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const mobileProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const desktopProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [activePath]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;
      const insideMobile = mobileProfileMenuRef.current?.contains(e.target) ?? false;
      const insideDesktop = desktopProfileMenuRef.current?.contains(e.target) ?? false;
      if (!insideMobile && !insideDesktop) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileMenuOpen]);

  const renderedNav = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        name: t(item.labelKey, { defaultValue: item.fallback }),
      })),
    [navItems, t],
  );

  const renderedProfileMenu = useMemo(
    () =>
      profileMenuItems.map((entry) => {
        if (entry.kind === 'divider') return entry;
        return {
          ...entry,
          name: t(entry.labelKey, { defaultValue: entry.fallback }),
        };
      }),
    [profileMenuItems, t],
  );

  const handleNavigate = (href: string) => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    onNavigate(href);
  };

  const handleAction = (actionId: MenuActionId) => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    onMenuAction(actionId);
  };

  const homeHref = sectionHomeHref(sectionId);

  const profileButtonClassName =
    sectionId === 'dashboard'
      ? 'h-8 w-8 rounded-full bg-gray-900 text-xs font-semibold text-white flex items-center justify-center'
      : 'h-8 w-8 rounded-full bg-purple-600 text-xs font-semibold text-white flex items-center justify-center';

  const desktopLeftNode =
    desktopLeft ?? (
      <Link
        href={homeHref}
        className="inline-flex items-center"
        aria-label="Pyet Doktorin"
        data-analytics={`${sectionId}.brand.home`}
      >
        <AppWordmark tone="dark" pharmacyMark={sectionId === 'pharmacy'} />
      </Link>
    );

  return (
    <div className="app-page-gradient min-h-screen flex flex-col">
      <div
        className={`md:hidden fixed top-0 left-0 right-0 bg-white shadow-md flex items-center justify-between px-4 py-4 ${z.navbar}`}
      >
        <button
          onClick={() => {
            setProfileMenuOpen(false);
            setMobileMenuOpen((open) => !open);
          }}
          className="text-gray-800 hover:text-gray-900"
          aria-label="Toggle navigation menu"
          data-analytics={`${sectionId}.mobile_menu.toggle`}
        >
          {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>

        <div className="flex-1 flex justify-center">
          {mobileCenter ?? (
            <Link
              href={homeHref}
              className="inline-flex items-center"
              aria-label="Pyet Doktorin"
              data-analytics={`${sectionId}.brand.home`}
            >
              <AppWordmark tone="light" pharmacyMark={sectionId === 'pharmacy'} />
            </Link>
          )}
        </div>

        <div className="relative z-[200]" ref={mobileProfileMenuRef}>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setProfileMenuOpen((open) => !open);
            }}
            className={profileButtonClassName}
            aria-label="Open profile menu"
            data-analytics={`${sectionId}.profile.toggle`}
          >
            {initials}
          </button>

          {profileMenuOpen && (
            <>
              <div className={`fixed inset-0 ${z.backdrop}`} onClick={() => setProfileMenuOpen(false)} aria-hidden="true" />
              <div
                className={`fixed right-4 top-16 w-56 rounded-xl bg-white shadow-lg border border-gray-100 py-2 text-sm pointer-events-auto ${z.maximum}`}
              >
                {renderedProfileMenu.map((entry) => {
                  if (entry.kind === 'divider') {
                    return <div key={entry.key} className="my-2 border-t border-gray-100" />;
                  }

                  if (entry.kind === 'action') {
                    return (
                      <button
                        key={entry.key}
                        onClick={() => handleAction(entry.actionId)}
                        className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        data-analytics={entry.analyticsId}
                      >
                        {menuIcon({ iconKey: entry.iconKey, sectionId })}
                        <span className="font-medium">{entry.name}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={entry.key}
                      href={entry.href}
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      data-analytics={entry.analyticsId}
                    >
                      {menuIcon({ iconKey: entry.iconKey, sectionId })}
                      <span className="font-medium">{entry.name}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`md:hidden fixed inset-0 top-14 left-0 right-0 bg-white ${z.dropdown}`}>
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
            <nav className="flex flex-col items-center w-full max-w-sm space-y-2">
              {renderedNav.map((item) => {
                const active = activePath === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    className={`w-full py-4 text-center text-lg font-medium rounded-xl transition-all duration-200 ${
                      active ? 'text-purple-600 bg-purple-50 shadow-sm' : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                    data-analytics={`${sectionId}.nav.${item.key}`}
                  >
                    <span className="capitalize">{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <header className={`hidden md:block sticky top-0 ${z.navbar}`}>
        <div className="relative border-b border-white/10 bg-gradient-to-r from-purple-800 via-purple-700 to-purple-600 text-white shadow-md">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_85%_0%,rgba(56,189,248,0.12),transparent_40%)]" />
          <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-6 px-10 py-4">
            {desktopLeftNode}

            <nav className="flex flex-1 items-center justify-center" aria-label="Primary navigation">
              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 shadow-sm backdrop-blur">
                {renderedNav.map((item) => {
                  const active = activePath === item.href;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleNavigate(item.href)}
                      aria-current={active ? 'page' : undefined}
                      className={`relative rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/35 ${
                        active ? 'text-white' : 'text-white/85 hover:text-white'
                      } after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-[2px] after:rounded-full after:transition-opacity ${
                        active ? 'after:bg-white after:opacity-100' : 'after:bg-white after:opacity-0 hover:after:opacity-30'
                      }`}
                      data-analytics={`${sectionId}.nav.${item.key}`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="relative flex items-center justify-end w-24" ref={desktopProfileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="h-9 w-9 rounded-full border border-white/15 bg-white/10 text-xs font-semibold text-white flex items-center justify-center shadow-sm backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/35"
                data-analytics={`${sectionId}.profile.toggle`}
              >
                {initials}
              </button>
              {profileMenuOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-200/70 py-2 text-sm text-slate-900 ${z.maximum}`}
                >
                  {renderedProfileMenu.map((entry) => {
                    if (entry.kind === 'divider') {
                      return <div key={entry.key} className="my-2 border-t border-slate-100" />;
                    }

                    if (entry.kind === 'action') {
                      return (
                        <button
                          key={entry.key}
                          type="button"
                          onClick={() => handleAction(entry.actionId)}
                          className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          data-analytics={entry.analyticsId}
                        >
                          {menuIcon({ iconKey: entry.iconKey, sectionId })}
                          <span className="font-medium">{entry.name}</span>
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={entry.key}
                        href={entry.href}
                        onClick={() => setProfileMenuOpen(false)}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                        data-analytics={entry.analyticsId}
                      >
                        {menuIcon({ iconKey: entry.iconKey, sectionId })}
                        <span className="font-medium">{entry.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </header>

      <main className="flex-1 pt-14 md:pt-0 px-2 sm:px-4 md:px-8 lg:px-12 py-4 md:py-6 lg:py-8">{children}</main>
    </div>
  );
}
