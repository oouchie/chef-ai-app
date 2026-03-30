import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/services/purchase_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../features/profile/domain/profile_provider.dart';

class PaywallScreen extends ConsumerStatefulWidget {
  const PaywallScreen({super.key});

  @override
  ConsumerState<PaywallScreen> createState() => _PaywallScreenState();
}

class _PaywallScreenState extends ConsumerState<PaywallScreen> {
  bool _loading = false;
  bool _restoring = false;

  Future<void> _subscribe() async {
    setState(() => _loading = true);
    try {
      final result = await PurchaseService.purchasePremium();
      if (!mounted) return;
      if (result.success) {
        ref.read(profileProvider.notifier).checkPremium();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Welcome to Premium!'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pop(true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Purchase was not completed.')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _restore() async {
    setState(() => _restoring = true);
    try {
      final result = await PurchaseService.restorePurchases();
      if (!mounted) return;
      if (result.isPremium) {
        ref.read(profileProvider.notifier).checkPremium();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Purchases restored successfully.'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pop(true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No active purchases found.')),
        );
      }
    } finally {
      if (mounted) setState(() => _restoring = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Close
              Align(
                alignment: Alignment.centerRight,
                child: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(false),
                ),
              ),

              // Header
              const Icon(
                Icons.workspace_premium_rounded,
                size: 64,
                color: AppColors.primary,
              ),
              const SizedBox(height: 12),
              const Text(
                'Go Premium',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Unlock the full Recipe Pilot experience',
                style: TextStyle(
                  fontSize: 15,
                  color: Colors.white.withValues(alpha: 0.7),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),

              // Comparison table
              _ComparisonTable(),
              const SizedBox(height: 28),

              // Price
              GlassCard(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  children: [
                    const Text(
                      '\$4.99',
                      style: TextStyle(
                        fontSize: 42,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                      ),
                    ),
                    const Text(
                      'per month',
                      style: TextStyle(
                          fontSize: 14, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: GradientButton(
                        onPressed: _loading ? null : _subscribe,
                        isLoading: _loading,
                        height: 52,
                        child: const Text(
                          'Subscribe Now',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Restore
              _restoring
                  ? const SizedBox(
                      height: 36,
                      child: Center(
                          child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )),
                    )
                  : TextButton(
                      onPressed: _restore,
                      child: const Text('Restore Purchases'),
                    ),

              const SizedBox(height: 4),
              const Text(
                '\u2022 Payment will be charged to your iTunes Account at confirmation\n'
                '\u2022 Subscription automatically renews unless cancelled 24 hours before the end of the current period\n'
                '\u2022 Manage subscriptions in Account Settings after purchase',
                style: TextStyle(
                  fontSize: 11,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'By subscribing, you agree to our ',
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  GestureDetector(
                    onTap: () => launchUrl(
                      Uri.parse('https://1865freemoney.com/terms'),
                      mode: LaunchMode.externalApplication,
                    ),
                    child: const Text(
                      'Terms of Use',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.primary,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                  const Text(
                    ' and ',
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => launchUrl(
                      Uri.parse('https://1865freemoney.com/privacy'),
                      mode: LaunchMode.externalApplication,
                    ),
                    child: const Text(
                      'Privacy Policy',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.primary,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Comparison table
// ---------------------------------------------------------------------------

class _ComparisonTable extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: _TierColumn(isPremium: false)),
        const SizedBox(width: 12),
        Expanded(child: _TierColumn(isPremium: true)),
      ],
    );
  }
}

class _TierColumn extends StatelessWidget {
  const _TierColumn({required this.isPremium});

  final bool isPremium;

  static const _freeFeatures = [
    (text: '10 recipes/day', included: true),
    (text: 'Basic cooking tools', included: true),
    (text: 'Save recipes', included: true),
    (text: 'Shopping list', included: true),
    (text: 'Unlimited recipes', included: false),
    (text: 'Restaurant recipes', included: false),
    (text: 'Meal planning', included: false),
    (text: 'Voice input', included: false),
    (text: 'Priority support', included: false),
  ];

  static const _premiumFeatures = [
    (text: '10 recipes/day', included: true),
    (text: 'Basic cooking tools', included: true),
    (text: 'Save recipes', included: true),
    (text: 'Shopping list', included: true),
    (text: 'Unlimited recipes', included: true),
    (text: 'Restaurant recipes', included: true),
    (text: 'Meal planning', included: true),
    (text: 'Voice input', included: true),
    (text: 'Priority support', included: true),
  ];

  @override
  Widget build(BuildContext context) {
    final features = isPremium ? _premiumFeatures : _freeFeatures;

    return Container(
      decoration: BoxDecoration(
        color: isPremium
            ? AppColors.primary.withOpacity(0.06)
            : Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPremium
              ? AppColors.primary.withOpacity(0.4)
              : Colors.transparent,
          width: isPremium ? 1.5 : 1,
        ),
      ),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: isPremium
                  ? AppColors.primary
                  : Theme.of(context)
                      .colorScheme
                      .surfaceContainerHighest,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(15),
                topRight: Radius.circular(15),
              ),
            ),
            child: Text(
              isPremium ? 'Premium' : 'Free',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: isPremium
                    ? Colors.white
                    : Colors.white70,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: features.map((f) {
                final strikethrough =
                    !isPremium && !f.included;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        (isPremium || f.included)
                            ? Icons.check_circle
                            : Icons.cancel,
                        size: 16,
                        color: (isPremium && f.included)
                            ? AppColors.success
                            : f.included
                                ? AppColors.success
                                : AppColors.error.withOpacity(0.6),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          f.text,
                          style: TextStyle(
                            fontSize: 12,
                            color: strikethrough
                                ? AppColors.textSecondary
                                : Colors.white,
                            decoration: strikethrough
                                ? TextDecoration.lineThrough
                                : null,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
