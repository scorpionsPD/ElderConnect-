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

    expect(find.text('ElderConnect+ Onboarding'), findsOneWidget);
    expect(find.text('Guided onboarding'), findsOneWidget);
    expect(find.text('Next'), findsOneWidget);
  });
}
