import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/signup_screen.dart';
import '../../features/auth/presentation/welcome_screen.dart';
import '../../features/auth/presentation/walkthrough_screen.dart';
import '../../features/recipe_generation/presentation/ingredient_input_screen.dart';
import '../../features/recipe_generation/presentation/recipe_results_screen.dart';
import '../../shared/models/models.dart';
import '../../features/saved_recipes/presentation/saved_recipes_screen.dart';
import '../../features/pantry/presentation/todo_list_screen.dart';
import '../../features/cook_mode/presentation/cooking_tools_screen.dart';
import '../../features/meal_planning/presentation/meal_planner_screen.dart';
import '../../features/subscription/presentation/restaurant_recipes_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../services/supabase_service.dart';
import 'route_names.dart';
import 'scaffold_with_nav.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

/// Tracks whether the walkthrough has been seen (loaded once at startup).
bool _walkthroughSeen = false;

/// Call this before runApp to preload the walkthrough flag.
Future<void> initRouterState() async {
  final prefs = await SharedPreferences.getInstance();
  _walkthroughSeen = prefs.getBool('walkthrough_seen') ?? false;
}

/// Mark walkthrough as complete (updates in-memory flag for router redirect).
void markWalkthroughComplete() {
  _walkthroughSeen = true;
}

/// Notifier that triggers router refresh on Supabase auth state changes.
class _AuthNotifier extends ChangeNotifier {
  late final StreamSubscription<AuthState> _sub;

  _AuthNotifier() {
    _sub = Supabase.instance.client.auth.onAuthStateChange.listen((event) {
      debugPrint('[Router] Auth state changed: ${event.event}');
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}

final _authNotifier = _AuthNotifier();

/// Routes that don't require authentication.
const _unauthenticatedRoutes = {
  RouteNames.welcome,
  RouteNames.login,
  RouteNames.signup,
};

final appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: RouteNames.home,
  refreshListenable: _authNotifier,
  redirect: (context, state) {
    final isLoggedIn = SupabaseService.isLoggedIn;
    final loc = state.matchedLocation;

    debugPrint('[Router] redirect: loc=$loc, loggedIn=$isLoggedIn, walkthroughSeen=$_walkthroughSeen');

    // --- Not logged in ---
    if (!isLoggedIn) {
      // Already on an unauthenticated route → stay
      if (_unauthenticatedRoutes.contains(loc)) return null;
      // Otherwise → go to welcome
      return RouteNames.welcome;
    }

    // --- Logged in ---

    // Hasn't seen walkthrough yet → show it (unless already there)
    if (!_walkthroughSeen) {
      if (loc == RouteNames.walkthrough) return null;
      return RouteNames.walkthrough;
    }

    // Has seen walkthrough, on an auth/walkthrough screen → go home
    if (_unauthenticatedRoutes.contains(loc) || loc == RouteNames.walkthrough) {
      return RouteNames.home;
    }

    // Normal navigation — no redirect needed
    return null;
  },
  routes: [
    // Auth routes (no bottom nav)
    GoRoute(
      path: RouteNames.welcome,
      name: RouteNames.welcome,
      builder: (context, state) => const WelcomeScreen(),
    ),
    GoRoute(
      path: RouteNames.login,
      name: RouteNames.login,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: RouteNames.signup,
      name: RouteNames.signup,
      builder: (context, state) => const SignupScreen(),
    ),
    GoRoute(
      path: RouteNames.walkthrough,
      name: RouteNames.walkthrough,
      builder: (context, state) => const WalkthroughScreen(),
    ),

    // Full-screen routes (no bottom nav)
    GoRoute(
      path: RouteNames.restaurants,
      name: RouteNames.restaurants,
      builder: (context, state) => const RestaurantRecipesScreen(),
    ),
    GoRoute(
      path: RouteNames.tools,
      name: RouteNames.tools,
      builder: (context, state) => const CookingToolsScreen(),
    ),

    // Main app with bottom nav
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) => ScaffoldWithNav(child: child),
      routes: [
        GoRoute(
          path: RouteNames.home,
          name: RouteNames.home,
          builder: (context, state) => const IngredientInputScreen(),
          routes: [
            GoRoute(
              path: 'results',
              name: RouteNames.recipeResults,
              builder: (context, state) {
                final recipe = state.extra as Recipe?;
                return RecipeResultsScreen(recipe: recipe);
              },
            ),
          ],
        ),
        GoRoute(
          path: RouteNames.saved,
          name: RouteNames.saved,
          builder: (context, state) => const SavedRecipesScreen(),
        ),
        GoRoute(
          path: RouteNames.shoppingList,
          name: RouteNames.shoppingList,
          builder: (context, state) => const TodoListScreen(),
        ),
        GoRoute(
          path: RouteNames.mealPlan,
          name: RouteNames.mealPlan,
          builder: (context, state) => const MealPlannerScreen(),
        ),
        GoRoute(
          path: RouteNames.profile,
          name: RouteNames.profile,
          builder: (context, state) => const ProfileScreen(),
        ),
      ],
    ),
  ],
);
