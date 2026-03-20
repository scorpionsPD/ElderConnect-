import 'package:elderconnect_plus/src/core/constants/app_constants.dart';
import 'package:elderconnect_plus/src/core/theme/app_theme.dart';
import 'package:elderconnect_plus/src/core/utils/location_service.dart';
import 'package:elderconnect_plus/src/domain/entities/user_entity.dart';
import 'package:elderconnect_plus/src/presentation/providers/auth_provider.dart';
import 'package:elderconnect_plus/src/presentation/providers/companion_provider.dart';
import 'package:elderconnect_plus/src/presentation/providers/emergency_provider.dart';
import 'package:elderconnect_plus/src/presentation/providers/health_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher_string.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  Future<void> _handleEmergencyAction(
    BuildContext context,
    WidgetRef ref,
    UserEntity user,
  ) async {
    final emergencyPhone = (user.emergencyContactPhone ?? '').trim();
    if (emergencyPhone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Add an emergency contact phone in Settings first'),
        ),
      );
      context.pushNamed('settings');
      return;
    }

    CurrentLocationData? currentLocation;
    try {
      currentLocation = await LocationService().getCurrentLocationWithAddress();
    } catch (_) {
      currentLocation = null;
    }

    final description = currentLocation?.address?.isNotEmpty == true
        ? 'Emergency alert triggered from mobile home screen. Current address: ${currentLocation!.address}'
        : 'Emergency alert triggered from mobile home screen';

    await ref.read(emergencyActionProvider.notifier).trigger(
          userId: user.id,
          alertType: AppConstants.alertTypes.first,
          description: description,
          locationLatitude: currentLocation?.latitude,
          locationLongitude: currentLocation?.longitude,
        );

    final actionState = ref.read(emergencyActionProvider);
    if (actionState.hasError) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(actionState.error.toString())),
        );
      }
      return;
    }

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Emergency alert sent. Calling emergency contact now.'),
        ),
      );
    }

    final dialNumber = emergencyPhone.replaceAll(RegExp(r'\s+'), '');
    await launchUrlString('tel:$dialNumber');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateNotifierProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFC),
      body: SafeArea(
        bottom: false,
        child: authState.when(
          data: (user) {
            if (user == null) {
              return Center(
                child: ElevatedButton(
                  onPressed: () => context.goNamed('login'),
                  child: const Text('Go to Login'),
                ),
              );
            }

            final todaysCheckin =
                ref.watch(todaysHealthCheckinProvider(user.id));
            final requests = user.role == AppConstants.roleVolunteer
                ? ref.watch(volunteerCompanionRequestsProvider(user.id))
                : ref.watch(elderCompanionRequestsProvider(user.id));
            final shouldShowDonationPrompt =
              AppConstants.enableDonations &&
              (user.role == AppConstants.roleElder ||
                user.role == AppConstants.roleFamily);

            return AnnotatedRegion<SystemUiOverlayStyle>(
              value: SystemUiOverlayStyle.dark,
              child: RefreshIndicator(
                onRefresh: () async {
                  ref.invalidate(todaysHealthCheckinProvider(user.id));
                  if (user.role == AppConstants.roleVolunteer) {
                    ref.invalidate(volunteerCompanionRequestsProvider(user.id));
                  } else {
                    ref.invalidate(elderCompanionRequestsProvider(user.id));
                  }
                },
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(18, 18, 18, 120),
                  children: [
                    const SizedBox(height: 8),
                    _HeroCard(
                      user: user,
                      onPrimaryTap: () => context.pushNamed('health'),
                      onSecondaryTap: () => context.goNamed('companions'),
                    ),
                    const SizedBox(height: 18),
                    _SectionCard(
                      title: 'Today at a glance',
                      accent: const Color(0xFFDDEAFE),
                      icon: Icons.dashboard_customize_outlined,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _StatusCard(
                                title: 'Health Check-in',
                                description:
                                    'Share today\'s wellbeing in under 30 seconds.',
                                value: todaysCheckin.when(
                                  data: (checkin) =>
                                      checkin == null ? 'Pending' : 'Completed',
                                  loading: () => 'Loading',
                                  error: (_, __) => 'Unavailable',
                                ),
                                icon: Icons.favorite_outline,
                                color: AppTheme.successColor,
                                onTap: () => context.pushNamed('health'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _StatusCard(
                                title: 'Support Requests',
                                description:
                                    'Track and respond to active care requests.',
                                value: requests.when(
                                  data: (items) => '${items.length} open',
                                  loading: () => 'Loading',
                                  error: (_, __) => 'Unavailable',
                                ),
                                icon: Icons.volunteer_activism_outlined,
                                color: AppTheme.primaryColor,
                                onTap: () => context.goNamed('companions'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (shouldShowDonationPrompt) ...[
                      _SectionCard(
                        title: 'Support our care community',
                        accent: const Color(0xFFCCFBF1),
                        icon: Icons.volunteer_activism_outlined,
                        children: [
                          const Text(
                            'If you feel comfortable, your contribution helps us continue companion visits and wellness support for elders.',
                            style: TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 14,
                              height: 1.45,
                            ),
                          ),
                          const SizedBox(height: 14),
                          FilledButton.icon(
                            onPressed: () => context.pushNamed('donate'),
                            icon: const Icon(Icons.favorite_border),
                            label: const Text('Support with a donation'),
                            style: FilledButton.styleFrom(
                              backgroundColor: const Color(0xFF0EA5A4),
                              foregroundColor: Colors.white,
                              minimumSize: const Size.fromHeight(48),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                    ],
                    _SectionCard(
                      title: 'Quick actions',
                      accent: const Color(0xFFD1FAE5),
                      icon: Icons.flash_on_outlined,
                      children: [
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: 1.06,
                          children: [
                            _ActionTile(
                              label: 'SOS Emergency',
                              icon: Icons.sos,
                              color: AppTheme.errorColor,
                              subtitle: 'Urgent help',
                              onTap: () => _handleEmergencyAction(
                                context,
                                ref,
                                user,
                              ),
                            ),
                            _ActionTile(
                              label: 'Daily Check-in',
                              icon: Icons.check_circle_outline,
                              color: AppTheme.successColor,
                              subtitle: 'Health update',
                              onTap: () => context.pushNamed('health'),
                            ),
                            if (user.role == AppConstants.roleElder)
                              _ActionTile(
                                label: 'Family Hub',
                                icon: Icons.family_restroom_outlined,
                                color: const Color(0xFF7C3AED),
                                subtitle: 'Trusted family',
                                onTap: () => context.pushNamed('family-hub'),
                              ),
                            if (user.role == AppConstants.roleElder ||
                                user.role == AppConstants.roleFamily)
                              _ActionTile(
                                label: 'Family Chat',
                                icon: Icons.forum_outlined,
                                color: const Color(0xFF7C3AED),
                                subtitle: 'Group updates',
                                onTap: () => context.pushNamed('family-chat'),
                              ),
                            if (user.role == AppConstants.roleFamily)
                              _ActionTile(
                                label: 'Care Timeline',
                                icon: Icons.timeline,
                                color: const Color(0xFF9333EA),
                                subtitle: 'Activity feed',
                                onTap: () =>
                                    context.pushNamed('family-activity'),
                              ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const _SectionCard(
                      title: 'Suggested next steps',
                      accent: Color(0xFFFFEDD5),
                      icon: Icons.auto_awesome_outlined,
                      children: [
                        _NextStepItem(
                          text: 'Complete your daily health check-in.',
                        ),
                        _NextStepItem(
                          text: 'Review companion requests near you.',
                        ),
                        _NextStepItem(
                          text:
                              'Start a message or video check-in with your support network.',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(AppTheme.paddingLarge),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 36,
                    color: AppTheme.errorColor,
                  ),
                  const SizedBox(height: AppTheme.paddingSmall),
                  Text(
                    'Unable to load dashboard',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: AppTheme.paddingSmall),
                  Text(
                    error.toString(),
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textSecondary,
                        ),
                  ),
                  const SizedBox(height: AppTheme.paddingMedium),
                  ElevatedButton(
                    onPressed: () =>
                        ref.read(authStateNotifierProvider.notifier).logout(),
                    child: const Text('Reset Session'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  final UserEntity user;
  final VoidCallback onPrimaryTap;
  final VoidCallback onSecondaryTap;

  const _HeroCard({
    required this.user,
    required this.onPrimaryTap,
    required this.onSecondaryTap,
  });

  @override
  Widget build(BuildContext context) {
    final greetingName = user.firstName.isEmpty ? 'Member' : user.firstName;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        gradient: AppTheme.heroGradient,
        boxShadow: AppTheme.heroShadow,
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Care hub',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Welcome back, $greetingName',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          height: 1.1,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Everything important for today is organised here, from wellbeing updates to support requests.',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.78),
                          fontSize: 14,
                          height: 1.45,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: const Icon(
                    Icons.eco_outlined,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _HeroPill(
                  icon: Icons.badge_outlined,
                  text: user.role,
                ),
                _HeroPill(
                  icon: Icons.verified_user_outlined,
                  text: user.isVerified ? 'Verified' : 'Setup pending',
                ),
                _HeroPill(
                  icon: Icons.location_on_outlined,
                  text: user.city?.isNotEmpty == true
                      ? user.city!
                      : 'Location not set',
                ),
              ],
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF0F172A),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: onPrimaryTap,
                    child: const Text('Start check-in'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: BorderSide(
                        color: Colors.white.withValues(alpha: 0.5),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: onSecondaryTap,
                    child: const Text('View requests'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroPill extends StatelessWidget {
  final IconData icon;
  final String text;

  const _HeroPill({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color accent;
  final List<Widget> children;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.accent,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x110F172A),
            blurRadius: 24,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: accent,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: AppTheme.textPrimary),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  final String title;
  final String description;
  final String value;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _StatusCard({
    required this.title,
    required this.description,
    required this.value,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFF8FAFC),
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 13,
                  height: 1.35,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                value,
                style: TextStyle(
                  color: color,
                  fontWeight: FontWeight.w800,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final String label;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionTile({
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFF8FAFC),
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color),
              ),
              const Spacer(),
              Text(
                label,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NextStepItem extends StatelessWidget {
  final String text;

  const _NextStepItem({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 2),
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: AppTheme.secondaryLight,
              borderRadius: BorderRadius.circular(999),
            ),
            child: const Icon(
              Icons.check,
              size: 14,
              color: AppTheme.secondaryDark,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 14,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
