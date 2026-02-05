// Repository implementations
import { FirebaseAppointmentRepository } from '../infrastructure/persistence/FirebaseAppointmentRepository';
import { FirebaseUserRepository } from '../infrastructure/persistence/FirebaseUserRepository';
import { FirebaseNotificationRepository } from '../infrastructure/persistence/FirebaseNotificationRepository';
import { FirebasePaymentRepository } from '../infrastructure/persistence/FirebasePaymentRepository';

// Domain interfaces
import { IAppointmentRepository } from '../domain/repositories/IAppointmentRepository';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { INotificationRepository } from '../domain/repositories/INotificationRepository';
import { IPaymentRepository } from '../domain/repositories/IPaymentRepository';

// Use cases
import { CreateAppointmentUseCase } from '../application/use-cases/CreateAppointmentUseCase';
import { GetUserAppointmentsUseCase } from '../application/use-cases/GetUserAppointmentsUseCase';
import { UpdateAppointmentStatusUseCase } from '../application/use-cases/UpdateAppointmentStatusUseCase';
import { UpdateUserProfileUseCase } from '../application/use-cases/UpdateUserProfileUseCase';
import { CreateNotificationUseCase } from '../application/use-cases/CreateNotificationUseCase';
import { ProcessPaymentUseCase } from '../application/use-cases/ProcessPaymentUseCase';

// Domain services (mock implementations for now)
import { IAppointmentDomainService } from '../domain/services/IDomainServices';

class DependencyContainer {
  private static instance: DependencyContainer;
  private repositories: Map<string, any> = new Map();
  private useCases: Map<string, any> = new Map();
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeRepositories();
    this.initializeServices();
    this.initializeUseCases();
  }

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  private initializeRepositories() {
    // Repository implementations
    this.repositories.set('IAppointmentRepository', new FirebaseAppointmentRepository());
    this.repositories.set('IUserRepository', new FirebaseUserRepository());
    this.repositories.set('INotificationRepository', new FirebaseNotificationRepository());
    this.repositories.set('IPaymentRepository', new FirebasePaymentRepository());
  }

  private initializeServices() {
    // Mock domain services - in a real implementation, these would be actual domain services
    this.services.set('IAppointmentDomainService', {
      isTimeSlotAvailable: async (doctorId: string, date: string, time: string) => {
        // Simplified implementation - in real app, check against existing appointments
        return true;
      },
      canBookAppointment: async (doctorId: string, patientId: string, date: string, time: string) => {
        return true;
      },
      canUserAccessAppointment: async (userId: string, appointmentId: string) => {
        return true;
      },
      processAppointmentCreation: async (appointment: any) => {
        // Handle domain logic for appointment creation
      },
      processAppointmentCancellation: async (appointmentId: string) => {
        // Handle domain logic for appointment cancellation
      },
      processAppointmentCompletion: async (appointmentId: string) => {
        // Handle domain logic for appointment completion
      },
      resolveConflictingAppointments: async (appointments: any[]) => {
        return appointments;
      }
    });

    this.services.set('IPaymentDomainService', {
      calculateAppointmentFee: async (doctorId: string, appointmentType: string) => {
        // Simplified fee calculation
        return 100;
      },
      canProcessPayment: async (userId: string, appointmentId: string) => {
        return true;
      },
      isPaymentRefundable: async (paymentId: string) => {
        return false;
      },
      validatePaymentAmount: async (amount: number, appointmentId: string) => {
        return amount > 0;
      },
      validatePaymentMethod: async (method: string, userId: string) => {
        return ['paypal', 'stripe'].includes(method);
      }
    });
  }

  private initializeUseCases() {
    // Get repositories
    const appointmentRepo = this.repositories.get('IAppointmentRepository') as IAppointmentRepository;
    const userRepo = this.repositories.get('IUserRepository') as IUserRepository;
    const notificationRepo = this.repositories.get('INotificationRepository') as INotificationRepository;
    const paymentRepo = this.repositories.get('IPaymentRepository') as IPaymentRepository;

    // Get services
    const appointmentDomainService = this.services.get('IAppointmentDomainService') as IAppointmentDomainService;
    const paymentDomainService = this.services.get('IPaymentDomainService');

    // Initialize use cases
    this.useCases.set('CreateAppointmentUseCase', new CreateAppointmentUseCase(
      appointmentRepo,
      userRepo,
      appointmentDomainService,
      notificationRepo
    ));

    this.useCases.set('GetUserAppointmentsUseCase', new GetUserAppointmentsUseCase(
      appointmentRepo
    ));

    this.useCases.set('UpdateAppointmentStatusUseCase', new UpdateAppointmentStatusUseCase(
      appointmentRepo,
      notificationRepo
    ));

    this.useCases.set('UpdateUserProfileUseCase', new UpdateUserProfileUseCase(
      userRepo,
      notificationRepo
    ));

    this.useCases.set('CreateNotificationUseCase', new CreateNotificationUseCase(
      notificationRepo
    ));

    this.useCases.set('ProcessPaymentUseCase', new ProcessPaymentUseCase(
      paymentRepo,
      appointmentRepo,
      paymentDomainService
    ));
  }

  // Repository getters
  getAppointmentRepository(): IAppointmentRepository {
    return this.repositories.get('IAppointmentRepository');
  }

  getUserRepository(): IUserRepository {
    return this.repositories.get('IUserRepository');
  }

  getNotificationRepository(): INotificationRepository {
    return this.repositories.get('INotificationRepository');
  }

  getPaymentRepository(): IPaymentRepository {
    return this.repositories.get('IPaymentRepository');
  }

  // Use case getters
  getCreateAppointmentUseCase(): CreateAppointmentUseCase {
    return this.useCases.get('CreateAppointmentUseCase');
  }

  getGetUserAppointmentsUseCase(): GetUserAppointmentsUseCase {
    return this.useCases.get('GetUserAppointmentsUseCase');
  }

  getUpdateAppointmentStatusUseCase(): UpdateAppointmentStatusUseCase {
    return this.useCases.get('UpdateAppointmentStatusUseCase');
  }

  getUpdateUserProfileUseCase(): UpdateUserProfileUseCase {
    return this.useCases.get('UpdateUserProfileUseCase');
  }

  getCreateNotificationUseCase(): CreateNotificationUseCase {
    return this.useCases.get('CreateNotificationUseCase');
  }

  getProcessPaymentUseCase(): ProcessPaymentUseCase {
    return this.useCases.get('ProcessPaymentUseCase');
  }

  // Service getters
  getAppointmentDomainService(): IAppointmentDomainService {
    return this.services.get('IAppointmentDomainService');
  }

  // Generic getters for testing or advanced usage
  getRepository<T>(key: string): T {
    return this.repositories.get(key);
  }

  getUseCase<T>(key: string): T {
    return this.useCases.get(key);
  }

  getService<T>(key: string): T {
    return this.services.get(key);
  }

  // Method to replace implementations for testing
  registerRepository(key: string, implementation: any): void {
    this.repositories.set(key, implementation);
  }

  registerUseCase(key: string, implementation: any): void {
    this.useCases.set(key, implementation);
  }

  registerService(key: string, implementation: any): void {
    this.services.set(key, implementation);
  }
}

export default DependencyContainer;