"use client";
import React, { createContext, useContext } from 'react';
import { HandlePayNowUseCase } from '@/application/handlePayNowUseCase';
import { GenerateRoomCodeUseCase } from '@/application/generateRoomCodeUseCase';
import { GetTopDoctorsByAppointmentsUseCase } from '@/application/getTopDoctorsByAppointmentsUseCase';
import { GetTopDoctorsByRequestsUseCase } from '@/application/getTopDoctorsByRequestsUseCase';
import { LogoutServerUseCase } from '@/application/logoutServerUseCase';
import { LogoutSessionUseCase } from '@/application/logoutSessionUseCase';
import { SubscribePendingNotificationsUseCase } from '@/application/subscribePendingNotificationsUseCase';
import { LoginUseCase } from '@/application/loginUseCase';
import { TestAuthConnectionUseCase } from '@/application/testAuthConnectionUseCase';
import { RegisterUserUseCase } from '@/application/registerUserUseCase';
import { FetchDoctorsUseCase } from '@/application/fetchDoctorsUseCase';
import { GetUserProfileUseCase } from '@/application/getUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@/application/updateUserProfileUseCase';
import { UploadProfilePictureUseCase } from '@/application/uploadProfilePictureUseCase';
import { ResetUserPasswordUseCase } from '@/application/resetUserPasswordUseCase';
import { GetDoctorProfileUseCase } from '@/application/getDoctorProfileUseCase';
import { CheckProfileCompleteUseCase } from '@/application/checkProfileCompleteUseCase';
import { CreateReciepeUseCase } from '@/application/createReciepeUseCase';
import { GetReciepesByDoctorUseCase } from '@/application/getReciepesByDoctorUseCase';
import { GetReciepesByPatientUseCase } from '@/application/getReciepesByPatientUseCase';
import { GetReciepesByPharmacyUseCase } from '@/application/getReciepesByPharmacyUseCase';
import { UpdateReciepeStatusUseCase } from '@/application/updateReciepeStatusUseCase';
import { GetAvailabilityUseCase } from '@/application/getAvailabilityUseCase';
import { GetAvailabilityPresetsUseCase } from '@/application/getAvailabilityPresetsUseCase';
import { SaveAvailabilityUseCase } from '@/application/saveAvailabilityUseCase';
import { GetResolvedSlotsUseCase } from '@/application/getResolvedSlotsUseCase';
import { GetIdTokenUseCase } from '@/application/getIdTokenUseCase';
import { ReauthenticateUseCase } from '@/application/reauthenticateUseCase';
import { SendVerificationEmailUseCase } from '@/application/sendVerificationEmailUseCase';
import { EstablishSessionUseCase } from '@/application/establishSessionUseCase';
import { ReloadUserUseCase } from '@/application/reloadUserUseCase';
import { GetUsersByRoleUseCase } from '@/application/getUsersByRoleUseCase';
import { SyncPaymentUseCase } from '@/application/syncPaymentUseCase';
import { ApplyVerificationCodeUseCase } from '@/application/applyVerificationCodeUseCase';
import { EstablishSessionAllowUnverifiedUseCase } from '@/application/establishSessionAllowUnverifiedUseCase';
import { PrepareCheckoutUseCase } from '@/application/prepareCheckoutUseCase';
import { ClearPaymentProcessingUseCase } from '@/application/clearPaymentProcessingUseCase';
import { ListAppointmentsUseCase } from '@/application/listAppointmentsUseCase';
import { CreateAppointmentUseCase } from '@/application/createAppointmentUseCase';
import { GetAdminDashboardStatsUseCase } from '@/application/getAdminDashboardStatsUseCase';
import { GetSecurityLogsUseCase } from '@/application/getSecurityLogsUseCase';
import { DismissNotificationByIdUseCase } from '@/application/dismissNotificationByIdUseCase';
import { OpenCheckoutUseCase } from '@/application/openCheckoutUseCase';
import { GetClinicsUseCase } from '@/application/getClinicsUseCase';
import { GetClinicBookingsUseCase } from '@/application/getClinicBookingsUseCase';
import { CreateClinicBookingUseCase } from '@/application/createClinicBookingUseCase';
import { UpdateClinicBookingStatusUseCase } from '@/application/updateClinicBookingStatusUseCase';
import { DismissNotificationUseCase } from '@/application/dismissNotificationUseCase';
import { UpdateAppointmentStatusAndNotifyUseCase } from '@/application/updateAppointmentStatusAndNotifyUseCase';
import { GetPharmaciesUseCase } from '@/application/getPharmaciesUseCase';
import {
  authService,
  paymentCheckoutService,
  blogService,
  availabilityService,
  adminUserService,
  adminStatsService,
  appointmentQueryService,
  appointmentBookingService,
  clinicBookingService,
  paymentSyncService,
  userRepo,
  sessionRepo,
  userProfileService,
  doctorProfileService,
  videoSessionService,
  sessionService,
  realtimeAppointmentsService,
  authLoginService,
  registrationService,
  doctorSearchService,
  analyticsService,
  reciepeService,
  appointmentPaymentService,
  securityLogsService,
  notificationService,
  appointmentService,
  clinicRepository,
  clinicBookingRepository,
  pharmacyService,
  appointmentNotificationService,
} from './di.services';

