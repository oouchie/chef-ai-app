class AppConfig {
  AppConfig._();

  // API
  static const int maxFreeGenerationsPerDay = 3;

  // RevenueCat
  static const String revenueCatEntitlementId = 'premium';

  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration recipeGenerationTimeout = Duration(seconds: 60);

  // UI
  static const double borderRadius = 12.0;
  static const double cardBorderRadius = 16.0;
  static const double bottomNavHeight = 80.0;

  // Pagination
  static const int recipesPerPage = 20;
}
