"use client";
import React, { createContext, useContext } from 'react';
import { FetchAppointmentsUseCase } from '@/application/fetchAppointmentsUseCase';
import { CreateAppointmentUseCase } from '@/application/createAppointmentUseCase';
import { CheckAppointmentExistsUseCase } from '@/application/checkAppointmentExistsUseCase';
import { GetAppointmentsUseCase } from '@/application/getAppointmentsUseCase';
import { SetAppointmentPaidUseCase } from '@/application/setAppointmentPaidUseCase';
import { HandlePayNowUseCase } from '@/application/handlePayNowUseCase';
import { CheckIfPastAppointmentUseCase } from '@/application/checkIfPastAppointmentUseCase';
import { GetUserRoleUseCase } from '@/application/getUserRoleUseCase';
import { UpdateAppointmentUseCase } from '@/application/updateAppointmentUseCase';
import { GenerateRoomCodeUseCase } from '@/application/generateRoomCodeUseCase';
import { GetNotificationUserRoleUseCase } from '@/application/getNotificationUserRoleUseCase';
import { FetchAppointmentDetailsUseCase } from '@/application/fetchAppointmentDetailsUseCase';
import { DismissNotificationUseCase } from '@/application/dismissNotificationUseCase';
import { UpdateAppointmentStatusAndNotifyUseCase } from '@/application/updateAppointmentStatusAndNotifyUseCase';
import { GetTopDoctorsByAppointmentsUseCase } from '@/application/getTopDoctorsByAppointmentsUseCase';
import { GetTopDoctorsByRequestsUseCase } from '@/application/getTopDoctorsByRequestsUseCase';
import { LogoutServerUseCase } from '@/application/logoutServerUseCase';
import { LogoutSessionUseCase } from '@/application/logoutSessionUseCase';
import { SubscribePendingAppointmentsUseCase } from '@/application/subscribePendingAppointmentsUseCase';
import { SubscribePendingNotificationsUseCase } from '@/application/subscribePendingNotificationsUseCase';
import { CapturePaywallPaymentUseCase } from '@/application/capturePaywallPaymentUseCase';
import { LoginUseCase } from '@/application/loginUseCase';
import { TestAuthConnectionUseCase } from '@/application/testAuthConnectionUseCase';
import { RegisterUserUseCase } from '@/application/registerUserUseCase';
import { FetchDoctorsUseCase } from '@/application/fetchDoctorsUseCase';
import { GetUserProfileUseCase } from '@/application/getUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@/application/updateUserProfileUseCase';
import { UploadProfilePictureUseCase } from '@/application/uploadProfilePictureUseCase';
import { ResetUserPasswordUseCase } from '@/application/resetUserPasswordUseCase';
import { FetchUserDetailsUseCase } from '@/application/fetchUserDetailsUseCase';
import { ObserveAuthStateUseCase } from '@/application/observeAuthStateUseCase';
import { GetDoctorProfileUseCase } from '@/application/getDoctorProfileUseCase';
import { CheckProfileCompleteUseCase } from '@/application/checkProfileCompleteUseCase';
import { GetAllUsersUseCase } from '@/application/getAllUsersUseCase';
import { GetUsersPageUseCase } from '@/application/getUsersPageUseCase';
import { GetAdminUserByIdUseCase } from '@/application/getAdminUserByIdUseCase';
import { GetAdminDoctorProfileUseCase } from '@/application/getAdminDoctorProfileUseCase';
import { ResetAdminUserPasswordUseCase } from '@/application/resetAdminUserPasswordUseCase';
import { DeleteUserAccountUseCase } from '@/application/deleteUserAccountUseCase';
import { CreateAdminUserUseCase } from '@/application/createAdminUserUseCase';
import { UpdateAdminUserUseCase } from '@/application/updateAdminUserUseCase';
import { UpdateAdminDoctorProfileUseCase } from '@/application/updateAdminDoctorProfileUseCase';
import { ApproveDoctorUseCase } from '@/application/approveDoctorUseCase';
import { GetPharmaciesUseCase } from '@/application/getPharmaciesUseCase';
import { CreateReciepeUseCase } from '@/application/createReciepeUseCase';
import { GetReciepesByDoctorUseCase } from '@/application/getReciepesByDoctorUseCase';
import { GetReciepesByPatientUseCase } from '@/application/getReciepesByPatientUseCase';
import { GetReciepesByPharmacyUseCase } from '@/application/getReciepesByPharmacyUseCase';
import { UpdateReciepeStatusUseCase } from '@/application/updateReciepeStatusUseCase';
import { FirebaseAppointmentRepository } from '@/infrastructure/repositories/FirebaseAppointmentRepository';
import { FirebaseUserRepository } from '@/infrastructure/repositories/FirebaseUserRepository';
import { FirebaseSessionRepository } from '@/infrastructure/repositories/FirebaseSessionRepository';
import { AuthServiceAdapter } from '@/infrastructure/services/authServiceAdapter';
import { UserProfileService } from '@/infrastructure/services/userProfileService';
import { DoctorProfileService } from '@/infrastructure/services/doctorProfileService';
import { AppointmentServiceAdapter } from '@/infrastructure/services/appointmentServiceAdapter';
import { VideoSessionService } from '@/infrastructure/services/videoSessionService';
import { PayPalGateway } from '@/infrastructure/services/paypalGateway';
import { NotificationServiceAdapter } from '@/infrastructure/services/notificationServiceAdapter';
import { AppointmentNotificationServiceAdapter } from '@/infrastructure/services/appointmentNotificationServiceAdapter';
import { AdminStatsServiceAdapter } from '@/infrastructure/services/adminStatsServiceAdapter';
import { SessionService } from '@/infrastructure/services/sessionService';
import { RealtimeAppointmentsService } from '@/infrastructure/services/realtimeAppointmentsService';
import { AuthLoginService } from '@/infrastructure/services/authLoginService';
import { RegistrationService } from '@/infrastructure/services/registrationService';
import { DoctorSearchService } from '@/infrastructure/services/doctorSearchService';
import { AdminUserService } from '@/infrastructure/services/adminUserService';
import { PharmacyService } from '@/infrastructure/services/pharmacyService';
import { ReciepeService } from '@/infrastructure/services/reciepeService';

