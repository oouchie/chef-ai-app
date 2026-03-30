import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/constants/app_strings.dart';
import '../../../core/router/app_router.dart' show markWalkthroughComplete;
import '../../../core/router/route_names.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/gradient_button.dart';

const _kWalkthroughSeenKey = 'walkthrough_seen';

/// Check if the user has completed the walkthrough.
Future<bool> hasSeenWalkthrough() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool(_kWalkthroughSeenKey) ?? false;
}

/// Mark the walkthrough as completed.
Future<void> markWalkthroughSeen() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool(_kWalkthroughSeenKey, true);
}

class _WalkthroughPage {
  final String title;
  final String subtitle;
  final IconData icon;
  final List<Color> gradientColors;

  const _WalkthroughPage({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.gradientColors,
  });
}

const _pages = [
  _WalkthroughPage(
    title: 'Tell Us Your Ingredients',
    subtitle:
        'Type, speak, or snap a photo of what you have on hand. Our AI understands natural language — just say it like you would to a friend.',
    icon: Icons.edit_note_rounded,
    gradientColors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
  ),
  _WalkthroughPage(
    title: 'Get Personalized Recipes',
    subtitle:
        'Our AI chef generates complete recipes from 14 world cuisines tailored to YOUR ingredients, dietary needs, and taste preferences.',
    icon: Icons.auto_awesome,
    gradientColors: [Color(0xFFFF6B35), Color(0xFFF7931E)],
  ),
  _WalkthroughPage(
    title: 'Cook Step-by-Step',
    subtitle:
        'Follow clear instructions with built-in timers, unit converter, and ingredient substitutions. Everything you need in one place.',
    icon: Icons.local_fire_department_rounded,
    gradientColors: [Color(0xFFEF4444), Color(0xFFF97316)],
  ),
  _WalkthroughPage(
    title: 'Plan, Save & Shop',
    subtitle:
        'Save your favorites, plan weekly meals, and auto-generate shopping lists. Never waste food or wonder "what\'s for dinner" again.',
    icon: Icons.calendar_month_rounded,
    gradientColors: [Color(0xFF10B981), Color(0xFF34D399)],
  ),
];

class WalkthroughScreen extends StatefulWidget {
  const WalkthroughScreen({super.key});

  @override
  State<WalkthroughScreen> createState() => _WalkthroughScreenState();
}

class _WalkthroughScreenState extends State<WalkthroughScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    await markWalkthroughSeen();
    markWalkthroughComplete();
    if (mounted) {
      context.go(RouteNames.home);
    }
  }

  void _next() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    } else {
      _finish();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final size = MediaQuery.of(context).size;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [const Color(0xFF0F0F1A), const Color(0xFF1A1A2E)]
                : [Colors.white, const Color(0xFFF8FAFC)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Skip button
              Align(
                alignment: Alignment.centerRight,
                child: Padding(
                  padding: const EdgeInsets.only(right: 16, top: 8),
                  child: TextButton(
                    onPressed: _finish,
                    child: Text(
                      'Skip',
                      style: TextStyle(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ),

              // Page content
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (index) =>
                      setState(() => _currentPage = index),
                  itemCount: _pages.length,
                  itemBuilder: (context, index) {
                    final page = _pages[index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Icon circle
                          Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                colors: page.gradientColors,
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color:
                                      page.gradientColors[0].withAlpha(80),
                                  blurRadius: 30,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            child: Icon(
                              page.icon,
                              size: 52,
                              color: Colors.white,
                            ),
                          ),

                          SizedBox(height: size.height * 0.05),

                          // Title
                          Text(
                            page.title,
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              height: 1.2,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),

                          // Subtitle
                          Text(
                            page.subtitle,
                            style: theme.textTheme.bodyLarge?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              // Bottom section: dots + button
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
                child: Column(
                  children: [
                    // Page dots
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _pages.length,
                        (index) => AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: _currentPage == index ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(4),
                            color: _currentPage == index
                                ? AppColors.primary
                                : theme.colorScheme.outlineVariant,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Action button
                    SizedBox(
                      width: double.infinity,
                      child: GradientButton(
                        onPressed: _next,
                        child: Text(
                          _currentPage == _pages.length - 1
                              ? 'Get Started'
                              : 'Next',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
