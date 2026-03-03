# Project Architecture Guide

## Overview

ElderConnect+ follows **Clean Architecture** principles with a layered approach to separate concerns and improve testability, maintainability, and scalability.

## Architecture Layers

### 1. Core Layer (Framework Agnostic)
**Location**: `lib/src/core/`

Contains reusable utilities that don't depend on any external framework:

- **constants/** - App-wide constants
  - `app_constants.dart` - Configuration values
  - `error_messages.dart` - Error text strings

- **extensions/** - Dart extension methods
  - `string_extensions.dart` - String utilities
  - `date_extensions.dart` - DateTime utilities

- **utils/** - Utility functions
  - `validation_utils.dart` - Input validation
  - `failures.dart` - Error handling

- **theme/** - UI styling
  - `app_theme.dart` - Material theme configuration
  - `colors.dart` - Color palette

### 2. Data Layer
**Location**: `lib/src/data/`

Handles data retrieval and storage, implementing the domain repository interfaces:

```
data/
├── datasources/
│   ├── local/
│   │   ├── shared_preferences_service.dart
│   │   └── local_database.dart
│   └── remote/
│       ├── supabase_service.dart
│       └── api_service.dart
├── models/
│   ├── user_model.dart
│   ├── companion_request_model.dart
│   └── [other_models]
└── repositories/
    ├── auth_repository_impl.dart
    ├── companion_repository_impl.dart
    └── [other_repository_impls]
```

**Responsibilities**:
- API calls via Supabase
- Local data persistence (SharedPreferences, Hive)
- Data transformations
- Error handling and retry logic

**Example**:
```dart
class AuthRepositoryImpl implements AuthRepository {
  final SupabaseAuthService _supabaseService;
  
  @override
  Future<Either<Failure, UserEntity>> loginUser({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _supabaseService.signIn(
        email: email,
        password: password,
      );
      return Right(response);
    } catch (e) {
      return Left(AuthFailure(e.toString()));
    }
  }
}
```

### 3. Domain Layer
**Location**: `lib/src/domain/`

Core business logic, independent of any implementation:

```
domain/
├── entities/
│   ├── user_entity.dart
│   ├── companion_request_entity.dart
│   └── [other_entities]
├── repositories/
│   ├── auth_repository.dart
│   ├── companion_repository.dart
│   └── [other_repository_abstracts]
└── usecases/
    ├── login_usecase.dart
    ├── create_companion_request_usecase.dart
    └── [other_usecases]
```

**Responsibilities**:
- Define business entities
- Define repository interfaces (abstract classes)
- Implement business logic in usecases

**Example**:
```dart
// Entity - immutable business model
@freezed
class UserEntity with _$UserEntity {
  const factory UserEntity({
    required String id,
    required String email,
    required String firstName,
    required String lastName,
  }) = _UserEntity;
}

// Repository interface
abstract class AuthRepository {
  Future<Either<Failure, UserEntity>> loginUser({
    required String email,
    required String password,
  });
}
```

### 4. Presentation Layer
**Location**: `lib/src/presentation/`

User interface and state management:

```
presentation/
├── providers/
│   ├── auth_provider.dart      // Riverpod providers
│   ├── companion_provider.dart
│   └── [other_providers]
├── pages/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── register_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── profile/
│   └── [other_pages]
└── widgets/
    ├── common/
    │   ├── custom_app_bar.dart
    │   ├── custom_button.dart
    │   └── [other_common_widgets]
    └── accessibility/
        ├── large_text_widget.dart
        └── voice_assisted_button.dart
```

**Responsibilities**:
- UI components (Widgets)
- State management (Riverpod providers)
- Navigation (GoRouter)
- User interaction handling

## State Management: Riverpod

### Provider Types

#### 1. FutureProvider (Async Data)
```dart
final userProvider = FutureProvider<UserEntity>((ref) async {
  final authRepository = ref.watch(authRepositoryProvider);
  return await authRepository.getCurrentUser();
});
```

#### 2. StreamProvider (Real-time Data)
```dart
final messagesStreamProvider = StreamProvider<List<MessageEntity>>((ref) {
  final messagingRepository = ref.watch(messagingRepositoryProvider);
  return messagingRepository.watchMessages(userId);
});
```

#### 3. StateNotifierProvider (Mutable State)
```dart
final authStateProvider = StateNotifierProvider<AuthNotifier, AsyncValue<UserEntity?>>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return AuthNotifier(authRepository);
});
```

#### 4. Provider (Computed/Derived)
```dart
final isLoggedInProvider = Provider<bool>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.maybeWhen(
    data: (user) => user != null,
    orElse: () => false,
  );
});
```

## Data Flow Example

### User Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Presentation Layer (UI)                                     │
│ LoginScreen calls authNotifier.login(email, password)      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Presentation Layer (State)                                  │
│ authStateNotifierProvider.notifier triggers login()        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Domain Layer                                                 │
│ AuthRepository interface defines login contract            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Data Layer                                                   │
│ AuthRepositoryImpl calls supabaseService.signIn()           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Data Layer (Datasource)                                     │
│ SupabaseAuthService calls Supabase.auth.signInWithPassword │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
                    Supabase
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Data Layer                                                   │
│ Receives AuthResponse, maps to UserModel                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Domain Layer                                                 │
│ Returns Either<Failure, UserEntity>                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Presentation Layer (State)                                  │
│ Updates AsyncValue with success or error                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Presentation Layer (UI)                                     │
│ LoginScreen rebuilds with new auth state                   │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling with Either

Using `dartz` package for functional error handling:

```dart
// Domain layer returns Either<Failure, Success>
Future<Either<Failure, UserEntity>> loginUser(...) async {
  try {
    // ... login logic
    return Right(user);  // Success
  } catch (e) {
    return Left(AuthFailure('Login failed'));  // Failure
  }
}

// Presentation layer handles it
authState.fold(
  (failure) => ScaffoldMessenger.show(failure.message),  // Left = failure
  (user) => navigateToHome(),  // Right = success
);
```

## Navigation with GoRouter

```dart
// Define routes
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => LoginScreen(),
    ),
    GoRoute(
      path: '/home',
      name: 'home',
      builder: (context, state) => HomeScreen(),
    ),
  ],
  redirect: (context, state) {
    // Handle auth-based redirects
    final isLoggedIn = ref.watch(isLoggedInProvider);
    if (!isLoggedIn && state.matchedLocation != '/login') {
      return '/login';
    }
    return null;
  },
);

// Use in widgets
context.goNamed('home');  // Named navigation
context.go('/home');      // Path navigation
```

## Accessibility Architecture

### Accessibility Providers
```dart
final accessibilityProvider = Provider<AccessibilitySettings>((ref) {
  return AccessibilitySettings(
    largeFonts: ref.watch(largeFontsProvider),
    highContrast: ref.watch(highContrastProvider),
    voiceEnabled: ref.watch(voiceEnabledProvider),
  );
});
```

### Responsive Widgets
```dart
class AccessibleText extends ConsumerWidget {
  final String text;
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final accessibility = ref.watch(accessibilityProvider);
    final fontSize = accessibility.largeFonts ? 20.0 : 14.0;
    
    return Text(
      text,
      style: TextStyle(fontSize: fontSize),
      semanticsLabel: text,  // For screen readers
    );
  }
}
```

## Testing Architecture

### Unit Tests (Domain & Data)
```dart
test('loginUser returns UserEntity on success', () async {
  // Arrange
  final mockAuthService = MockSupabaseAuthService();
  final repository = AuthRepositoryImpl(mockAuthService);
  
  // Act
  final result = await repository.loginUser(
    email: 'test@example.com',
    password: 'password',
  );
  
  // Assert
  expect(result, isA<Right<Failure, UserEntity>>());
});
```

### Widget Tests (Presentation)
```dart
testWidgets('LoginScreen displays email and password fields', (tester) async {
  await tester.pumpWidget(ProviderContainer(child: LoginScreen()));
  
  expect(find.byType(TextField), findsWidgets);
  expect(find.byType(ElevatedButton), findsOneWidget);
});
```

## Scalability Considerations

### For 100k Users:

1. **Pagination**: Implement pagination in list providers
   ```dart
   final companionRequestsProvider = FutureProvider.family<List<CompanionRequestEntity>, int>((ref, page) async {
     // Fetch with pagination
     return repository.getRequests(page: page, pageSize: 20);
   });
   ```

2. **Caching**: Use local storage for frequently accessed data
   ```dart
   final cachedUserProvider = FutureProvider((ref) async {
     final local = ref.watch(localStorageProvider);
     return local.getUser() ?? await ref.watch(remoteUserProvider.future);
   });
   ```

3. **Real-time Subscriptions**: Limit to critical features
   ```dart
   // Only subscribe to emergency alerts for logged-in users
   final emergencyAlertsProvider = StreamProvider.family<List<EmergencyAlert>, String>((ref, userId) {
     return repository.watchEmergencyAlerts(userId);
   });
   ```

4. **Lazy Loading**: Load features on demand
   ```dart
   final communityEventsProvider = FutureProvider.family((ref, filters) {
     // Lazy load with filters
   });
   ```

## Code Organization Summary

```
Core         → Utilities, Constants, Theme (No dependencies)
      ↓
Domain       → Entities, Interfaces, Business Logic (Core only)
      ↓
Data         → Repositories, Models, Datasources (Core + Domain)
      ↓
Presentation → UI, State, Navigation (All layers)
```

---

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md) and [SETUP.md](SETUP.md)
