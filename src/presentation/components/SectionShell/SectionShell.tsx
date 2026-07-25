'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useDI } from '@/context/DIContext';
import { useDoctorSearchStore } from '@/store/doctorSearchStore';
import { useNavigationCoordinator } from '@/navigation/NavigationCoordinator';
import {
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  HomeModernIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserCircleIcon,
  UsersIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { z } from '@/config/zIndex';
import type { MenuEntryDef, NavItemDef } from '@/navigation/navConfig';
import { useNotificationsLogic } from '@/app/(app)/dashboard/notifications/useNotificationsLogic';
import { useNotificationReadState } from '@/presentation/hooks/useNotificationReadState';
import { useUserNotifications } from '@/presentation/hooks/useUserNotifications';
import { usePushNotifications } from '@/presentation/hooks/usePushNotifications';
import { useAuth } from '@/context/AuthContext';

export type AppSectionId = 'dashboard' | 'admin' | 'clinic' | 'pharmacy';
export type MenuActionId = Extract<MenuEntryDef, { kind: 'action' }>['actionId'];

const SIDEBAR_COLLAPSE_STORAGE_KEY = 'pd_sidebar_collapsed';
const SIDEBAR_WIDTH_EXPANDED = 'md:w-[248px]';
const SIDEBAR_WIDTH_COLLAPSED = 'md:w-[76px]';

function sectionLabel(sectionId: AppSectionId): string {
  switch (sectionId) {
    case 'admin': return 'ADMIN MENU';
    case 'clinic': return 'CLINIC MENU';
    case 'pharmacy': return 'PHARMACY MENU';
    case 'dashboard':
    default: return 'PATIENT MENU';
  }
}

function sectionNotificationsHref(sectionId: AppSectionId): string {
  switch (sectionId) {
    case 'admin': return '/admin/notifications';
    case 'clinic': return '/clinic/notifications';
    case 'pharmacy': return '/pharmacy/notifications';
    case 'dashboard':
    default: return '/dashboard/notifications';
  }
}

function formatRelativeTime(ts: number): string {
  if (!Number.isFinite(ts) || ts <= 0) return '';
  const diffMs = Date.now() - ts;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function sectionSearchHref(sectionId: AppSectionId, q: string): string {
  const encoded = encodeURIComponent(q);
  switch (sectionId) {
    case 'admin': return `/admin/users?search=${encoded}`;
    case 'clinic': return `/clinic/bookings?search=${encoded}`;
    case 'pharmacy': return `/pharmacy/reciepes?search=${encoded}`;
    case 'dashboard':
    default: return `/dashboard/notifications?q=${encoded}`;
  }
}

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

// Sidebar nav items carry no iconKey of their own (NavItemDef is shared across every
// section and intentionally minimal) — map by nav `key` instead so the icons stay in
// sync without touching src/navigation/navConfig.ts.
function navIcon({ iconKey, sectionId }: { iconKey: string; sectionId: AppSectionId }): React.ReactNode {
  const cls = 'h-full w-full';
  switch (iconKey) {
    case 'dashboard':
    case 'adminDashboard':
    case 'clinicDashboard':
    case 'pharmacyDashboard':
      if (sectionId === 'clinic') return <BuildingOfficeIcon className={cls} />;
      if (sectionId === 'pharmacy') return <BuildingStorefrontIcon className={cls} />;
      return <HomeModernIcon className={cls} />;
    case 'newAppointment':
      return <PlusCircleIcon className={cls} />;
    case 'appointments':
    case 'appointmentHistory':
    case 'reports':
    case 'bookings':
      return <ClipboardDocumentListIcon className={cls} />;
    case 'calendar':
    case 'availability':
      return <CalendarIcon className={cls} />;
    case 'reciepe':
    case 'reciepes':
    case 'myReciepes':
      return <DocumentTextIcon className={cls} />;
    case 'payouts':
      return <BanknotesIcon className={cls} />;
    case 'privateClinics':
      return <BuildingOfficeIcon className={cls} />;
    case 'users':
      return <UsersIcon className={cls} />;
    case 'notifications':
      return <BellIcon className={cls} />;
    case 'security':
      return <ShieldCheckIcon className={cls} />;
    case 'blog':
      return <DocumentIcon className={cls} />;
    default:
      return <Squares2X2Icon className={cls} />;
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
  displayName,
  displayEmail,
  topbarCta,
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
  displayName?: string;
  displayEmail?: string;
  topbarCta?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [topbarProfileOpen, setTopbarProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const desktopProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const topbarProfileMenuRef = useRef<HTMLDivElement | null>(null);
  const notifMenuRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const { fetchDoctorsUseCase, markUserNotificationReadUseCase, markAllUserNotificationsReadUseCase } = useDI();
  const nav = useNavigationCoordinator();
  const { user } = useAuth();
  const { filteredDoctors, setSearchTerm: setDoctorSearchTerm, fetchDoctors, reset: resetDoctorSearch } = useDoctorSearchStore();
  const {
    appointmentNotifications,
    prescriptionNotifications,
  } = useNotificationsLogic(nav);
  const { isRead, markRead, markManyRead, unreadCount } = useNotificationReadState(user?.uid);

  const { status: pushStatus, enable: enablePush } = usePushNotifications();

  const { data: userNotifData, mutate: mutateUserNotifications } = useUserNotifications(user?.uid);
  const userNotifItems = useMemo(() => userNotifData?.items ?? [], [userNotifData]);
  const userNotifUnreadCount = userNotifData?.unreadCount ?? 0;

  const notifFeed = useMemo(() => {
    const fromAppointments = appointmentNotifications.slice(0, 8).map((a) => {
      const normalized = (a.status || '').toString().trim().toLowerCase();
      const tone =
        normalized === 'accepted'
          ? { icon: CheckCircleIcon, bg: 'bg-green-100', color: 'text-green-700' }
          : normalized === 'rejected' || normalized === 'declined' || normalized === 'canceled' || normalized === 'cancelled'
          ? { icon: XCircleIcon, bg: 'bg-red-100', color: 'text-red-700' }
          : { icon: BellIcon, bg: 'bg-amber-100', color: 'text-amber-700' };
      const text =
        normalized === 'accepted'
          ? t('notificationAccepted', { doctor: a.doctorName || t('doctor') })
          : normalized === 'rejected'
          ? t('notificationRejected', { doctor: a.doctorName || t('doctor') })
          : t('notificationPending', { doctor: a.doctorName || t('doctor') });
      return {
        id: `appt-${a.id}`,
        appointmentId: a.id,
        icon: tone.icon,
        bg: tone.bg,
        color: tone.color,
        text,
        ts: new Date(a.createdAt).getTime(),
        read: undefined as boolean | undefined,
      };
    });
    const fromPrescriptions = prescriptionNotifications.slice(0, 8).map((p) => ({
      id: `rx-${p.id}`,
      appointmentId: null as string | null,
      icon: DocumentPlusIcon,
      bg: 'bg-blue-100',
      color: 'text-blue-700',
      text: t('notificationNewPrescription', { doctor: p.doctorName || t('doctor') }) || `New prescription issued by ${p.doctorName || t('doctor')}.`,
      ts: p.updatedAt,
      read: undefined as boolean | undefined,
    }));
    const fromUserNotifications = userNotifItems.map((n) => ({
      id: `un-${n.id}`,
      appointmentId: null as string | null,
      icon: BellIcon,
      bg: 'bg-purple-100',
      color: 'text-purple-700',
      text: n.title,
      ts: n.createdAt,
      read: n.read as boolean | undefined,
    }));
    return [...fromAppointments, ...fromPrescriptions, ...fromUserNotifications]
      .filter((n) => Number.isFinite(n.ts))
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 8);
  }, [appointmentNotifications, prescriptionNotifications, userNotifItems, t]);

  const legacyNotifFeedIds = useMemo(
    () => notifFeed.filter((n) => n.read === undefined).map((n) => n.id),
    [notifFeed],
  );
  const notifUnreadCount = unreadCount(legacyNotifFeedIds) + userNotifUnreadCount;

  const markAllRead = useCallback(() => {
    markManyRead(legacyNotifFeedIds);
    if (userNotifUnreadCount > 0) {
      markAllUserNotificationsReadUseCase
        .execute()
        .then(() => {
          void mutateUserNotifications(
            (current) =>
              current && {
                unreadCount: 0,
                items: current.items.map((n) => ({ ...n, read: true, readAt: n.readAt ?? Date.now() })),
              },
            { revalidate: false },
          );
        })
        .catch(() => {});
    }
  }, [legacyNotifFeedIds, markManyRead, userNotifUnreadCount, markAllUserNotificationsReadUseCase, mutateUserNotifications]);

  const handleNotifClick = useCallback(
    (id: string) => {
      if (id.startsWith('un-')) {
        const realId = id.slice(3);
        markUserNotificationReadUseCase
          .execute(realId)
          .then(() => {
            void mutateUserNotifications(
              (current) =>
                current && {
                  unreadCount: Math.max(0, current.unreadCount - 1),
                  items: current.items.map((n) =>
                    n.id === realId ? { ...n, read: true, readAt: n.readAt ?? Date.now() } : n,
                  ),
                },
              { revalidate: false },
            );
          })
          .catch(() => {});
      } else {
        markRead(id);
      }
    },
    [markRead, markUserNotificationReadUseCase, mutateUserNotifications],
  );

  const handleDoctorSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    if (sectionId !== 'dashboard') return;
    setDoctorSearchTerm(value);
    if (value.trim().length > 0) {
      setDoctorDropdownOpen(true);
      fetchDoctors((term, type) => fetchDoctorsUseCase.execute(term, type));
    } else {
      setDoctorDropdownOpen(false);
      resetDoctorSearch();
    }
  }, [sectionId, setDoctorSearchTerm, fetchDoctors, fetchDoctorsUseCase, resetDoctorSearch]);

  // Close doctor dropdown on outside click
  useEffect(() => {
    if (!doctorDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setDoctorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [doctorDropdownOpen]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning') || 'Good morning';
    if (h < 17) return t('goodAfternoon') || 'Good afternoon';
    return t('goodEvening') || 'Good evening';
  })();

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY);
    if (stored === '1') setCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setNotifOpen(false);
  }, [activePath]);

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  useEffect(() => {
    if (!profileMenuOpen && !topbarProfileOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;
      const insideMobile = mobileProfileMenuRef.current?.contains(e.target) ?? false;
      const insideDesktop = desktopProfileMenuRef.current?.contains(e.target) ?? false;
      const insideTopbar = topbarProfileMenuRef.current?.contains(e.target) ?? false;
      if (!insideMobile && !insideDesktop && !insideTopbar) {
        setProfileMenuOpen(false);
        setTopbarProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileMenuOpen, topbarProfileOpen]);

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
    setTopbarProfileOpen(false);
    onNavigate(href);
  };

  const handleAction = (actionId: MenuActionId) => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setTopbarProfileOpen(false);
    onMenuAction(actionId);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    if (sectionId === 'dashboard') return; // dashboard uses the dropdown
    handleNavigate(sectionSearchHref(sectionId, q));
    setSearchValue('');
  };

  const homeHref = sectionHomeHref(sectionId);


  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#f5f6fa] overflow-hidden">
      <div
        className={`md:hidden fixed top-0 left-0 right-0 bg-white shadow-md flex items-center justify-between px-4 py-4 ${z.navbar}`}
      >
        <button
          onClick={() => {
            setProfileMenuOpen(false);
            setMobileMenuOpen((open) => !open);
          }}
          className="text-gray-800 hover:text-gray-900"
          aria-label={t('toggleNavigationMenu')}
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
            className="h-9 w-9 rounded-full bg-purple-600 text-sm font-bold text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
            aria-label={t('openProfileMenu') || 'Open profile menu'}
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

      <aside
        className={`hidden md:flex md:flex-col md:h-full shrink-0 border-r border-gray-200 bg-white transition-[width] duration-200 ease-out relative ${z.sidebar} ${
          collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED
        }`}
      >
        {/* Brand row */}
        <div className={`flex items-center h-[68px] shrink-0 px-5 gap-3 ${collapsed ? 'justify-center px-0' : ''}`}>
          <Link
            href={homeHref}
            className="flex items-center gap-2.5"
            aria-label="Pyet Doktorin"
            data-analytics={`${sectionId}.brand.home`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-lg shadow-sm">
              +
            </span>
            {!collapsed && (
              <span className="flex flex-col leading-tight">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-900">PYETDOKTORIN</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-gray-400 font-medium">HEALTH PLATFORM</span>
              </span>
            )}
          </Link>
        </div>

        {/* Section label */}
        {!collapsed && (
          <p className="px-5 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
            {sectionLabel(sectionId)}
          </p>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5" aria-label={t('primaryNavigation') || 'Primary navigation'}>
          {renderedNav.map((item) => {
            const active = activePath === item.href;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavigate(item.href)}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? item.name : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl py-2.5 text-sm transition-all duration-150 ${
                  collapsed ? 'justify-center px-2' : 'px-3'
                } ${
                  active
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900'
                }`}
                data-analytics={`${sectionId}.nav.${item.key}`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                    active ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                >
                  {navIcon({ iconKey: item.key, sectionId })}
                </span>
                {!collapsed && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom: user */}
        <div className="border-t border-gray-100 p-3 space-y-1">
          <div className="relative" ref={desktopProfileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              className={`flex w-full items-center gap-3 rounded-xl p-2 hover:bg-gray-50 transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
              aria-label={t('openProfileMenu') || 'Open profile menu'}
              data-analytics={`${sectionId}.profile.toggle`}
            >
              <span className="h-9 w-9 shrink-0 rounded-full bg-purple-600 text-sm font-bold text-white flex items-center justify-center">
                {initials}
              </span>
              {!collapsed && (
                <span className="flex flex-col min-w-0 text-left">
                  <span className="text-sm font-semibold text-gray-900 truncate">{displayName || initials}</span>
                  {displayEmail && (
                    <span className="text-xs text-gray-400 truncate">{displayEmail}</span>
                  )}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto pt-14 md:pt-0">
        {/* ── Desktop top bar ── */}
        <header className={`hidden md:flex items-center gap-2 lg:gap-4 sticky top-0 bg-white border-b border-gray-200 px-3 lg:px-6 h-[68px] shrink-0 ${z.navbar}`}>
          {/* Sidebar collapse toggle */}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? (t('expandSidebar') || 'Expand sidebar') : (t('collapseSidebar') || 'Collapse sidebar')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            data-analytics={`${sectionId}.sidebar.toggle`}
          >
            <Bars3Icon className="h-[18px] w-[18px]" />
          </button>

          {/* Left: greeting (hidden on narrower desktop widths to make room for search + actions) */}
          <div className="hidden lg:flex flex-col justify-center shrink-0 min-w-0 max-w-[220px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-600 truncate">
              {t('overview') || 'OVERVIEW'}
            </p>
            <p className="text-base font-bold text-gray-900 leading-tight truncate">
              {greeting}{displayName ? `, ${displayName.split(' ')[0]}` : ''}
            </p>
          </div>

          {/* Center: search */}
          <div className="flex-1 min-w-0 max-w-[200px] lg:max-w-xs mx-1 lg:mx-4 relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => handleDoctorSearchChange(e.target.value)}
                  placeholder={sectionId === 'dashboard' ? (t('searchDoctors') || 'Search doctors…') : `${t('search') || 'Search'}…`}
                  className="w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                />
              </div>
            </form>
            {/* Doctor search dropdown (dashboard only) */}
            {sectionId === 'dashboard' && doctorDropdownOpen && (
              <div className={`absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden ${z.maximum}`}>
                {filteredDoctors.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">{t('noResults') || 'No doctors found'}</p>
                ) : (
                  <ul>
                    {filteredDoctors.slice(0, 8).map((doc) => (
                      <li key={doc.id}>
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-purple-50 transition-colors"
                          onClick={() => {
                            setDoctorDropdownOpen(false);
                            setSearchValue('');
                            resetDoctorSearch();
                            nav.toDoctorProfile(doc.id);
                          }}
                        >
                          <span className="h-7 w-7 shrink-0 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                            {doc.name.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                            {doc.specialization?.length > 0 && (
                              <p className="text-xs text-gray-400 truncate">{doc.specialization[0]}</p>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Right: bell + CTA + profile */}
          <div className="flex items-center gap-1 lg:gap-2 ml-auto shrink-0">
            {/* Notification bell */}
            <div className="relative shrink-0" ref={notifMenuRef}>
              <button
                type="button"
                onClick={() => { setTopbarProfileOpen(false); setNotifOpen((o) => !o); }}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:border-purple-300 hover:text-purple-700 transition-colors"
                aria-label={t('notifications') || 'Notifications'}
                data-analytics={`${sectionId}.topbar.notifications`}
              >
                <BellIcon className="h-5 w-5" />
                {notifUnreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
                  </span>
                ) : null}
              </button>

              {notifOpen && (
                <div className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden ${z.maximum}`}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-[13.5px] font-bold text-gray-900">{t('notifications') || 'Notifications'}</p>
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800"
                      data-analytics={`${sectionId}.topbar.notifications.mark_all_read`}
                    >
                      {t('markAllRead') || 'Mark all read'}
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {notifFeed.length === 0 ? (
                      <p className="px-4 py-6 text-center text-[12.5px] text-gray-500">
                        {t('noNewNotifications') || 'No new notifications'}
                      </p>
                    ) : (
                      notifFeed.map((n) => {
                        const Icon = n.icon;
                        const unread = n.read === undefined ? !isRead(n.id) : !n.read;
                        const href = n.appointmentId
                          ? `${sectionNotificationsHref(sectionId)}?focus=${encodeURIComponent(n.appointmentId)}`
                          : sectionNotificationsHref(sectionId);
                        return (
                          <Link
                            key={n.id}
                            href={href}
                            onClick={() => { handleNotifClick(n.id); setNotifOpen(false); }}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${unread ? 'bg-purple-50/40' : ''}`}
                            data-analytics={`${sectionId}.topbar.notifications.open`}
                          >
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.bg} ${n.color}`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block text-[12.5px] leading-snug ${unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{n.text}</span>
                              <span className="block text-[10.5px] text-gray-400 mt-0.5">{formatRelativeTime(n.ts)}</span>
                            </span>
                            {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-purple-600" />}
                          </Link>
                        );
                      })
                    )}
                  </div>

                  {pushStatus === 'default' && (
                    <button
                      type="button"
                      onClick={() => void enablePush()}
                      className="block w-full px-4 py-2.5 text-center text-[11.5px] font-semibold text-gray-500 hover:bg-gray-50 border-t border-gray-100 transition-colors"
                      data-analytics={`${sectionId}.topbar.notifications.enable_push`}
                    >
                      {t('enablePushNotifications') || 'Enable push notifications'}
                    </button>
                  )}

                  <Link
                    href={sectionNotificationsHref(sectionId)}
                    onClick={() => setNotifOpen(false)}
                    className="block px-4 py-3 text-center text-[11.5px] font-semibold text-purple-700 hover:bg-purple-50 border-t border-gray-100 transition-colors"
                    data-analytics={`${sectionId}.topbar.notifications.view_all`}
                  >
                    {t('viewAllNotifications') || 'View all notifications'}
                  </Link>
                </div>
              )}
            </div>

            {/* Optional CTA (e.g. + New appointment) */}
            {topbarCta}

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 shrink-0 hidden lg:block" />

            {/* Profile */}
            <div className="relative shrink-0" ref={topbarProfileMenuRef}>
              <button
                type="button"
                onClick={() => { setProfileMenuOpen(false); setNotifOpen(false); setTopbarProfileOpen((o) => !o); }}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 lg:pr-3 hover:bg-gray-100 transition-colors"
                aria-label={t('openProfileMenu') || 'Open profile menu'}
                data-analytics={`${sectionId}.topbar.profile`}
              >
                <span className="h-8 w-8 shrink-0 rounded-full bg-purple-600 text-xs font-bold text-white flex items-center justify-center">{initials}</span>
                {displayName && (
                  <span className="hidden lg:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">{displayName}</span>
                )}
              </button>

              {topbarProfileOpen && (
                <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-200 py-2 text-sm text-gray-900 ${z.maximum}`}>
                  {renderedProfileMenu.map((entry) => {
                    if (entry.kind === 'divider') {
                      return <div key={entry.key} className="my-2 border-t border-gray-100" />;
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
                        onClick={() => setTopbarProfileOpen(false)}
                        className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
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
        </header>

        {/* Page content */}
        <div className="flex-1 min-w-0 px-4 md:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
