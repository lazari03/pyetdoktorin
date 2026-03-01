"use client";

// Centralized navigation coordinator for the app.
// Provides typed, reusable route helpers and encapsulates router.push/replace.
// Future extensions: analytics, auth guards, prefetching, role-based gating.

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';

// Stable route keys to avoid scattering raw strings.
export enum AppRouteKey {
  Dashboard = 'dashboard',
  Appointments = 'appointments',
  AppointmentHistory = 'appointmentHistory',
  NewAppointment = 'newAppointment',
  Profile = 'profile',
  DoctorProfile = 'doctorProfile', // dynamic doctor/:id
  DoctorCalendar = 'doctorCalendar',
  ChatRoom = 'chatRoom', // chat-room/:id
  Login = 'login',
  Register = 'register',
  Notifications = 'notifications',
  Individuals = 'individuals',
  DoctorsLanding = 'doctorsLanding',
  Clinicians = 'clinicians',
  Admin = 'admin',
  Pharmacy = 'pharmacy',
  Clinic = 'clinic',
}

// Base path builders; dynamic segments handled via functions.
const routePaths: Record<
  Exclude<
    AppRouteKey,
    | AppRouteKey.DoctorProfile
    | AppRouteKey.ChatRoom
  >,
  string
> = {
  [AppRouteKey.Dashboard]: ROUTES.DASHBOARD,
  [AppRouteKey.Appointments]: `${ROUTES.DASHBOARD}/appointments`,
  [AppRouteKey.AppointmentHistory]: `${ROUTES.DASHBOARD}/appointments`, // same path different semantic
  [AppRouteKey.NewAppointment]: `${ROUTES.DASHBOARD}/new-appointment`,
  [AppRouteKey.Profile]: `${ROUTES.DASHBOARD}/myprofile`,
  [AppRouteKey.DoctorCalendar]: `${ROUTES.DASHBOARD}/doctor/calendar`,
  [AppRouteKey.Login]: '/login',
  [AppRouteKey.Register]: '/register',
  [AppRouteKey.Notifications]: `${ROUTES.DASHBOARD}/notifications`,
  [AppRouteKey.Individuals]: ROUTES.INDIVIDUALS,
  [AppRouteKey.DoctorsLanding]: ROUTES.DOCTORS,
  [AppRouteKey.Clinicians]: ROUTES.CLINICIANS,
  [AppRouteKey.Admin]: ROUTES.ADMIN,
  [AppRouteKey.Pharmacy]: ROUTES.PHARMACY,
  [AppRouteKey.Clinic]: ROUTES.CLINIC,
};

// Dynamic path helpers kept together for discoverability.
export function doctorProfilePath(doctorId: string) {
  return `${ROUTES.DASHBOARD}/doctor/${doctorId}`;
}

function chatRoomPath(requestId: string) {
  return `${ROUTES.DASHBOARD}/chat-room/${requestId}`;
}

function getPath(key: AppRouteKey): string {
  switch (key) {
    case AppRouteKey.DoctorProfile:
      throw new Error('Use toDoctorProfile(doctorId) for dynamic doctor profile route');
    case AppRouteKey.ChatRoom:
      throw new Error('Use toChatRoom(requestId) for dynamic chat room route');
    default:
      return routePaths[key as keyof typeof routePaths];
  }
}

export interface NavigationCoordinator {
  push: (key: AppRouteKey) => void;
  replace: (key: AppRouteKey) => void;
  pushPath: (path: string) => void;
  replacePath: (path: string) => void;
  toDashboard: () => void;
  toAppointments: () => void;
  toNewAppointment: () => void;
  toProfile: () => void;
  toDoctorProfile: (doctorId: string) => void;
  toDoctorCalendar: () => void;
  toChatRoom: (requestId: string) => void;
  toLogin: (from?: string) => void;
  toRegister: () => void;
  toNotifications: () => void;
  toIndividuals: () => void;
  toDoctorsLanding: () => void;
  toClinicians: () => void;
  toAdmin: () => void;
  toPharmacy: () => void;
  toClinic: () => void;
  prefetch: (key: AppRouteKey) => void;
}

