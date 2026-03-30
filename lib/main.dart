import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/constants/app_strings.dart';
import 'core/router/app_router.dart';
import 'core/services/purchase_service.dart';
import 'core/services/supabase_service.dart';
import 'core/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SupabaseService.initialize(
    url: const String.fromEnvironment(
      'SUPABASE_URL',
      defaultValue: 'https://bwddfoqaqgrbendjgchr.supabase.co',
    ),
    anonKey: const String.fromEnvironment(
      'SUPABASE_ANON_KEY',
      defaultValue:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3ZGRmb3FhcWdyYmVuZGpnY2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMjY4NzQsImV4cCI6MjA4MzkwMjg3NH0.oQLjkXCHpOIrd4ZKOcOX3MEbWmtWosOOqGRTsNTjHsk',
    ),
  );

  // Configure RevenueCat with API keys
  PurchaseService.configure(
    iosKey: 'appl_OQnKoMJWXJCotYpzyhQoBCpVZlU',
    // androidKey: 'goog_xxx', // TODO: Add Android key when Play Store is ready
  );

  // Initialize RevenueCat (userId will be set after auth)
  await PurchaseService.initialize(null);

  await initRouterState();

  runApp(const ProviderScope(child: RecipePilotApp()));
}

class RecipePilotApp extends StatelessWidget {
  const RecipePilotApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppStrings.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      routerConfig: appRouter,
    );
  }
}
