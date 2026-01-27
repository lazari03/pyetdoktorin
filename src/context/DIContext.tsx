"use client";
import React, { createContext, useContext } from 'react';
import { FetchAppointmentsUseCase } from '@/application/fetchAppointmentsUseCase';
import { CreateAppointmentUseCase } from '@/application/createAppointmentUseCase';
import { CheckAppointmentExistsUseCase } from '@/application/checkAppointmentExistsUseCase';
import { GetAppointmentsUseCase } from '@/application/getAppointmentsUseCase';
import { SetAppointmentPaidUseCase } from '@/application/setAppointmentPaidUseCase';
import { HandlePayNowUseCase } from '@/application/handlePayNowUseCase';
import { CheckIfPastAppointmentUseCase } from '@/application/checkIfPastAppointmentUseCase';
import { VerifyStripePaymentUseCase } from '@/application/verifyStripePaymentUseCase';
import { VerifyAndUpdatePaymentUseCase } from '@/application/verifyAndUpdatePaymentUseCase';
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
import { GetUserProfileUseCase } from '@/application/getUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@/application/updateUserProfileUseCase';
import { UploadProfilePictureUseCase } from '@/application/uploadProfilePictureUseCase';
import { ResetUserPasswordUseCase } from '@/application/resetUserPasswordUseCase';
import { FetchUserDetailsUseCase } from '@/application/fetchUserDetailsUseCase';
import { ObserveAuthStateUseCase } from '@/application/observeAuthStateUseCase';
import { GetDoctorProfileUseCase } from '@/application/getDoctorProfileUseCase';
import { FirebaseAppointmentRepository } from '@/infrastructure/repositories/FirebaseAppointmentRepository';
import { FirebaseUserRepository } from '@/infrastructure/repositories/FirebaseUserRepository';
import { FirebaseSessionRepository } from '@/infrastructure/repositories/FirebaseSessionRepository';
import { AuthServiceAdapter } from '@/infrastructure/services/authServiceAdapter';
import { UserProfileService } from '@/infrastructure/services/userProfileService';
import { DoctorProfileService } from '@/infrastructure/services/doctorProfileService';
import { AppointmentServiceAdapter } from '@/infrastructure/services/appointmentServiceAdapter';
import { VideoSessionService } from '@/infrastructure/services/videoSessionService';
import { NotificationServiceAdapter } from '@/infrastructure/services/notificationServiceAdapter';
import { AppointmentNotificationServiceAdapter } from '@/infrastructure/services/appointmentNotificationServiceAdapter';
import { AdminStatsServiceAdapter } from '@/infrastructure/services/adminStatsServiceAdapter';
import { SessionService } from '@/infrastructure/services/sessionService';

interface DIContextValue {
  fetchAppointmentsUseCase: FetchAppointmentsUseCase;
  getAppointmentsUseCase: GetAppointmentsUseCase;
  setAppointmentPaidUseCase: SetAppointmentPaidUseCase;
  handlePayNowUseCase: HandlePayNowUseCase;
  checkIfPastAppointmentUseCase: CheckIfPastAppointmentUseCase;
  verifyStripePaymentUseCase: VerifyStripePaymentUseCase;
  verifyAndUpdatePaymentUseCase: VerifyAndUpdatePaymentUseCase;
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
  createAppointmentUseCase: CreateAppointmentUseCase;
  checkAppointmentExistsUseCase: CheckAppointmentExistsUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;
  updateUserProfileUseCase: UpdateUserProfileUseCase;
  uploadProfilePictureUseCase: UploadProfilePictureUseCase;
  resetUserPasswordUseCase: ResetUserPasswordUseCase;
  fetchUserDetailsUseCase: FetchUserDetailsUseCase;
  observeAuthStateUseCase: ObserveAuthStateUseCase;
  getDoctorProfileUseCase: GetDoctorProfileUseCase;
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
  const fetchAppointmentsUseCase = new FetchAppointmentsUseCase(appointmentRepo);
  const getAppointmentsUseCase = new GetAppointmentsUseCase(appointmentService);
  const setAppointmentPaidUseCase = new SetAppointmentPaidUseCase(appointmentService);
  const handlePayNowUseCase = new HandlePayNowUseCase(appointmentService);
  const checkIfPastAppointmentUseCase = new CheckIfPastAppointmentUseCase(appointmentService);
  const verifyStripePaymentUseCase = new VerifyStripePaymentUseCase(appointmentService);
  const verifyAndUpdatePaymentUseCase = new VerifyAndUpdatePaymentUseCase(appointmentService);
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

  return (
    <DIContext.Provider
      value={{
        fetchAppointmentsUseCase,
        getAppointmentsUseCase,
        setAppointmentPaidUseCase,
        handlePayNowUseCase,
        checkIfPastAppointmentUseCase,
        verifyStripePaymentUseCase,
        verifyAndUpdatePaymentUseCase,
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
