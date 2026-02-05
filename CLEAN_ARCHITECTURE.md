# Clean Architecture Refactor - Documentation

## Overview
This project has been refactored to follow Clean Architecture principles, providing better separation of concerns, testability, and maintainability.

## Architecture Layers

### 1. Domain Layer (`/src/clean/src/domain/`)
- **Entities**: Core business objects (Appointment, User, Doctor, Notification, Payment)
- **Value Objects**: Immutable objects that represent domain concepts
- **Repository Interfaces**: Contracts for data access without implementation details
- **Domain Services**: Complex business logic that doesn't fit in entities

### 2. Application Layer (`/src/clean/src/application/`)
- **Use Cases**: Application-specific business logic and workflows
- **Ports**: Interfaces for external services (notifications, payments, etc.)

### 3. Infrastructure Layer (`/src/clean/src/infrastructure/`)
- **Persistence**: Firebase repository implementations
- **Services**: External service adapters (PayPal, SMS, Email, etc.)
- **Dependency Injection**: Container for managing dependencies

### 4. Presentation Layer (`/src/clean/src/presentation/`)
- **Components**: React components with no business logic
- **Hooks**: Custom hooks that orchestrate use cases
- **Pages**: Page-level components that compose multiple components

## Key Improvements

### ✅ Before (Issues)
- Business logic mixed in UI components
- Direct Firebase dependencies throughout the codebase
- No clear separation of concerns
- Difficult to test business logic
- Tight coupling between layers

### ✅ After (Clean Architecture)
- Clear separation of concerns
- Dependency inversion with interfaces
- Business logic isolated in use cases
- Easy to test each layer independently
- Framework-agnostic domain logic

## Usage Examples

### Using a Use Case in a Component
```typescript
import { useCreateAppointment } from '@/presentation/hooks/useCreateAppointment';
import { useCreateAppointmentUseCase } from '@/infrastructure/di/DependencyContext';

const createAppointmentUseCase = useCreateAppointmentUseCase();
const { createAppointment, loading, error } = useCreateAppointment({
  createAppointmentUseCase
});

const handleCreate = async (data) => {
  const appointment = await createAppointment(data);
  if (appointment) {
    // Handle success
  }
};
```

### Using the Dependency Container
```typescript
import DependencyContainer from '@/infrastructure/di/DependencyContainer';

const container = DependencyContainer.getInstance();
const appointmentRepo = container.getAppointmentRepository();
const appointments = await appointmentRepo.getByUser(userId, isDoctor);
```

## Dependency Flow

```
Presentation → Application → Domain ← Infrastructure
```

- **Presentation** depends on **Application** use cases
- **Application** depends on **Domain** entities and interfaces
- **Infrastructure** implements **Domain** interfaces
- **Domain** has no dependencies on outer layers

## Testing Strategy

### Unit Tests
- Test domain entities and business rules in isolation
- Mock repository interfaces for use case testing
- Test UI components with mocked hooks

### Integration Tests
- Test repository implementations with test database
- Test use case workflows with real dependencies
- Test component integration with real hooks

## File Structure

```
src/clean/src/
├── domain/
│   ├── entities/          # Core business entities
│   ├── value-objects/     # Value objects
│   ├── repositories/      # Repository interfaces
│   └── services/          # Domain services
├── application/
│   ├── use-cases/         # Application use cases
│   └── ports/             # External service interfaces
├── infrastructure/
│   ├── persistence/       # Repository implementations
│   ├── services/          # External service adapters
│   └── di/               # Dependency injection
└── presentation/
    ├── components/        # React components
    ├── hooks/            # Custom hooks
    ├── pages/            # Page components
    └── layout/           # Layout components
```

## Migration Strategy

1. **Parallel Development**: Keep old and new architecture running side by side
2. **Gradual Migration**: Migrate one feature at a time to clean architecture
3. **Feature Flags**: Use feature flags to switch between implementations
4. **Testing**: Ensure comprehensive test coverage during migration

## Benefits Achieved

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Business logic can be tested independently of frameworks
3. **Flexibility**: Easy to swap implementations (e.g., Firebase → PostgreSQL)
4. **Maintainability**: Changes in one layer don't affect others
5. **Scalability**: Architecture supports growing complexity

## Next Steps

1. Add comprehensive unit and integration tests
2. Implement remaining domain services
3. Add proper error handling and logging
4. Set up CI/CD pipeline
5. Document API contracts and use case flows