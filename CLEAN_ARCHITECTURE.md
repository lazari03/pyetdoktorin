# Clean Architecture Refactor - Documentation

## Overview
This project has been refactored to follow Clean Architecture principles, providing better separation of concerns, testability, and maintainability.

## Architecture Layers

### 1. Domain Layer (`src/domain/`)
- **Entities**: Core business objects (Appointment, User, Doctor, Clinic)
- **Repository Interfaces**: Contracts for data access without implementation details
- **Domain Rules**: Business rules and validation logic

### 2. Application Layer (`src/application/`)
- **Use Cases**: Application-specific business logic and workflows
- **Ports**: Interfaces for external services (notifications, payments, etc.)

### 3. Infrastructure Layer (`src/infrastructure/`)
- **Repositories**: Firebase repository implementations
- **Services**: External service adapters (100ms, Paddle, SMS, Email, etc.)
- **DI Context**: Dependency injection container

### 4. Presentation Layer (`src/presentation/`)
- **Components**: React components with no business logic
- **Hooks**: Custom hooks that orchestrate use cases
- **View Models**: View models that bridge components and use cases

### Supporting Layers
- **Network (`src/network/`)**: HTTP API clients (target: migrate into infrastructure)
- **Store (`src/store/`)**: Zustand state stores (target: migrate into use cases)
- **Context (`src/context/`)**: React contexts for Auth and DI

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
import { useDI } from '@/context/DIContext';

function MyComponent() {
  const { appointmentUseCases } = useDI();
  const appointments = appointmentUseCases.getAppointments(userId);
}
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
src/
├── domain/
│   ├── entities/          # Core business entities
│   ├── repositories/      # Repository interfaces
│   └── rules/             # Business rules
├── application/
│   ├── auth/              # Auth use cases
│   ├── clinics/           # Clinic use cases
│   ├── ports/             # External service interfaces
│   └── ...                # Use case files
├── infrastructure/
│   ├── repositories/      # Repository implementations
│   └── services/          # External service adapters
├── presentation/
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── view-models/       # View models
│   └── utils/             # UI utilities
├── network/               # API client layer
├── store/                 # Zustand state stores
├── config/                # App configuration
├── context/               # React contexts (Auth, DI)
├── navigation/            # Routing/navigation
├── app/                   # Next.js App Router
├── i18n/                  # Internationalization setup
├── locales/               # Translation files
├── models/                # Type definitions
├── utils/                 # Shared utilities
└── types/                 # Global type declarations
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