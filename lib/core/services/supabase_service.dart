import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../shared/models/user_profile.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  static Future<void> initialize({
    required String url,
    required String anonKey,
  }) async {
    await Supabase.initialize(url: url, anonKey: anonKey);
  }

  // Auth
  static User? get currentUser => client.auth.currentUser;
  static bool get isLoggedIn => currentUser != null;

  static Future<AuthResponse> signUp({
    required String email,
    required String password,
  }) async {
    return await client.auth.signUp(email: email, password: password);
  }

  static Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    return await client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  static Future<void> signOut() async {
    await client.auth.signOut();
  }

  static Future<void> resetPassword(String email) async {
    await client.auth.resetPasswordForEmail(email);
  }

  static Future<bool> signInWithGoogle() async {
    final response = await client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: 'io.supabase.recipepilot://login-callback/',
    );
    return response;
  }

  /// Native Apple Sign-In — uses the Apple credential token directly
  /// instead of OAuth redirect flow. More reliable on iOS.
  static Future<AuthResponse> signInWithApple() async {
    // Generate a cryptographic nonce for security
    final rawNonce = _generateNonce();
    final hashedNonce = sha256.convert(utf8.encode(rawNonce)).toString();

    // Trigger native Apple Sign-In dialog
    final credential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
      nonce: hashedNonce,
    );

    final idToken = credential.identityToken;
    if (idToken == null) {
      throw Exception('Apple Sign-In failed — no identity token received.');
    }

    // Sign in to Supabase using the Apple ID token
    return await client.auth.signInWithIdToken(
      provider: OAuthProvider.apple,
      idToken: idToken,
      nonce: rawNonce,
    );
  }

  /// Generate a random nonce string for Apple Sign-In
  static String _generateNonce([int length = 32]) {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(length, (_) => charset[random.nextInt(charset.length)]).join();
  }

  // Profile
  static Future<UserProfile?> getProfile() async {
    final user = currentUser;
    if (user == null) return null;

    final data =
        await client.from('profiles').select().eq('id', user.id).single();

    return UserProfile(
      id: data['id'] as String,
      email: data['email'] as String? ?? user.email ?? '',
      isPremium: data['is_premium'] as bool? ?? false,
      premiumExpiresAt: data['premium_expires_at'] != null
          ? DateTime.parse(data['premium_expires_at'] as String)
          : null,
      revenueCatId: data['revenue_cat_id'] as String?,
      dailyRequests: data['daily_requests'] as int? ?? 0,
      lastRequestDate: data['last_request_date'] != null
          ? DateTime.parse(data['last_request_date'] as String)
          : null,
    );
  }

  static Future<void> updatePremiumStatus({
    required bool isPremium,
    DateTime? expiresAt,
  }) async {
    final user = currentUser;
    if (user == null) return;

    await client.from('profiles').update({
      'is_premium': isPremium,
      'premium_expires_at': expiresAt?.toIso8601String(),
    }).eq('id', user.id);
  }

  // Usage limits
  static Future<Map<String, dynamic>> checkUsageLimit() async {
    final user = currentUser;
    if (user == null) {
      return {'allowed': false, 'remaining': 0, 'is_premium': false};
    }

    final result = await client.rpc(
      'check_usage_limit',
      params: {'user_uuid': user.id},
    );

    return result as Map<String, dynamic>;
  }

  // Chat via Edge Function
  static Future<Map<String, dynamic>> sendChatMessage({
    required String message,
    String? region,
    List<Map<String, String>>? history,
    String? imageBase64,
  }) async {
    final body = <String, dynamic>{
      'message': message,
      'region': region,
      'history': history,
    };
    if (imageBase64 != null) {
      body['image'] = imageBase64;
    }

    final response = await client.functions.invoke(
      'chat',
      body: body,
    );

    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    // If response isn't a map, wrap it
    throw Exception('Unexpected Edge Function response: ${response.status}');
  }
}
