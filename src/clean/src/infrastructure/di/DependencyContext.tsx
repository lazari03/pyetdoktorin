import React, { createContext, useContext, ReactNode } from 'react';
import DependencyContainer from '../infrastructure/di/DependencyContainer';

// Context for providing the dependency container
interface DependencyContextType {
  container: DependencyContainer;
}

const DependencyContext = createContext<DependencyContextType | null>(null);

interface DependencyProviderProps {
  children: ReactNode;
}

export const DependencyProvider: React.FC<DependencyProviderProps> = ({ children }) => {
  const container = DependencyContainer.getInstance();

  return (
    <DependencyContext.Provider value={{ container }}>
      {children}
    </DependencyContext.Provider>
  );
};

export const useDependencies = (): DependencyContextType => {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return context;
};

// Custom hooks for common dependencies
export const useAppointmentRepository = () => {
  const { container } = useDependencies();
  return container.getAppointmentRepository();
};

export const useUserRepository = () => {
  const { container } = useDependencies();
  return container.getUserRepository();
};

export const useNotificationRepository = () => {
  const { container } = useDependencies();
  return container.getNotificationRepository();
};

export const usePaymentRepository = () => {
  const { container } = useDependencies();
  return container.getPaymentRepository();
};

export const useCreateAppointmentUseCase = () => {
  const { container } = useDependencies();
  return container.getCreateAppointmentUseCase();
};

export const useGetUserAppointmentsUseCase = () => {
  const { container } = useDependencies();
  return container.getGetUserAppointmentsUseCase();
};

export const useUpdateAppointmentStatusUseCase = () => {
  const { container } = useDependencies();
  return container.getUpdateAppointmentStatusUseCase();
};

export const useUpdateUserProfileUseCase = () => {
  const { container } = useDependencies();
  return container.getUpdateUserProfileUseCase();
};

export const useCreateNotificationUseCase = () => {
  const { container } = useDependencies();
  return container.getCreateNotificationUseCase();
};

export const useProcessPaymentUseCase = () => {
  const { container } = useDependencies();
  return container.getProcessPaymentUseCase();
};