interface DIContextValue {
  authService: typeof authService;
  paymentCheckoutService: typeof paymentCheckoutService;
  blogService: typeof blogService;
  availabilityService: typeof availabilityService;
  adminUserService: typeof adminUserService;
  adminStatsService: typeof adminStatsService;
  appointmentQueryService: typeof appointmentQueryService;
  appointmentBookingService: typeof appointmentBookingService;
  clinicBookingService: typeof clinicBookingService;
  paymentSyncService: typeof paymentSyncService;
  handlePayNowUseCase: HandlePayNowUseCase;
  generateRoomCodeUseCase: GenerateRoomCodeUseCase;
  getTopDoctorsByAppointmentsUseCase: GetTopDoctorsByAppointmentsUseCase;
  getTopDoctorsByRequestsUseCase: GetTopDoctorsByRequestsUseCase;
  logoutServerUseCase: LogoutServerUseCase;
  logoutSessionUseCase: LogoutSessionUseCase;
  subscribePendingNotificationsUseCase: SubscribePendingNotificationsUseCase;
  loginUseCase: LoginUseCase;
  testAuthConnectionUseCase: TestAuthConnectionUseCase;
  registerUserUseCase: RegisterUserUseCase;
  fetchDoctorsUseCase: FetchDoctorsUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;
  updateUserProfileUseCase: UpdateUserProfileUseCase;
  uploadProfilePictureUseCase: UploadProfilePictureUseCase;
  resetUserPasswordUseCase: ResetUserPasswordUseCase;
  getDoctorProfileUseCase: GetDoctorProfileUseCase;
  checkProfileCompleteUseCase: CheckProfileCompleteUseCase;
  createReciepeUseCase: CreateReciepeUseCase;
  getReciepesByDoctorUseCase: GetReciepesByDoctorUseCase;
  getReciepesByPatientUseCase: GetReciepesByPatientUseCase;
  getReciepesByPharmacyUseCase: GetReciepesByPharmacyUseCase;
  updateReciepeStatusUseCase: UpdateReciepeStatusUseCase;
  getAvailabilityUseCase: GetAvailabilityUseCase;
  getAvailabilityPresetsUseCase: GetAvailabilityPresetsUseCase;
  saveAvailabilityUseCase: SaveAvailabilityUseCase;
  getResolvedSlotsUseCase: GetResolvedSlotsUseCase;
  getIdTokenUseCase: GetIdTokenUseCase;
  reauthenticateUseCase: ReauthenticateUseCase;
  sendVerificationEmailUseCase: SendVerificationEmailUseCase;
  establishSessionUseCase: EstablishSessionUseCase;
  reloadUserUseCase: ReloadUserUseCase;
  getUsersByRoleUseCase: GetUsersByRoleUseCase;
  syncPaymentUseCase: SyncPaymentUseCase;
  applyVerificationCodeUseCase: ApplyVerificationCodeUseCase;
  establishSessionAllowUnverifiedUseCase: EstablishSessionAllowUnverifiedUseCase;
  prepareCheckoutUseCase: PrepareCheckoutUseCase;
  clearPaymentProcessingUseCase: ClearPaymentProcessingUseCase;
  listAppointmentsUseCase: ListAppointmentsUseCase;
  createAppointmentUseCase: CreateAppointmentUseCase;
  getAdminDashboardStatsUseCase: GetAdminDashboardStatsUseCase;
  getSecurityLogsUseCase: GetSecurityLogsUseCase;
  dismissNotificationByIdUseCase: DismissNotificationByIdUseCase;
  openCheckoutUseCase: OpenCheckoutUseCase;
  getClinicsUseCase: GetClinicsUseCase;
  getClinicBookingsUseCase: GetClinicBookingsUseCase;
  createClinicBookingUseCase: CreateClinicBookingUseCase;
  updateClinicBookingStatusUseCase: UpdateClinicBookingStatusUseCase;
  dismissNotificationUseCase: DismissNotificationUseCase;
  updateAppointmentStatusAndNotifyUseCase: UpdateAppointmentStatusAndNotifyUseCase;
  getPharmaciesUseCase: GetPharmaciesUseCase;
}

