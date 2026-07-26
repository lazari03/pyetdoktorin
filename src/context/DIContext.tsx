"use client";
import React, { createContext, useContext } from 'react';
import {
  authService,
  blogService,
  availabilityService,
  adminUserService,
  adminStatsService,
  appointmentQueryService,
  appointmentBookingService,
  clinicBookingService,
  paymentSyncService,
  handlePayNowUseCase,
  generateRoomCodeUseCase,
  getTopDoctorsByAppointmentsUseCase,
  getTopDoctorsByRequestsUseCase,
  logoutServerUseCase,
  logoutSessionUseCase,
  subscribePendingNotificationsUseCase,
  loginUseCase,
  testAuthConnectionUseCase,
  registerUserUseCase,
  fetchDoctorsUseCase,
  getSpecializationsUseCase,
  listUserNotificationsUseCase,
  markUserNotificationReadUseCase,
  markAllUserNotificationsReadUseCase,
  requestUserNotificationsExportUseCase,
  getUserProfileUseCase,
  updateUserProfileUseCase,
  uploadProfilePictureUseCase,
  resetUserPasswordUseCase,
  getDoctorProfileUseCase,
  checkProfileCompleteUseCase,
  createReciepeUseCase,
  getReciepesByDoctorUseCase,
  getReciepesByPatientUseCase,
  getReciepesByPharmacyUseCase,
  updateReciepeStatusUseCase,
  getAvailabilityUseCase,
  getAvailabilityPresetsUseCase,
  saveAvailabilityUseCase,
  getResolvedSlotsUseCase,
  getIdTokenUseCase,
  reauthenticateUseCase,
  sendVerificationEmailUseCase,
  establishSessionUseCase,
  reloadUserUseCase,
  getUsersByRoleUseCase,
  applyVerificationCodeUseCase,
  establishSessionAllowUnverifiedUseCase,
  clearPaymentProcessingUseCase,
  listAppointmentsUseCase,
  createAppointmentUseCase,
  quickMatchDoctorUseCase,
  getAdminDashboardStatsUseCase,
  getSecurityLogsUseCase,
  dismissNotificationByIdUseCase,
  getClinicsUseCase,
  getClinicBookingsUseCase,
  createClinicBookingUseCase,
  updateClinicBookingStatusUseCase,
  dismissNotificationUseCase,
  updateAppointmentStatusAndNotifyUseCase,
  getPharmaciesUseCase,
  getQuickAppointmentMatchesUseCase,
  broadcastNotificationUseCase,
  getVapidPublicKeyUseCase,
  subscribePushUseCase,
  unsubscribePushUseCase,
  listReadMarksUseCase,
  markReadMarkUseCase,
  markManyReadMarksUseCase,
  getDoctorTermsUseCase,
  getMyDoctorAgreementUseCase,
  submitDoctorAgreementUseCase,
  listDoctorAgreementsUseCase,
  downloadDoctorAgreementPdfUseCase,
  getPlatformTermsUseCase,
  createSupportTicketUseCase,
  listMySupportTicketsUseCase,
  listSupportTicketsUseCase,
  updateSupportTicketUseCase,
  validateRegistrationEmailUseCase,
  listFamilyMembersUseCase,
  listFamilyInvitesUseCase,
  addFamilyMemberUseCase,
  respondToFamilyInviteUseCase,
  removeFamilyMemberUseCase,
} from './di.services';