interface DIContextValue {
  fetchAppointmentsUseCase: FetchAppointmentsUseCase;
  getAppointmentsUseCase: GetAppointmentsUseCase;
  setAppointmentPaidUseCase: SetAppointmentPaidUseCase;
  handlePayNowUseCase: HandlePayNowUseCase;
  checkIfPastAppointmentUseCase: CheckIfPastAppointmentUseCase;
  getUserRoleUseCase: GetUserRoleUseCase;
  updateAppointmentUseCase: UpdateAppointmentUseCase;
  generateRoomCodeUseCase: GenerateRoomCodeUseCase;
  getNotificationUserRoleUseCase: GetNotificationUserRoleUseCase;
  fetchAppointmentDetailsUseCase: FetchAppointmentDetailsUseCase;
  dismissNotificationUseCase: DismissNotificationUseCase;
  updateAppointmentStatusAndNotifyUseCase: UpdateAppointmentStatusAndNotifyUseCase;
  getTopDoctorsByAppointmentsUseCase: GetTopDoctorsByAppointmentsUseCase;
  getTopDoctorsByRequestsUseCase: GetTopDoctorsByRequestsUseCase;
  logoutServerUseCase: LogoutServerUseCase;
  logoutSessionUseCase: LogoutSessionUseCase;
  subscribePendingAppointmentsUseCase: SubscribePendingAppointmentsUseCase;
  subscribePendingNotificationsUseCase: SubscribePendingNotificationsUseCase;
  capturePaywallPaymentUseCase: CapturePaywallPaymentUseCase;
  loginUseCase: LoginUseCase;
  testAuthConnectionUseCase: TestAuthConnectionUseCase;
  registerUserUseCase: RegisterUserUseCase;
  fetchDoctorsUseCase: FetchDoctorsUseCase;
  createAppointmentUseCase: CreateAppointmentUseCase;
  checkAppointmentExistsUseCase: CheckAppointmentExistsUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;
  updateUserProfileUseCase: UpdateUserProfileUseCase;
  uploadProfilePictureUseCase: UploadProfilePictureUseCase;
  resetUserPasswordUseCase: ResetUserPasswordUseCase;
  fetchUserDetailsUseCase: FetchUserDetailsUseCase;
  observeAuthStateUseCase: ObserveAuthStateUseCase;
  getDoctorProfileUseCase: GetDoctorProfileUseCase;
  checkProfileCompleteUseCase: CheckProfileCompleteUseCase;
  getAllUsersUseCase: GetAllUsersUseCase;
  getUsersPageUseCase: GetUsersPageUseCase;
  getAdminUserByIdUseCase: GetAdminUserByIdUseCase;
  getAdminDoctorProfileUseCase: GetAdminDoctorProfileUseCase;
  resetAdminUserPasswordUseCase: ResetAdminUserPasswordUseCase;
  deleteUserAccountUseCase: DeleteUserAccountUseCase;
  createAdminUserUseCase: CreateAdminUserUseCase;
  updateAdminUserUseCase: UpdateAdminUserUseCase;
  updateAdminDoctorProfileUseCase: UpdateAdminDoctorProfileUseCase;
  approveDoctorUseCase: ApproveDoctorUseCase;
  getPharmaciesUseCase: GetPharmaciesUseCase;
  createReciepeUseCase: CreateReciepeUseCase;
  getReciepesByDoctorUseCase: GetReciepesByDoctorUseCase;
  getReciepesByPatientUseCase: GetReciepesByPatientUseCase;
  getReciepesByPharmacyUseCase: GetReciepesByPharmacyUseCase;
  updateReciepeStatusUseCase: UpdateReciepeStatusUseCase;
}

