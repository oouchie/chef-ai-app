import 'dart:io';

import 'package:purchases_flutter/purchases_flutter.dart';

import 'supabase_service.dart';

class PurchaseService {
  static const String _entitlementId = 'premium';
  static const String _productId = 'recipepilot_premium_monthly';

  // Set these from environment or config
  static String? _iosApiKey;
  static String? _androidApiKey;
  static bool _isConfigured = false;

  static void configure({String? iosKey, String? androidKey}) {
    _iosApiKey = iosKey;
    _androidApiKey = androidKey;
  }

  static Future<void> initialize(String? userId) async {
    String? apiKey;
    if (Platform.isIOS) {
      apiKey = _iosApiKey;
    } else if (Platform.isAndroid) {
      apiKey = _androidApiKey;
    }

    if (apiKey == null || apiKey.isEmpty) return;

    try {
      final configuration = PurchasesConfiguration(apiKey);
      if (userId != null) {
        configuration.appUserID = userId;
      }

      await Purchases.configure(configuration);
      _isConfigured = true;
    } catch (_) {
      // RevenueCat setup failed — run in free mode
    }
  }

  static Future<({bool isPremium, DateTime? expiresAt, bool willRenew})>
      getSubscriptionStatus() async {
    if (!_isConfigured) {
      return (isPremium: false, expiresAt: null, willRenew: false);
    }
    try {
      final customerInfo = await Purchases.getCustomerInfo();
      final entitlement = customerInfo.entitlements.all[_entitlementId];

      if (entitlement != null && entitlement.isActive) {
        return (
          isPremium: true,
          expiresAt: entitlement.expirationDate != null
              ? DateTime.parse(entitlement.expirationDate!)
              : null,
          willRenew: !entitlement.willRenew,
        );
      }
    } catch (_) {
      // RevenueCat not available (web/simulator)
    }

    return (isPremium: false, expiresAt: null, willRenew: false);
  }

  static Future<({bool success, bool isPremium, DateTime? expiresAt})>
      purchasePremium() async {
    if (!_isConfigured) {
      return (success: false, isPremium: false, expiresAt: null);
    }
    try {
      final offerings = await Purchases.getOfferings();
      final current = offerings.current;
      if (current == null) {
        return (success: false, isPremium: false, expiresAt: null);
      }

      // Find our package
      final package = current.availablePackages.firstWhere(
        (p) => p.storeProduct.identifier == _productId,
        orElse: () => current.availablePackages.first,
      );

      final customerInfo = await Purchases.purchasePackage(package);
      final entitlement = customerInfo.entitlements.all[_entitlementId];

      if (entitlement != null && entitlement.isActive) {
        // Sync to Supabase
        await SupabaseService.updatePremiumStatus(
          isPremium: true,
          expiresAt: entitlement.expirationDate != null
              ? DateTime.parse(entitlement.expirationDate!)
              : null,
        );

        return (
          success: true,
          isPremium: true,
          expiresAt: entitlement.expirationDate != null
              ? DateTime.parse(entitlement.expirationDate!)
              : null,
        );
      }
    } catch (_) {
      // Purchase cancelled or failed
    }

    return (success: false, isPremium: false, expiresAt: null);
  }

  static Future<({bool isPremium, DateTime? expiresAt})>
      restorePurchases() async {
    if (!_isConfigured) {
      return (isPremium: false, expiresAt: null);
    }
    try {
      final customerInfo = await Purchases.restorePurchases();
      final entitlement = customerInfo.entitlements.all[_entitlementId];

      if (entitlement != null && entitlement.isActive) {
        await SupabaseService.updatePremiumStatus(
          isPremium: true,
          expiresAt: entitlement.expirationDate != null
              ? DateTime.parse(entitlement.expirationDate!)
              : null,
        );

        return (
          isPremium: true,
          expiresAt: entitlement.expirationDate != null
              ? DateTime.parse(entitlement.expirationDate!)
              : null,
        );
      }
    } catch (_) {
      // Restore failed
    }

    return (isPremium: false, expiresAt: null);
  }
}
