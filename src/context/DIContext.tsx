"use client";
import React, { createContext, useContext } from 'react';
import { FetchAppointmentsUseCase } from '@/application/fetchAppointmentsUseCase';
import { SetAppointmentPaidUseCase } from '@/application/setAppointmentPaidUseCase';
import { HandlePayNowUseCase } from '@/application/handlePayNowUseCase';
import { CheckIfPastAppointmentUseCase } from '@/application/checkIfPastAppointmentUseCase';
import { UpdateAppointmentUseCase } from '@/application/updateAppointmentUseCase';
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
import { FirebaseAppointmentRepository } from '@/infrastructure/repositories/FirebaseAppointmentRepository';
import { FirebaseUserRepository } from '@/infrastructure/repositories/FirebaseUserRepository';
import { FirebaseSessionRepository } from '@/infrastructure/repositories/FirebaseSessionRepository';
import { AuthServiceAdapter } from '@/infrastructure/services/authServiceAdapter';
import { UserProfileService } from '@/infrastructure/services/userProfileService';
import { DoctorProfileService } from '@/infrastructure/services/doctorProfileService';
import { AppointmentServiceAdapter } from '@/infrastructure/services/appointmentServiceAdapter';
import { VideoSessionService } from '@/infrastructure/services/videoSessionService';
import { AdminStatsServiceAdapter } from '@/infrastructure/services/adminStatsServiceAdapter';
import { SessionService } from '@/infrastructure/services/sessionService';
import { RealtimeAppointmentsService } from '@/infrastructure/services/realtimeAppointmentsService';
import { AuthLoginService } from '@/infrastructure/services/authLoginService';
import { RegistrationService } from '@/infrastructure/services/registrationService';
import { DoctorSearchService } from '@/infrastructure/services/doctorSearchService';
import { GA4AnalyticsService } from '@/infrastructure/services/analyticsService';
import { IAnalyticsService } from '@/application/ports/IAnalyticsService';
import { ReciepeService } from '@/infrastructure/services/reciepeService';
import { AppointmentPaymentService } from '@/infrastructure/services/appointmentPaymentService';
import { PaymentCheckoutService } from '@/infrastructure/services/paymentCheckoutService';

interface DIContextValue {
  fetchAppointmentsUseCase: FetchAppointmentsUseCase;
  setAppointmentPaidUseCase: SetAppointmentPaidUseCase;
  handlePayNowUseCase: HandlePayNowUseCase;
  checkIfPastAppointmentUseCase: CheckIfPastAppointmentUseCase;
  updateAppointmentUseCase: UpdateAppointmentUseCase;
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
  const adminStatsService = new AdminStatsServiceAdapter();
  const sessionService = new SessionService();
  const realtimeAppointmentsService = new RealtimeAppointmentsService();
  const authLoginService = new AuthLoginService();
  const registrationService = new RegistrationService();
  const doctorSearchService = new DoctorSearchService();
  const analyticsService: IAnalyticsService = new GA4AnalyticsService();
  const reciepeService = new ReciepeService();
  const appointmentPaymentService = new AppointmentPaymentService();
  const paymentCheckoutService = new PaymentCheckoutService();

  const fetchAppointmentsUseCase = new FetchAppointmentsUseCase(appointmentRepo);
  const setAppointmentPaidUseCase = new SetAppointmentPaidUseCase(appointmentService);
  const handlePayNowUseCase = new HandlePayNowUseCase(appointmentPaymentService, paymentCheckoutService);
  const checkIfPastAppointmentUseCase = new CheckIfPastAppointmentUseCase(appointmentService);
  const updateAppointmentUseCase = new UpdateAppointmentUseCase(appointmentRepo);
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

  return (
    <DIContext.Provider
      value={{
        fetchAppointmentsUseCase,
        setAppointmentPaidUseCase,
        handlePayNowUseCase,
        checkIfPastAppointmentUseCase,
        updateAppointmentUseCase,
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
