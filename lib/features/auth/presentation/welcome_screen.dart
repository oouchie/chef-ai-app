import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_strings.dart';
import '../../../core/router/route_names.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/gradient_button.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F1A),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0F0F1A), Color(0xFF1A1A2E)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                children: [
                  SizedBox(height: size.height * 0.06),

                  // Logo / Icon
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF6B35), Color(0xFFF7931E)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withAlpha(100),
                          blurRadius: 30,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.restaurant_menu,
                      size: 48,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // App name
                  Text(
                    AppStrings.appName,
                    style: theme.textTheme.headlineLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      fontSize: 36,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your AI-Powered Recipe Assistant',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: Colors.white70,
                      fontSize: 16,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  SizedBox(height: size.height * 0.05),

                  // Feature highlights
                  const _FeatureRow(
                    icon: Icons.auto_awesome,
                    title: 'AI Recipe Generation',
                    subtitle:
                        'Tell us your ingredients, get personalized recipes in seconds',
                  ),
                  const SizedBox(height: 20),
                  const _FeatureRow(
                    icon: Icons.public,
                    title: '14 World Cuisines',
                    subtitle:
                        'From Italian to Thai, African to Caribbean — authentic dishes',
                  ),
                  const SizedBox(height: 20),
                  const _FeatureRow(
                    icon: Icons.calendar_month,
                    title: 'Meal Planning & Lists',
                    subtitle:
                        'Plan your week and auto-generate shopping lists',
                  ),
                  const SizedBox(height: 20),
                  const _FeatureRow(
                    icon: Icons.restaurant,
                    title: 'Restaurant Copycat Recipes',
                    subtitle:
                        'Recreate your favorite dishes from popular restaurants',
                  ),

                  SizedBox(height: size.height * 0.05),

                  // Stats row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      const _StatItem(value: '50K+', label: 'Recipes'),
                      _StatDivider(),
                      const _StatItem(value: '4.8', label: 'Rating'),
                      _StatDivider(),
                      const _StatItem(value: '14', label: 'Cuisines'),
                    ],
                  ),

                  SizedBox(height: size.height * 0.05),

                  // CTA buttons
                  GradientButton(
                    onPressed: () => context.go(RouteNames.signup),
                    child: const Text('Get Started'),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => context.go(RouteNames.login),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        side: const BorderSide(color: Colors.white24),
                        foregroundColor: Colors.white,
                      ),
                      child: const Text(
                        'I Already Have an Account',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Branding footer
                  Text(
                    AppStrings.poweredBy,
                    style: TextStyle(color: Colors.white.withAlpha(90), fontSize: 11),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    AppStrings.brandTagline,
                    style: TextStyle(color: Colors.white.withAlpha(65), fontSize: 10),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _FeatureRow extends StatelessWidget {
  const _FeatureRow({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: Colors.white12,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: const Color(0xFFFF6B35), size: 22),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                subtitle,
                style: const TextStyle(
                  color: Colors.white54,
                  fontSize: 13,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Color(0xFFFF6B35),
            fontWeight: FontWeight.bold,
            fontSize: 24,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(color: Colors.white54, fontSize: 12),
        ),
      ],
    );
  }
}

class _StatDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 30,
      color: Colors.white12,
    );
  }
}