export function useNavigationCoordinator(): NavigationCoordinator {
  const router = useRouter();

  return {
    push: (key) => router.push(getPath(key)),
    replace: (key) => router.replace(getPath(key)),
    pushPath: (path) => router.push(path),
    replacePath: (path) => router.replace(path),
    toDashboard: () => router.push(routePaths[AppRouteKey.Dashboard]),
    toAppointments: () => router.push(routePaths[AppRouteKey.Appointments]),
    toNewAppointment: () => router.push(routePaths[AppRouteKey.NewAppointment]),
    toProfile: () => router.push(routePaths[AppRouteKey.Profile]),
    toDoctorProfile: (doctorId) => router.push(doctorProfilePath(doctorId)),
    toDoctorCalendar: () => router.push(routePaths[AppRouteKey.DoctorCalendar]),
    toChatRoom: (requestId) => router.push(chatRoomPath(requestId)),
    toLogin: (from) => {
      const base = routePaths[AppRouteKey.Login];
      const url = from ? `${base}?from=${encodeURIComponent(from)}` : base;
      router.replace(url); // usually we don't want back nav to protected page
    },
    toRegister: () => router.push(routePaths[AppRouteKey.Register]),
    toNotifications: () => router.push(routePaths[AppRouteKey.Notifications]),
    toIndividuals: () => router.push(routePaths[AppRouteKey.Individuals]),
    toDoctorsLanding: () => router.push(routePaths[AppRouteKey.DoctorsLanding]),
    toClinicians: () => router.push(routePaths[AppRouteKey.Clinicians]),
    toAdmin: () => router.push(routePaths[AppRouteKey.Admin]),
    toPharmacy: () => router.push(routePaths[AppRouteKey.Pharmacy]),
    toClinic: () => router.push(routePaths[AppRouteKey.Clinic]),
    prefetch: (key) => {
      try {
        const path = getPath(key);
        router.prefetch(path);
      } catch {
        // ignore dynamic route errors
      }
    },
  };
}

// Optional standalone helpers for non-hook usage (e.g., in services after dependency injection).
// They require a router instance passed in for testability.
export function createNavigationCoordinator(router: ReturnType<typeof useRouter>): NavigationCoordinator {
  // Delegate to hook logic by reusing internal functions.
  return {
  push: (key) => router.push(getPath(key)),
  replace: (key) => router.replace(getPath(key)),
    pushPath: (path) => router.push(path),
    replacePath: (path) => router.replace(path),
    toDashboard: () => router.push(routePaths[AppRouteKey.Dashboard]),
    toAppointments: () => router.push(routePaths[AppRouteKey.Appointments]),
    toNewAppointment: () => router.push(routePaths[AppRouteKey.NewAppointment]),
    toProfile: () => router.push(routePaths[AppRouteKey.Profile]),
    toDoctorProfile: (doctorId) => router.push(doctorProfilePath(doctorId)),
    toDoctorCalendar: () => router.push(routePaths[AppRouteKey.DoctorCalendar]),
    toChatRoom: (requestId) => router.push(chatRoomPath(requestId)),
    toLogin: (from) => {
      const base = routePaths[AppRouteKey.Login];
      const url = from ? `${base}?from=${encodeURIComponent(from)}` : base;
      router.replace(url);
    },
    toRegister: () => router.push(routePaths[AppRouteKey.Register]),
    toNotifications: () => router.push(routePaths[AppRouteKey.Notifications]),
    toIndividuals: () => router.push(routePaths[AppRouteKey.Individuals]),
    toDoctorsLanding: () => router.push(routePaths[AppRouteKey.DoctorsLanding]),
    toClinicians: () => router.push(routePaths[AppRouteKey.Clinicians]),
    toAdmin: () => router.push(routePaths[AppRouteKey.Admin]),
    toPharmacy: () => router.push(routePaths[AppRouteKey.Pharmacy]),
    toClinic: () => router.push(routePaths[AppRouteKey.Clinic]),
    prefetch: (key) => {
      try { router.prefetch(getPath(key)); } catch {}
    },
  };
}

// Future TODOs:
// - Inject analytics events on navigation.
// - Central auth guard wrappers (e.g., ensure role before navigating).
// - Support state passing for ephemeral data instead of query params.
