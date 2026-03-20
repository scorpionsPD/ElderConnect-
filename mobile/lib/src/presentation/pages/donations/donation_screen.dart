import 'package:elderconnect_plus/src/core/constants/app_constants.dart';
import 'package:elderconnect_plus/src/presentation/providers/auth_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:go_router/go_router.dart';

class DonationScreen extends ConsumerStatefulWidget {
  const DonationScreen({super.key});

  @override
  ConsumerState<DonationScreen> createState() => _DonationScreenState();
}

class _DonationScreenState extends ConsumerState<DonationScreen> {
  final TextEditingController _customAmountController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();

  double _selectedAmount = 25;
  bool _useCustomAmount = false;
  bool _isAnonymous = false;
  bool _isProcessing = false;

  @override
  void dispose() {
    _customAmountController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  double get _finalAmount {
    if (!_useCustomAmount) return _selectedAmount;
    return double.tryParse(_customAmountController.text.trim()) ?? 0;
  }

  Future<void> _donate() async {
    final amount = _finalAmount;
    if (amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid amount greater than 0')),
      );
      return;
    }

    final user = ref.read(authStateNotifierProvider).valueOrNull;
    final edge = ref.read(edgeFunctionsServiceProvider);

    setState(() => _isProcessing = true);

    String? donationId;
    String? paymentIntentId;

    try {
      final intentPayload = await edge.createDonationIntent(
        amount: amount,
        currency: AppConstants.donationCurrency,
        donationType: 'ONE_TIME',
        donationMethod: 'CARD',
        isAnonymous: _isAnonymous,
        donorEmail: _isAnonymous ? null : user?.email,
        donorMessage: _messageController.text.trim().isEmpty
            ? null
            : _messageController.text.trim(),
        donorId: user?.id,
      );

      donationId = intentPayload['donation_id']?.toString();
      paymentIntentId = intentPayload['payment_intent_id']?.toString();
      final clientSecret = intentPayload['client_secret']?.toString();
      final runtimePublishableKey = intentPayload['publishable_key']?.toString();

      final configuredPublishableKey = AppConstants.stripePubKey.startsWith('pk_')
          ? AppConstants.stripePubKey
          : '';
      final currentPublishableKey = Stripe.publishableKey.startsWith('pk_')
          ? Stripe.publishableKey
          : configuredPublishableKey;
      final activePublishableKey =
          runtimePublishableKey != null && runtimePublishableKey.startsWith('pk_')
              ? runtimePublishableKey
              : currentPublishableKey;

      if (donationId == null || donationId.isEmpty || clientSecret == null) {
        throw Exception('Failed to initialize payment. Please try again.');
      }

      if (!activePublishableKey.startsWith('pk_')) {
        throw Exception('Stripe publishable key is not configured.');
      }

      if (Stripe.publishableKey != activePublishableKey) {
        Stripe.publishableKey = activePublishableKey;
        await Stripe.instance.applySettings();
      }

      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'ElderConnect+',
          style: ThemeMode.system,
          allowsDelayedPaymentMethods: true,
          applePay: PaymentSheetApplePay(
            merchantCountryCode: AppConstants.stripeMerchantCountryCode,
          ),
        ),
      );

      await Stripe.instance.presentPaymentSheet();

      await edge.processDonation(
        donationId: donationId,
        status: 'COMPLETED',
        paymentIntentId: paymentIntentId,
        amount: amount,
        donorEmail: _isAnonymous ? null : user?.email,
        isAnonymous: _isAnonymous,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Thank you! Donation completed successfully.')),
      );
      context.pop();
    } on StripeException catch (error) {
      final canceled = error.error.code == FailureCode.Canceled;
      if (donationId != null && !canceled) {
        await edge.processDonation(
          donationId: donationId,
          status: 'FAILED',
          paymentIntentId: paymentIntentId,
          amount: amount,
          donorEmail: _isAnonymous ? null : user?.email,
          isAnonymous: _isAnonymous,
        );
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            canceled
                ? 'Payment canceled.'
                : 'Payment failed: ${error.error.localizedMessage ?? error.error.message}',
          ),
        ),
      );
    } catch (error) {
      if (donationId != null) {
        await edge.processDonation(
          donationId: donationId,
          status: 'FAILED',
          paymentIntentId: paymentIntentId,
          amount: amount,
          donorEmail: _isAnonymous ? null : user?.email,
          isAnonymous: _isAnonymous,
        );
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Donation failed: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final amount = _finalAmount;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Support ElderConnect+'),
        leading: IconButton(
          icon: Icon(
            Navigator.of(context).canPop() ? Icons.arrow_back : Icons.home_outlined,
          ),
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              context.go('/home');
            }
          },
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Your donation funds companionship visits, family support tools, and emergency response services.',
            style: TextStyle(height: 1.4),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              for (final value in const [10.0, 25.0, 50.0, 100.0])
                ChoiceChip(
                  label: Text('£${value.toStringAsFixed(0)}'),
                  selected: !_useCustomAmount && _selectedAmount == value,
                  onSelected: (_) {
                    setState(() {
                      _useCustomAmount = false;
                      _selectedAmount = value;
                    });
                  },
                ),
              ChoiceChip(
                label: const Text('Custom'),
                selected: _useCustomAmount,
                onSelected: (_) {
                  setState(() => _useCustomAmount = true);
                },
              ),
            ],
          ),
          if (_useCustomAmount) ...[
            const SizedBox(height: 12),
            TextField(
              controller: _customAmountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Custom amount (GBP)',
                prefixText: '£ ',
                border: OutlineInputBorder(),
              ),
            ),
          ],
          const SizedBox(height: 16),
          TextField(
            controller: _messageController,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Message (optional)',
              border: OutlineInputBorder(),
              hintText: 'Any note to share with our community team',
            ),
          ),
          const SizedBox(height: 12),
          SwitchListTile(
            value: _isAnonymous,
            title: const Text('Donate anonymously'),
            onChanged: (value) => setState(() => _isAnonymous = value),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: const Color(0xFFF1F5F9),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                Text(
                  '£${amount.toStringAsFixed(2)}',
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: _isProcessing ? null : _donate,
            icon: const Icon(Icons.favorite_outline),
            label: Text(_isProcessing ? 'Processing...' : 'Donate securely'),
          ),
          const SizedBox(height: 10),
          const Text(
            'Card and Apple Pay are supported by Stripe based on your device/browser availability.',
            style: TextStyle(fontSize: 12, color: Colors.black54),
          ),
        ],
      ),
    );
  }
}
