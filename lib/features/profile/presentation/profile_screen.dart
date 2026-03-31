import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../domain/profile_provider.dart';
import '../../../core/services/purchase_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/router/app_router.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../features/recipe_generation/domain/chat_provider.dart';
import '../../../features/subscription/presentation/paywall_screen.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    // Reload profile on every visit to ensure fresh data
    Future.microtask(() {
      ref.read(profileProvider.notifier).loadProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    final chatState = ref.watch(chatProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        centerTitle: false,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        children: [
          // User info
          _UserInfoSection(profileState: profileState),
          const SizedBox(height: 16),

          // Daily usage
          _DailyUsageSection(profileState: profileState),
          const SizedBox(height: 16),

          // Settings
          _SettingsSection(
            profileState: profileState,
            ref: ref,
          ),
          const SizedBox(height: 16),

          // Sessions
          _SessionsSection(
            sessions: chatState.sessions,
            currentSessionId: chatState.currentSessionId,
            ref: ref,
          ),
          const SizedBox(height: 16),

          // About
          _AboutSection(),
          const SizedBox(height: 24),

          // 1865 Free Money branding
          _BrandingFooter(),
          const SizedBox(height: 16),

          // Sign out
          GradientButton(
            onPressed: () => _signOut(context, ref),
            gradient: const LinearGradient(
              colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            child: const Text('Sign Out',
                style: TextStyle(
                    fontSize: 15, fontWeight: FontWeight.w600)),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Future<void> _signOut(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Sign Out',
                style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    // Coordinated sign-out: navigates to /welcome first (unmounting providers),
    // then invalidates the Supabase session after the frame settles.
    await performSignOut();
  }
}

// ---------------------------------------------------------------------------
// User info section
// ---------------------------------------------------------------------------

class _UserInfoSection extends StatelessWidget {
  const _UserInfoSection({required this.profileState});

  final ProfileState profileState;

  @override
  Widget build(BuildContext context) {
    final profile = profileState.profile;

    return GlassCard(
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: AppColors.primary.withOpacity(0.15),
            child: Text(
              profile?.email.isNotEmpty == true
                  ? profile!.email[0].toUpperCase()
                  : '?',
              style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile?.email ?? 'Not signed in',
                  style: const TextStyle(
                      fontSize: 15, fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                if (profileState.isPremium)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF6B35), Color(0xFFF7931E)],
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.workspace_premium_rounded,
                            size: 12, color: Colors.white),
                        SizedBox(width: 4),
                        Text(
                          'Premium',
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Colors.white),
                        ),
                      ],
                    ),
                  )
                else
                  Text(
                    'Free Plan',
                    style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Daily usage section
// ---------------------------------------------------------------------------

class _DailyUsageSection extends StatelessWidget {
  const _DailyUsageSection({required this.profileState});

  final ProfileState profileState;

  @override
  Widget build(BuildContext context) {
    final used = profileState.dailyUsage;
    final max = profileState.maxDailyUsage;
    final pct = profileState.isPremium ? 1.0 : (used / max).clamp(0.0, 1.0);

    return _SectionCard(
      title: 'Daily Usage',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                profileState.isPremium
                    ? 'Unlimited recipes'
                    : '$used/$max recipes used today',
                style: const TextStyle(fontSize: 13),
              ),
              if (!profileState.isPremium)
                Text(
                  '${max - used} remaining',
                  style: TextStyle(
                      fontSize: 12,
                      color: used >= max
                          ? AppColors.error
                          : AppColors.textSecondary),
                ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct,
              minHeight: 6,
              backgroundColor: AppColors.primary.withOpacity(0.12),
              valueColor: AlwaysStoppedAnimation<Color>(
                used >= max && !profileState.isPremium
                    ? AppColors.error
                    : AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Settings section
// ---------------------------------------------------------------------------

class _SettingsSection extends ConsumerStatefulWidget {
  const _SettingsSection({
    required this.profileState,
    required this.ref,
  });

  final ProfileState profileState;
  final WidgetRef ref;

  @override
  ConsumerState<_SettingsSection> createState() => _SettingsSectionState();
}

class _SettingsSectionState extends ConsumerState<_SettingsSection> {
  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Settings',
      child: Column(
        children: [
          // Manage subscription
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.workspace_premium_outlined,
                color: AppColors.primary),
            title: const Text('Manage Subscription',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            subtitle: Text(
              widget.profileState.isPremium
                  ? 'Active — Premium'
                  : 'Free Plan — Upgrade for more',
              style: const TextStyle(fontSize: 12),
            ),
            trailing: const Icon(Icons.chevron_right, size: 18),
            onTap: () {
              if (widget.profileState.isPremium) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                        'Manage your subscription in the App Store or Google Play.'),
                  ),
                );
              } else {
                Navigator.of(context).push(
                  MaterialPageRoute(
                      builder: (_) => const PaywallScreen()),
                );
              }
            },
          ),
          const Divider(height: 1, thickness: 0.5),
          // Restore purchases
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.restore_outlined,
                color: AppColors.primary),
            title: const Text('Restore Purchases',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            trailing: const Icon(Icons.chevron_right, size: 18),
            onTap: () => _restorePurchases(context),
          ),
        ],
      ),
    );
  }

  Future<void> _restorePurchases(BuildContext context) async {
    final result = await PurchaseService.restorePurchases();
    if (!context.mounted) return;

    if (result.isPremium) {
      ref.read(profileProvider.notifier).checkPremium();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Purchases restored successfully.'),
          backgroundColor: AppColors.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No active purchases found.')),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Sessions section
// ---------------------------------------------------------------------------

class _SessionsSection extends StatelessWidget {
  const _SessionsSection({
    required this.sessions,
    required this.currentSessionId,
    required this.ref,
  });

  final List<ChatSession> sessions;
  final String? currentSessionId;
  final WidgetRef ref;

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Chat Sessions (${sessions.length})',
      child: sessions.isEmpty
          ? const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text(
                'No sessions yet. Start a conversation on the Home tab.',
                style: TextStyle(
                    fontSize: 13, color: AppColors.textSecondary),
              ),
            )
          : Column(
              children: sessions.take(5).map((s) {
                final isCurrent = s.id == currentSessionId;
                return Dismissible(
                  key: ValueKey(s.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 16),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.delete_outline,
                        color: AppColors.error),
                  ),
                  onDismissed: (_) {
                    ref.read(chatProvider.notifier).deleteSession(s.id);
                  },
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    dense: true,
                    leading: Icon(
                      Icons.chat_bubble_outline,
                      size: 18,
                      color: isCurrent
                          ? AppColors.primary
                          : AppColors.textSecondary,
                    ),
                    title: Text(
                      s.title,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: isCurrent
                            ? FontWeight.w600
                            : FontWeight.w400,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    subtitle: Text(
                      '${s.messages.length} messages · ${_formatDate(s.updatedAt)}',
                      style: const TextStyle(fontSize: 11),
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline, size: 16),
                      color: AppColors.textSecondary,
                      onPressed: () {
                        ref.read(chatProvider.notifier).deleteSession(s.id);
                      },
                      splashRadius: 16,
                    ),
                  ),
                );
              }).toList(),
            ),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.month}/${dt.day}/${dt.year}';
  }
}

