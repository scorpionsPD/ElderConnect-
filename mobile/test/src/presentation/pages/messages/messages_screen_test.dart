import 'package:dartz/dartz.dart';
import 'package:elderconnect_plus/src/core/utils/failures.dart';
import 'package:elderconnect_plus/src/domain/entities/message_entity.dart';
import 'package:elderconnect_plus/src/domain/entities/user_entity.dart';
import 'package:elderconnect_plus/src/domain/repositories/auth_repository.dart';
import 'package:elderconnect_plus/src/domain/repositories/messaging_repository.dart';
import 'package:elderconnect_plus/src/presentation/pages/messages/messages_screen.dart';
import 'package:elderconnect_plus/src/presentation/providers/auth_provider.dart';
import 'package:elderconnect_plus/src/presentation/providers/messaging_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final user = _testUser();

  testWidgets('Messages screen renders scaffold', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authStateNotifierProvider.overrideWith(
            (ref) => AuthStateNotifier(FakeAuthRepository(user)),
          ),
          messagingRepositoryProvider
              .overrideWith((ref) => FakeMessagingRepository(user.id)),
        ],
        child: const MaterialApp(
          home: MessagesScreen(),
        ),
      ),
    );

    await tester.pump();
    expect(find.byType(Scaffold), findsOneWidget);
    expect(find.text('Messages'), findsOneWidget);
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
  Future<Either<Failure, String?>> requestOtpLoginWithDetails({
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
    String? addressLine1,
    String? city,
    String? postcode,
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

class FakeMessagingRepository implements MessagingRepository {
  final String userId;

  FakeMessagingRepository(this.userId);

  @override
  Future<Either<Failure, void>> deleteMessage(String messageId) async =>
      const Right(null);

  @override
  Future<Either<Failure, List<MessageEntity>>> getConversation({
    required String userId,
    required String recipientId,
  }) async =>
      const Right([]);

  @override
  Future<Either<Failure, void>> markAsRead(String messageId) async =>
      const Right(null);

  @override
  Future<Either<Failure, MessageEntity>> sendMessage({
    required String senderId,
    required String recipientId,
    required String messageText,
    String? messageType,
    String? attachmentUrl,
  }) async =>
      Right(
        MessageEntity(
          id: 'msg-1',
          senderId: senderId,
          recipientId: recipientId,
          messageText: messageText,
          isRead: false,
          createdAt: DateTime(2026, 1, 1),
        ),
      );

  @override
  Stream<List<MessageEntity>> watchConversation({
    required String userId,
    required String recipientId,
  }) async* {
    yield [];
  }

  @override
  Stream<MessageEntity> watchMessages(String userId) async* {
    yield MessageEntity(
      id: 'msg-latest',
      senderId: userId,
      recipientId: 'recipient-1',
      messageText: 'Hello',
      isRead: false,
      createdAt: DateTime(2026, 1, 1),
    );
  }

  @override
  Future<Either<Failure, void>> setTypingStatus({
    required String userId,
    required String recipientId,
    required bool isTyping,
  }) async =>
      const Right(null);

  @override
  Stream<bool> watchTypingStatus({
    required String userId,
    required String recipientId,
  }) async* {
    yield false;
  }
}
