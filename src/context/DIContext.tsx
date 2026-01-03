"use client";
import React, { createContext, useContext } from 'react';
import { FetchAppointmentsUseCase } from '@/application/fetchAppointmentsUseCase';
import { FirebaseAppointmentRepository } from '@/infrastructure/repositories/FirebaseAppointmentRepository';

interface DIContextValue {
  fetchAppointmentsUseCase: FetchAppointmentsUseCase;
}

const DIContext = createContext<DIContextValue | undefined>(undefined);

export const DIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appointmentRepo = new FirebaseAppointmentRepository();
  const fetchAppointmentsUseCase = new FetchAppointmentsUseCase(appointmentRepo);

  return (
    <DIContext.Provider value={{ fetchAppointmentsUseCase }}>
      {children}
    </DIContext.Provider>
  );
};

export function useDI() {
  const context = useContext(DIContext);
  if (!context) throw new Error('useDI must be used within a DIProvider');
  return context;
}