const DIContext = createContext<DIContextValue | undefined>(undefined);

export const DIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appointmentRepo = new FirebaseAppointmentRepository();
  const userRepo = new FirebaseUserRepository();
  const sessionRepo = new FirebaseSessionRepository();
  const authService = new AuthServiceAdapter();
  const userProfileService = new UserProfileService();
  const doctorProfileService = new DoctorProfileService(userRepo);
  const appointmentService = new AppointmentServiceAdapter();
  const videoSessionService = new VideoSessionService();
  const notificationService = new NotificationServiceAdapter();
  const appointmentNotificationService = new AppointmentNotificationServiceAdapter();
  const adminStatsService = new AdminStatsServiceAdapter();
  const sessionService = new SessionService();
  const realtimeAppointmentsService = new RealtimeAppointmentsService();
  const authLoginService = new AuthLoginService();
  const registrationService = new RegistrationService();
  const doctorSearchService = new DoctorSearchService();
  const adminUserService = new AdminUserService();
  const pharmacyService = new PharmacyService();
  const reciepeService = new ReciepeService();
  const paymentGateway = new PayPalGateway();
  const fetchAppointmentsUseCase = new FetchAppointmentsUseCase(appointmentRepo);
  const getAppointmentsUseCase = new GetAppointmentsUseCase(appointmentService);
  const setAppointmentPaidUseCase = new SetAppointmentPaidUseCase(appointmentService);
  const handlePayNowUseCase = new HandlePayNowUseCase();
  const checkIfPastAppointmentUseCase = new CheckIfPastAppointmentUseCase(appointmentService);
  const getUserRoleUseCase = new GetUserRoleUseCase(appointmentService);
  const updateAppointmentUseCase = new UpdateAppointmentUseCase(appointmentRepo);
  const generateRoomCodeUseCase = new GenerateRoomCodeUseCase(videoSessionService);
  const getNotificationUserRoleUseCase = new GetNotificationUserRoleUseCase(notificationService);
  const fetchAppointmentDetailsUseCase = new FetchAppointmentDetailsUseCase(notificationService);
  const dismissNotificationUseCase = new DismissNotificationUseCase(notificationService);
  const updateAppointmentStatusAndNotifyUseCase = new UpdateAppointmentStatusAndNotifyUseCase(appointmentNotificationService);
  const getTopDoctorsByAppointmentsUseCase = new GetTopDoctorsByAppointmentsUseCase(adminStatsService);
  const getTopDoctorsByRequestsUseCase = new GetTopDoctorsByRequestsUseCase(adminStatsService);
  const logoutServerUseCase = new LogoutServerUseCase(sessionService);
  const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentRepo);
  const checkAppointmentExistsUseCase = new CheckAppointmentExistsUseCase(appointmentRepo);
  const getUserProfileUseCase = new GetUserProfileUseCase(userProfileService);
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(userProfileService);
  const uploadProfilePictureUseCase = new UploadProfilePictureUseCase(userProfileService);
  const resetUserPasswordUseCase = new ResetUserPasswordUseCase(authService);
  const fetchUserDetailsUseCase = new FetchUserDetailsUseCase(authService);
  const observeAuthStateUseCase = new ObserveAuthStateUseCase(authService);
  const getDoctorProfileUseCase = new GetDoctorProfileUseCase(doctorProfileService);
  const logoutSessionUseCase = new LogoutSessionUseCase(sessionRepo);
  const subscribePendingAppointmentsUseCase = new SubscribePendingAppointmentsUseCase(realtimeAppointmentsService);
  const subscribePendingNotificationsUseCase = new SubscribePendingNotificationsUseCase(realtimeAppointmentsService);
  const capturePaywallPaymentUseCase = new CapturePaywallPaymentUseCase(paymentGateway);
  const loginUseCase = new LoginUseCase(authLoginService);
  const testAuthConnectionUseCase = new TestAuthConnectionUseCase(authLoginService);
  const registerUserUseCase = new RegisterUserUseCase(registrationService);
  const fetchDoctorsUseCase = new FetchDoctorsUseCase(doctorSearchService);
  const checkProfileCompleteUseCase = new CheckProfileCompleteUseCase(userRepo);
  const getAllUsersUseCase = new GetAllUsersUseCase(adminUserService);
  const getPharmaciesUseCase = new GetPharmaciesUseCase(pharmacyService);
  const createReciepeUseCase = new CreateReciepeUseCase(reciepeService);
  const getReciepesByDoctorUseCase = new GetReciepesByDoctorUseCase(reciepeService);
  const getReciepesByPatientUseCase = new GetReciepesByPatientUseCase(reciepeService);
  const getReciepesByPharmacyUseCase = new GetReciepesByPharmacyUseCase(reciepeService);
  const updateReciepeStatusUseCase = new UpdateReciepeStatusUseCase(reciepeService);
  const getUsersPageUseCase = new GetUsersPageUseCase(adminUserService);
  const getAdminUserByIdUseCase = new GetAdminUserByIdUseCase(adminUserService);
  const getAdminDoctorProfileUseCase = new GetAdminDoctorProfileUseCase(adminUserService);
  const resetAdminUserPasswordUseCase = new ResetAdminUserPasswordUseCase(adminUserService);
  const deleteUserAccountUseCase = new DeleteUserAccountUseCase(adminUserService);
  const createAdminUserUseCase = new CreateAdminUserUseCase(adminUserService);
  const updateAdminUserUseCase = new UpdateAdminUserUseCase(adminUserService);
  const updateAdminDoctorProfileUseCase = new UpdateAdminDoctorProfileUseCase(adminUserService);
  const approveDoctorUseCase = new ApproveDoctorUseCase(adminUserService);

  return (
    <DIContext.Provider
      value={{
        fetchAppointmentsUseCase,
        getAppointmentsUseCase,
        setAppointmentPaidUseCase,
        handlePayNowUseCase,
        checkIfPastAppointmentUseCase,
        getUserRoleUseCase,
        updateAppointmentUseCase,
        generateRoomCodeUseCase,
        getNotificationUserRoleUseCase,
        fetchAppointmentDetailsUseCase,
        dismissNotificationUseCase,
        updateAppointmentStatusAndNotifyUseCase,
        getTopDoctorsByAppointmentsUseCase,
        getTopDoctorsByRequestsUseCase,
        logoutServerUseCase,
        createAppointmentUseCase,
        checkAppointmentExistsUseCase,
        getUserProfileUseCase,
        updateUserProfileUseCase,
        uploadProfilePictureUseCase,
        resetUserPasswordUseCase,
        fetchUserDetailsUseCase,
        observeAuthStateUseCase,
        getDoctorProfileUseCase,
        logoutSessionUseCase,
        subscribePendingAppointmentsUseCase,
        subscribePendingNotificationsUseCase,
        capturePaywallPaymentUseCase,
        loginUseCase,
        testAuthConnectionUseCase,
        registerUserUseCase,
        fetchDoctorsUseCase,
        checkProfileCompleteUseCase,
        getAllUsersUseCase,
        getPharmaciesUseCase,
        createReciepeUseCase,
        getReciepesByDoctorUseCase,
        getReciepesByPatientUseCase,
        getReciepesByPharmacyUseCase,
        updateReciepeStatusUseCase,
        getUsersPageUseCase,
        getAdminUserByIdUseCase,
        getAdminDoctorProfileUseCase,
        resetAdminUserPasswordUseCase,
        deleteUserAccountUseCase,
        createAdminUserUseCase,
        updateAdminUserUseCase,
        updateAdminDoctorProfileUseCase,
        approveDoctorUseCase,
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