interface DIContextValue {
  authService: typeof authService;
  blogService: typeof blogService;
  availabilityService: typeof availabilityService;
  adminUserService: typeof adminUserService;
  adminStatsService: typeof adminStatsService;
  appointmentQueryService: typeof appointmentQueryService;
  appointmentBookingService: typeof appointmentBookingService;
  clinicBookingService: typeof clinicBookingService;
  paymentSyncService: typeof paymentSyncService;
  handlePayNowUseCase: typeof handlePayNowUseCase;
  generateRoomCodeUseCase: typeof generateRoomCodeUseCase;
  getTopDoctorsByAppointmentsUseCase: typeof getTopDoctorsByAppointmentsUseCase;
  getTopDoctorsByRequestsUseCase: typeof getTopDoctorsByRequestsUseCase;
  logoutServerUseCase: typeof logoutServerUseCase;
  logoutSessionUseCase: typeof logoutSessionUseCase;
  subscribePendingNotificationsUseCase: typeof subscribePendingNotificationsUseCase;
  loginUseCase: typeof loginUseCase;
  testAuthConnectionUseCase: typeof testAuthConnectionUseCase;
  registerUserUseCase: typeof registerUserUseCase;
  fetchDoctorsUseCase: typeof fetchDoctorsUseCase;
  getSpecializationsUseCase: typeof getSpecializationsUseCase;
  listUserNotificationsUseCase: typeof listUserNotificationsUseCase;
  markUserNotificationReadUseCase: typeof markUserNotificationReadUseCase;
  markAllUserNotificationsReadUseCase: typeof markAllUserNotificationsReadUseCase;
  requestUserNotificationsExportUseCase: typeof requestUserNotificationsExportUseCase;
  getUserProfileUseCase: typeof getUserProfileUseCase;
  updateUserProfileUseCase: typeof updateUserProfileUseCase;
  uploadProfilePictureUseCase: typeof uploadProfilePictureUseCase;
  resetUserPasswordUseCase: typeof resetUserPasswordUseCase;
  getDoctorProfileUseCase: typeof getDoctorProfileUseCase;
  checkProfileCompleteUseCase: typeof checkProfileCompleteUseCase;
  createReciepeUseCase: typeof createReciepeUseCase;
  getReciepesByDoctorUseCase: typeof getReciepesByDoctorUseCase;
  getReciepesByPatientUseCase: typeof getReciepesByPatientUseCase;
  getReciepesByPharmacyUseCase: typeof getReciepesByPharmacyUseCase;
  updateReciepeStatusUseCase: typeof updateReciepeStatusUseCase;
  getAvailabilityUseCase: typeof getAvailabilityUseCase;
  getAvailabilityPresetsUseCase: typeof getAvailabilityPresetsUseCase;
  saveAvailabilityUseCase: typeof saveAvailabilityUseCase;
  getResolvedSlotsUseCase: typeof getResolvedSlotsUseCase;
  getIdTokenUseCase: typeof getIdTokenUseCase;
  reauthenticateUseCase: typeof reauthenticateUseCase;
  sendVerificationEmailUseCase: typeof sendVerificationEmailUseCase;
  establishSessionUseCase: typeof establishSessionUseCase;
  reloadUserUseCase: typeof reloadUserUseCase;
  getUsersByRoleUseCase: typeof getUsersByRoleUseCase;
  applyVerificationCodeUseCase: typeof applyVerificationCodeUseCase;
  establishSessionAllowUnverifiedUseCase: typeof establishSessionAllowUnverifiedUseCase;
  clearPaymentProcessingUseCase: typeof clearPaymentProcessingUseCase;
  listAppointmentsUseCase: typeof listAppointmentsUseCase;
  createAppointmentUseCase: typeof createAppointmentUseCase;
  quickMatchDoctorUseCase: typeof quickMatchDoctorUseCase;
  getAdminDashboardStatsUseCase: typeof getAdminDashboardStatsUseCase;
  getSecurityLogsUseCase: typeof getSecurityLogsUseCase;
  dismissNotificationByIdUseCase: typeof dismissNotificationByIdUseCase;
  getClinicsUseCase: typeof getClinicsUseCase;
  getClinicBookingsUseCase: typeof getClinicBookingsUseCase;
  createClinicBookingUseCase: typeof createClinicBookingUseCase;
  updateClinicBookingStatusUseCase: typeof updateClinicBookingStatusUseCase;
  dismissNotificationUseCase: typeof dismissNotificationUseCase;
  updateAppointmentStatusAndNotifyUseCase: typeof updateAppointmentStatusAndNotifyUseCase;
  getPharmaciesUseCase: typeof getPharmaciesUseCase;
  getQuickAppointmentMatchesUseCase: typeof getQuickAppointmentMatchesUseCase;
  broadcastNotificationUseCase: typeof broadcastNotificationUseCase;
  getVapidPublicKeyUseCase: typeof getVapidPublicKeyUseCase;
  subscribePushUseCase: typeof subscribePushUseCase;
  unsubscribePushUseCase: typeof unsubscribePushUseCase;
  listReadMarksUseCase: typeof listReadMarksUseCase;
  markReadMarkUseCase: typeof markReadMarkUseCase;
  markManyReadMarksUseCase: typeof markManyReadMarksUseCase;
  getDoctorTermsUseCase: typeof getDoctorTermsUseCase;
  getMyDoctorAgreementUseCase: typeof getMyDoctorAgreementUseCase;
  submitDoctorAgreementUseCase: typeof submitDoctorAgreementUseCase;
  listDoctorAgreementsUseCase: typeof listDoctorAgreementsUseCase;
  downloadDoctorAgreementPdfUseCase: typeof downloadDoctorAgreementPdfUseCase;
  getPlatformTermsUseCase: typeof getPlatformTermsUseCase;
  createSupportTicketUseCase: typeof createSupportTicketUseCase;
  listMySupportTicketsUseCase: typeof listMySupportTicketsUseCase;
  listSupportTicketsUseCase: typeof listSupportTicketsUseCase;
  updateSupportTicketUseCase: typeof updateSupportTicketUseCase;
  validateRegistrationEmailUseCase: typeof validateRegistrationEmailUseCase;
  listFamilyMembersUseCase: typeof listFamilyMembersUseCase;
  listFamilyInvitesUseCase: typeof listFamilyInvitesUseCase;
  addFamilyMemberUseCase: typeof addFamilyMemberUseCase;
  respondToFamilyInviteUseCase: typeof respondToFamilyInviteUseCase;
  removeFamilyMemberUseCase: typeof removeFamilyMemberUseCase;
}

