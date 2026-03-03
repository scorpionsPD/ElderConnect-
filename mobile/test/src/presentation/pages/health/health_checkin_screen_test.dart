import 'package:dartz/dartz.dart';
import 'package:elderconnect_plus/src/core/utils/failures.dart';
import 'package:elderconnect_plus/src/domain/entities/health_checkin_entity.dart';
import 'package:elderconnect_plus/src/domain/entities/user_entity.dart';
import 'package:elderconnect_plus/src/domain/repositories/auth_repository.dart';
import 'package:elderconnect_plus/src/domain/repositories/health_repository.dart';
import 'package:elderconnect_plus/src/presentation/pages/health/health_checkin_screen.dart';
import 'package:elderconnect_plus/src/presentation/providers/auth_provider.dart';
import 'package:elderconnect_plus/src/presentation/providers/health_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final user = _testUser();

  testWidgets('Health check-in screen renders submit button', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authStateNotifierProvider.overrideWith(
            (ref) => AuthStateNotifier(FakeAuthRepository(user)),
          ),
          healthRepositoryProvider
              .overrideWith((ref) => FakeHealthRepository()),
        ],
        child: const MaterialApp(
          home: HealthCheckinScreen(),
        ),
      ),
    );

    await tester.pump();
    expect(find.text('Submit Check-in'), findsOneWidget);
  });
}

UserEntity _testUser() => UserEntity(
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ELDER',
      isActive: true,
      isVerified: true,
      createdAt: DateTime(2026, 1, 1),
      updatedAt: DateTime(2026, 1, 1),
    );

class FakeAuthRepository implements AuthRepository {
  final UserEntity user;

  FakeAuthRepository(this.user);

  @override
  Future<Either<Failure, void>> disableTwoFactor() async => const Right(null);
  @override
  Future<Either<Failure, void>> enableTwoFactor() async => const Right(null);
  @override
  Future<Either<Failure, UserEntity>> getCurrentUser() async => Right(user);
  @override
  Future<Either<Failure, UserEntity>> loginUser({
    required String email,
    required String password,
  }) async =>
      Right(user);
  @override
  Future<Either<Failure, void>> logout() async => const Right(null);
  @override
  Future<Either<Failure, void>> requestOtpLogin({
    required String email,
  }) async =>
      const Right(null);
  @override
  Future<Either<Failure, UserEntity>> verifyOtpLogin({
    required String email,
    required String token,
  }) async =>
      Right(user);
  @override
  Future<Either<Failure, UserEntity>> registerUser({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String role,
    required bool acceptTerms,
    String? phoneNumber,
    DateTime? dateOfBirth,
    String? addressLine1,
    String? city,
    String? postcode,
    String? emergencyContactName,
    String? emergencyContactPhone,
    bool? dataConsent,
  }) async =>
      Right(user);
  @override
  Future<Either<Failure, void>> resetPassword(String email) async =>
      const Right(null);
  @override
  Future<Either<Failure, void>> updateProfile({
    required String userId,
    String? firstName,
    String? lastName,
    String? phoneNumber,
    String? bio,
    String? profilePictureUrl,
  }) async =>
      const Right(null);
  @override
  Future<Either<Failure, void>> verifyEmail(String token) async =>
      const Right(null);
  @override
  Stream<UserEntity?> watchAuthUser() async* {
    yield user;
  }
}

class FakeHealthRepository implements HealthRepository {
  @override
  Future<Either<Failure, HealthCheckinEntity>> createCheckin({
    required String userId,
    int? moodLevel,
    int? energyLevel,
    int? physicalPainLevel,
    int? sleepQuality,
    String? notes,
    bool? medicationTaken,
    int? mealsEaten,
    int? waterIntakeGlasses,
    int? exerciseMinutes,
    int? socialInteractionsCount,
  }) async =>
      Right(
        HealthCheckinEntity(
          id: 'checkin-1',
          userId: userId,
          checkinDate: DateTime(2026, 1, 1),
        ),
      );

  @override
  Future<Either<Failure, List<HealthCheckinEntity>>> getAllCheckins(
          String userId) async =>
      const Right([]);

  @override
  Future<Either<Failure, List<HealthCheckinEntity>>> getCheckinsForPeriod({
    required String userId,
    required DateTime startDate,
    required DateTime endDate,
  }) async =>
      const Right([]);

  @override
  Future<Either<Failure, HealthCheckinEntity?>> getTodaysCheckin(
          String userId) async =>
      const Right(null);

  @override
  Stream<HealthCheckinEntity> watchDailyCheckins(String userId) =>
      const Stream<HealthCheckinEntity>.empty();
}