// ---------------------------------------------------------------------------
// About section
// ---------------------------------------------------------------------------

class _AboutSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'About',
      child: Column(
        children: [
          _AboutTile(
            icon: Icons.info_outline,
            label: 'App Version',
            value: '1.0.2',
          ),
          const Divider(height: 1, thickness: 0.5),
          _AboutTile(
            icon: Icons.restaurant_menu,
            label: 'Recipe Pilot',
            value: 'AI-powered cooking companion',
          ),
          const Divider(height: 1, thickness: 0.5),
          ListTile(
            contentPadding: EdgeInsets.zero,
            dense: true,
            leading: const Icon(Icons.privacy_tip_outlined,
                size: 18, color: AppColors.textSecondary),
            title: const Text('Privacy Policy',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
            trailing: const Icon(Icons.open_in_new,
                size: 14, color: AppColors.textSecondary),
            onTap: () async {
              final uri = Uri.parse('https://1865freemoney.com/privacy');
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            },
          ),
          const Divider(height: 1, thickness: 0.5),
          ListTile(
            contentPadding: EdgeInsets.zero,
            dense: true,
            leading: const Icon(Icons.description_outlined,
                size: 18, color: AppColors.textSecondary),
            title: const Text('Terms of Service',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
            trailing: const Icon(Icons.open_in_new,
                size: 14, color: AppColors.textSecondary),
            onTap: () async {
              final uri = Uri.parse('https://1865freemoney.com/terms');
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            },
          ),
          const Divider(height: 1, thickness: 0.5),
          ListTile(
            contentPadding: EdgeInsets.zero,
            dense: true,
            leading: const Icon(Icons.support_agent_outlined,
                size: 18, color: AppColors.textSecondary),
            title: const Text('Support',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
            trailing: const Text('help@recipepilot.app',
                style: TextStyle(
                    fontSize: 12, color: AppColors.textSecondary)),
            onTap: () async {
              final uri = Uri.parse('mailto:help@recipepilot.app');
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri);
              }
            },
          ),
        ],
      ),
    );
  }
}

class _AboutTile extends StatelessWidget {
  const _AboutTile({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      dense: true,
      leading: Icon(icon, size: 18, color: AppColors.textSecondary),
      title: Text(label,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
      trailing: Text(value,
          style: const TextStyle(
              fontSize: 12, color: AppColors.textSecondary)),
    );
  }
}

// ---------------------------------------------------------------------------
// Branding footer
// ---------------------------------------------------------------------------

class _BrandingFooter extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final uri = Uri.parse('https://1865freemoney.com');
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        decoration: BoxDecoration(
          color: AppColors.darkSurface.withOpacity(0.04),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.primary.withOpacity(0.15),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF6B35), Color(0xFFF7931E)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(
                child: Text(
                  '1865',
                  style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w800,
                      color: Colors.white),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Powered by 1865 Free Money',
                    style: TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    'Digital Excellence · Atlanta, GA',
                    style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
            Icon(Icons.open_in_new,
                size: 14, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 2, bottom: 8),
          child: Text(
            title.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
              letterSpacing: 0.8,
            ),
          ),
        ),
        Card(
          margin: EdgeInsets.zero,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: child,
          ),
        ),
      ],
    );
  }
}