const DIContext = createContext<DIContextValue | undefined>(undefined);

export const DIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handlePayNowUseCase = new HandlePayNowUseCase(appointmentPaymentService, paymentCheckoutService);
  const generateRoomCodeUseCase = new GenerateRoomCodeUseCase(videoSessionService, analyticsService);
  const getTopDoctorsByAppointmentsUseCase = new GetTopDoctorsByAppointmentsUseCase(adminStatsService);
  const getTopDoctorsByRequestsUseCase = new GetTopDoctorsByRequestsUseCase(adminStatsService);
  const logoutServerUseCase = new LogoutServerUseCase(sessionService);
  const logoutSessionUseCase = new LogoutSessionUseCase(sessionRepo);
  const subscribePendingNotificationsUseCase = new SubscribePendingNotificationsUseCase(realtimeAppointmentsService);
  const loginUseCase = new LoginUseCase(authLoginService, analyticsService);
  const testAuthConnectionUseCase = new TestAuthConnectionUseCase(authLoginService);
  const registerUserUseCase = new RegisterUserUseCase(registrationService, analyticsService);
  const fetchDoctorsUseCase = new FetchDoctorsUseCase(doctorSearchService);
  const getUserProfileUseCase = new GetUserProfileUseCase(userProfileService);
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(userProfileService, authService);
  const uploadProfilePictureUseCase = new UploadProfilePictureUseCase(userProfileService);
  const resetUserPasswordUseCase = new ResetUserPasswordUseCase(authService);
  const getDoctorProfileUseCase = new GetDoctorProfileUseCase(doctorProfileService);
  const checkProfileCompleteUseCase = new CheckProfileCompleteUseCase(userRepo);
  const createReciepeUseCase = new CreateReciepeUseCase(reciepeService, analyticsService);
  const getReciepesByDoctorUseCase = new GetReciepesByDoctorUseCase(reciepeService);
  const getReciepesByPatientUseCase = new GetReciepesByPatientUseCase(reciepeService);
  const getReciepesByPharmacyUseCase = new GetReciepesByPharmacyUseCase(reciepeService);
  const updateReciepeStatusUseCase = new UpdateReciepeStatusUseCase(reciepeService);
  const getAvailabilityUseCase = new GetAvailabilityUseCase(availabilityService);
  const getAvailabilityPresetsUseCase = new GetAvailabilityPresetsUseCase(availabilityService);
  const saveAvailabilityUseCase = new SaveAvailabilityUseCase(availabilityService);
  const getResolvedSlotsUseCase = new GetResolvedSlotsUseCase(availabilityService);
  const getIdTokenUseCase = new GetIdTokenUseCase(authService);
  const reauthenticateUseCase = new ReauthenticateUseCase(authService);
  const sendVerificationEmailUseCase = new SendVerificationEmailUseCase(authService);
  const establishSessionUseCase = new EstablishSessionUseCase(authService);
  const reloadUserUseCase = new ReloadUserUseCase(authService);
  const getUsersByRoleUseCase = new GetUsersByRoleUseCase(adminUserService);
  const syncPaymentUseCase = new SyncPaymentUseCase(appointmentPaymentService);
  const applyVerificationCodeUseCase = new ApplyVerificationCodeUseCase(authService);
  const establishSessionAllowUnverifiedUseCase = new EstablishSessionAllowUnverifiedUseCase(authService);
  const prepareCheckoutUseCase = new PrepareCheckoutUseCase(paymentCheckoutService);
  const clearPaymentProcessingUseCase = new ClearPaymentProcessingUseCase(appointmentPaymentService);
  const listAppointmentsUseCase = new ListAppointmentsUseCase(appointmentService);
  const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentService);
  const getAdminDashboardStatsUseCase = new GetAdminDashboardStatsUseCase(adminStatsService);
  const getSecurityLogsUseCase = new GetSecurityLogsUseCase(securityLogsService);
  const dismissNotificationByIdUseCase = new DismissNotificationByIdUseCase(notificationService);
  const openCheckoutUseCase = new OpenCheckoutUseCase(paymentCheckoutService);
  const getClinicsUseCase = new GetClinicsUseCase(clinicRepository);
  const getClinicBookingsUseCase = new GetClinicBookingsUseCase(clinicBookingRepository);
  const createClinicBookingUseCase = new CreateClinicBookingUseCase(clinicBookingRepository);
  const updateClinicBookingStatusUseCase = new UpdateClinicBookingStatusUseCase(clinicBookingRepository);
  const dismissNotificationUseCase = new DismissNotificationUseCase(notificationService);
  const updateAppointmentStatusAndNotifyUseCase = new UpdateAppointmentStatusAndNotifyUseCase(appointmentNotificationService);
  const getPharmaciesUseCase = new GetPharmaciesUseCase(pharmacyService);

  return (
    <DIContext.Provider
      value={{
        authService,
        paymentCheckoutService,
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
        getUserProfileUseCase,
        updateUserProfileUseCase,
        uploadProfilePictureUseCase,
        resetUserPasswordUseCase,
        getDoctorProfileUseCase,
        logoutSessionUseCase,
        subscribePendingNotificationsUseCase,
        loginUseCase,
        testAuthConnectionUseCase,
        registerUserUseCase,
        fetchDoctorsUseCase,
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
        syncPaymentUseCase,
        applyVerificationCodeUseCase,
        establishSessionAllowUnverifiedUseCase,
        prepareCheckoutUseCase,
        clearPaymentProcessingUseCase,
        listAppointmentsUseCase,
        createAppointmentUseCase,
        getAdminDashboardStatsUseCase,
        getSecurityLogsUseCase,
        dismissNotificationByIdUseCase,
        openCheckoutUseCase,
        getClinicsUseCase,
        getClinicBookingsUseCase,
        createClinicBookingUseCase,
        updateClinicBookingStatusUseCase,
        dismissNotificationUseCase,
        updateAppointmentStatusAndNotifyUseCase,
        getPharmaciesUseCase,
      }}
    >
      {children}
    </DIContext.Provider>
  );
};

export function useDI() {
  const context = useContext(DIContext);
  if (!context) throw new Error('useDI must be used within a DIProvider');
  return context;
}
