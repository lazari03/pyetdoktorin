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
- **Services**: External service adapters (100ms, SMS, Email, etc.)
- **DI Context**: Dependency injection container

### 4. Presentation Layer (`src/presentation/`)
- **Components**: React components with no business logic
- **Hooks**: Custom hooks that orchestrate use cases
- **View Models**: View models that bridge components and use cases

### Supporting Layers
- **Network (`src/network/`)**: HTTP API clients (target: migrate into infrastructure)
- **Store (`src/store/`)**: Zustand state stores — the source of truth for any state shared across more than one component tree (see State Management Rules below)
- **Context (`src/context/`)**: React contexts for Auth and DI

## State Management Rules

Three mechanisms exist in this codebase for holding state outside a single component. Picking the wrong one for a given piece of state is a recurring source of bugs (see case study below) — use this decision order:

1. **Is this state read or written by more than one component/hook that isn't a parent-child pair?** → It belongs in a **Zustand store** (`src/store/`). This includes anything read-tracked, cross-page, or persisted-per-user (e.g. `appointmentStore`, `notificationReadStore`, `videoStore`). Never reimplement a mini version of an existing store's job (a local `useState` + a one-off `localStorage.getItem`/`setItem` pair) inside a hook or component when a store already owns that data. If the store doesn't have the field/action you need yet, add it to the store — don't fork a parallel copy.
2. **Is this a cache of server data (fetch once, revalidate on interval/focus, dedupe concurrent requests)?** → Use **SWR** (`presentation/hooks/use*.ts` following the `useCurrentUserProfile`/`useUserNotifications`/`usePayoutSummary` pattern). SWR owns request dedup/caching; don't also keep a parallel Zustand copy of the same server data unless a *different* concern (e.g. real-time polling with visibility/focus listeners) genuinely requires it.
3. **Is this state genuinely local to one component subtree** (form input, modal open/disabled, an in-progress animation flag, a sidebar-collapsed toggle read/written only by the one component that renders the sidebar)? → Plain `useState`/`useReducer` is correct and preferred. Don't promote local UI state into a store "just in case" — that's the inverse mistake.

**Case study (fixed 2026-07):** `NotificationCard.tsx` (the dashboard home notification card) tracked which notifications were read using its own `localStorage` key (`loadReadIds`/`saveReadIds`), completely separate from `notificationReadStore` — the Zustand store the topbar bell dropdown (`SectionShell.tsx`) and the full notifications page already used for the exact same data. Result: marking a notification read in one place didn't reflect in the other, and which one "won" after a reload was inconsistent — a real, user-visible bug, not a style nitpick. Fixed by deleting the local implementation and pointing the component at the shared `useNotificationReadState` hook instead. If you find another hook/component holding its own copy of state that a store already tracks, this is the fix pattern: delete the local copy, consume the shared store.

A related but *legitimate* exception: `useNotificationsLogic.ts` keeps a local `dismissedLocal` Set alongside the shared `appointments` store. This is not the same anti-pattern — `subscribeAppointments` polls every 30s and does a full replace of the store's `appointments` array, so a local optimistic overlay is needed to prevent a dismissed notification from flickering back for up to 30s if a poll lands between the local dismiss and the backend write completing. Local state that exists specifically to bridge a gap in an eventually-consistent shared store is fine; local state that exists because nobody wired up the shared store is the bug.

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