import 'package:elderconnect_plus/src/data/datasources/remote/edge_functions_service.dart';
import 'package:elderconnect_plus/src/data/datasources/remote/supabase_service.dart';
import 'package:elderconnect_plus/src/data/repositories/auth_repository_impl.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  late MockSupabaseAuthService supabaseService;
  late MockEdgeFunctionsService edgeFunctionsService;
  late AuthRepositoryImpl repository;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    supabaseService = MockSupabaseAuthService();
    edgeFunctionsService = MockEdgeFunctionsService();
    repository = AuthRepositoryImpl(supabaseService, edgeFunctionsService);
  });

  group('AuthRepositoryImpl', () {
    test('getCurrentUser returns failure when no authenticated user', () async {
      when(() => supabaseService.currentUser).thenReturn(null);

      final result = await repository.getCurrentUser();
      final message = result.fold((failure) => failure.message, (_) => 'ok');

      expect(message, 'No authenticated user');
    });

    test('logout delegates to Supabase auth signOut', () async {
      when(() => supabaseService.signOut()).thenAnswer((_) async {});

      final result = await repository.logout();

      expect(result.isRight(), true);
      verify(() => supabaseService.signOut()).called(1);
    });
  });
}

class MockSupabaseAuthService extends Mock implements SupabaseAuthService {}

class MockEdgeFunctionsService extends Mock implements EdgeFunctionsService {}
