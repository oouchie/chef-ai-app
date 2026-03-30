import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../shared/models/models.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/services/purchase_service.dart';
import '../../../core/services/supabase_service.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

class ProfileState {
  final UserProfile? profile;
  final bool isPremium;
  final int dailyUsage;
  final int maxDailyUsage;

  const ProfileState({
    this.profile,
    this.isPremium = false,
    this.dailyUsage = 0,
    this.maxDailyUsage = 10,
  });

  ProfileState copyWith({
    UserProfile? profile,
    bool? isPremium,
    int? dailyUsage,
    int? maxDailyUsage,
    bool clearProfile = false,
  }) {
    return ProfileState(
      profile: clearProfile ? null : (profile ?? this.profile),
      isPremium: isPremium ?? this.isPremium,
      dailyUsage: dailyUsage ?? this.dailyUsage,
      maxDailyUsage: maxDailyUsage ?? this.maxDailyUsage,
    );
  }
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

class ProfileNotifier extends StateNotifier<ProfileState> {
  ProfileNotifier() : super(const ProfileState()) {
    _init();
  }

  Future<void> _init() async {
    await loadProfile();
    await checkPremium();
    await _loadDailyUsage();
  }

  Future<void> _loadDailyUsage() async {
    final usage = await StorageService.getDailyUsage();
    final today = DateTime.now();
    final isSameDay = usage.date.year == today.year &&
        usage.date.month == today.month &&
        usage.date.day == today.day;

    state = state.copyWith(dailyUsage: isSameDay ? usage.count : 0);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  Future<void> loadProfile() async {
    final user = SupabaseService.currentUser;
    if (user == null) {
      state = state.copyWith(clearProfile: true);
      return;
    }

    try {
      final profileData = await SupabaseService.getProfile();
      if (profileData != null) {
        state = state.copyWith(profile: profileData);
      } else {
        // Build a minimal local profile from auth user.
        final local = UserProfile(
          id: user.id,
          email: user.email ?? '',
        );
        state = state.copyWith(profile: local);
      }
    } catch (_) {
      final local = UserProfile(
        id: user.id,
        email: user.email ?? '',
      );
      state = state.copyWith(profile: local);
    }
  }

  Future<void> checkPremium() async {
    try {
      final status = await PurchaseService.getSubscriptionStatus();
      state = state.copyWith(isPremium: status.isPremium);
    } catch (_) {
      state = state.copyWith(isPremium: false);
    }
  }

  Future<void> incrementUsage() async {
    await StorageService.incrementDailyUsage();
    final usage = await StorageService.getDailyUsage();
    final today = DateTime.now();
    final isSameDay = usage.date.year == today.year &&
        usage.date.month == today.month &&
        usage.date.day == today.day;

    state = state.copyWith(dailyUsage: isSameDay ? usage.count : 1);
  }

  bool canGenerate() {
    if (state.isPremium) return true;
    return state.dailyUsage < state.maxDailyUsage;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final profileProvider =
    StateNotifierProvider<ProfileNotifier, ProfileState>(
  (ref) => ProfileNotifier(),
);
