import 'package:elderconnect_plus/src/presentation/pages/auth/register_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Register screen renders create account CTA', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: RegisterScreen(),
        ),
      ),
    );

    expect(find.text('Create Your Account'), findsOneWidget);
    expect(find.text('Create Account'), findsOneWidget);
  });
}