// All use cases are module-level singletons (see di.services.ts) so this
// object is built once, not per-render — DIProvider is a pure pass-through.
const diContextValue: DIContextValue = {
  authService,
  blogService,
  availabilityService,
  adminUserService,
  adminStatsService,
  appointmentQueryService,
  appointmentBookingService,
  clinicBookingService,
  paymentSyncService,
  handlePayNowUseCase,
  generateRoomCodeUseCase,
  getTopDoctorsByAppointmentsUseCase,
  getTopDoctorsByRequestsUseCase,
  logoutServerUseCase,
  logoutSessionUseCase,
  subscribePendingNotificationsUseCase,
  loginUseCase,
  testAuthConnectionUseCase,
  registerUserUseCase,
  fetchDoctorsUseCase,
  getSpecializationsUseCase,
  listUserNotificationsUseCase,
  markUserNotificationReadUseCase,
  markAllUserNotificationsReadUseCase,
  requestUserNotificationsExportUseCase,
  getUserProfileUseCase,
  updateUserProfileUseCase,
  uploadProfilePictureUseCase,
  resetUserPasswordUseCase,
  getDoctorProfileUseCase,
  checkProfileCompleteUseCase,
  createReciepeUseCase,
  getReciepesByDoctorUseCase,
  getReciepesByPatientUseCase,
  getReciepesByPharmacyUseCase,
  updateReciepeStatusUseCase,
  getAvailabilityUseCase,
  getAvailabilityPresetsUseCase,
  saveAvailabilityUseCase,
  getResolvedSlotsUseCase,
  getIdTokenUseCase,
  reauthenticateUseCase,
  sendVerificationEmailUseCase,
  establishSessionUseCase,
  reloadUserUseCase,
  getUsersByRoleUseCase,
  applyVerificationCodeUseCase,
  establishSessionAllowUnverifiedUseCase,
  clearPaymentProcessingUseCase,
  listAppointmentsUseCase,
  createAppointmentUseCase,
  quickMatchDoctorUseCase,
  getAdminDashboardStatsUseCase,
  getSecurityLogsUseCase,
  dismissNotificationByIdUseCase,
  getClinicsUseCase,
  getClinicBookingsUseCase,
  createClinicBookingUseCase,
  updateClinicBookingStatusUseCase,
  dismissNotificationUseCase,
  updateAppointmentStatusAndNotifyUseCase,
  getPharmaciesUseCase,
  getQuickAppointmentMatchesUseCase,
  broadcastNotificationUseCase,
  getVapidPublicKeyUseCase,
  subscribePushUseCase,
  unsubscribePushUseCase,
  listReadMarksUseCase,
  markReadMarkUseCase,
  markManyReadMarksUseCase,
  getDoctorTermsUseCase,
  getMyDoctorAgreementUseCase,
  submitDoctorAgreementUseCase,
  listDoctorAgreementsUseCase,
  downloadDoctorAgreementPdfUseCase,
  getPlatformTermsUseCase,
  createSupportTicketUseCase,
  listMySupportTicketsUseCase,
  listSupportTicketsUseCase,
  updateSupportTicketUseCase,
  validateRegistrationEmailUseCase,
  listFamilyMembersUseCase,
  listFamilyInvitesUseCase,
  addFamilyMemberUseCase,
  respondToFamilyInviteUseCase,
  removeFamilyMemberUseCase,
};

const DIContext = createContext<DIContextValue | undefined>(undefined);

export const DIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DIContext.Provider value={diContextValue}>{children}</DIContext.Provider>
);

export function useDI() {
  const context = useContext(DIContext);
  if (!context) throw new Error('useDI must be used within a DIProvider');
  return context;
}
