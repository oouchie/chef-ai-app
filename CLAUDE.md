# CLAUDE.md — Recipe Pilot (Flutter)

> This file provides Claude Code with full context on the Recipe Pilot Flutter project.
> Read this BEFORE writing any code or making any architectural decisions.

---

## Project Overview

**App Name:** Recipe Pilot
**Bundle ID:** `com.chefai2.app`
**Owner:** Oouchie / 1865 Free Money LLC
**Contact:** oouchie@1865freemoney.com | 404-490-5856
**Status:** Flutter migration in progress. RN version live on App Store. Flutter build deploying to TestFlight via Codemagic.
**GitHub:** `https://github.com/oouchie/chef-ai-app.git` — branch `flutter-migration`
**Current Version:** 1.0.2+76

Recipe Pilot is an **AI-powered ingredient-based recipe app**. Users input ingredients they have on hand and the app generates personalized recipes they can cook right now — reducing food waste and eliminating the "what's for dinner?" problem.

---

## Tech Stack (Flutter Migration)

| Layer | Technology |
|-------|-----------|
| **Mobile** | Flutter 3.11+ / Dart |
| **Backend** | Supabase (Auth, Postgres, Edge Functions) |
| **AI Engine** | Claude API via Supabase Edge Function `chat` |
| **Payments** | RevenueCat (`purchases_flutter`) |
| **State** | Riverpod 2.x |
| **Navigation** | GoRouter |
| **Models** | Freezed + json_serializable |
| **Auth** | Supabase (email/password, Google OAuth, native Apple Sign-In) |

---

## Supabase Configuration

| Setting | Value |
|---------|-------|
| **Project URL** | `https://bwddfoqaqgrbendjgchr.supabase.co` |
| **Project Ref** | `bwddfoqaqgrbendjgchr` |
| **Edge Function** | `chat` (v10, handles text + image recipe generation) |
| **Edge Function Secret** | `CLAUDE_API_KEY` set in Supabase secrets |
| **OAuth Redirect URL** | `io.supabase.recipepilot://login-callback/` |

---

## RevenueCat Configuration

| Setting | Value |
|---------|-------|
| **iOS API Key** | `appl_OQnKoMJWXJCotYpzyhQoBCpVZlU` |
| **Android API Key** | Not configured yet |
| **Entitlement ID** | `premium` |
| **Product ID** | `recipepilot_premium_monthly` |
| **Pricing** | $4.99/month |
| **Free Tier** | 3 recipes/day (`AppConfig.maxFreeGenerationsPerDay`) |

---

## Apple Developer / App Store

| Setting | Value |
|---------|-------|
| **Bundle ID** | `com.chefai2.app` |
| **Team ID** | `BA7AX9ZFTR` |
| **Apple Sign-In Key ID** | `SY54CA26JU` |
| **App Store Connect** | Recipe Pilot app record exists |
| **Codemagic Integration** | `Codemagic Recipe` (App Store Connect API key) |

---

## CI/CD — Codemagic

- **yaml:** `codemagic.yaml` in repo root
- **iOS workflow:** `recipe-pilot-ios` — auto-signs, builds IPA, publishes to TestFlight
- **Android workflow:** `recipe-pilot-android` — builds APK + AAB
- **Trigger:** push to `flutter-migration` branch
- **Signing:** Auto via `app-store-connect fetch-signing-files` with `--create`
- **Note:** Must delete stale certificates from Apple Developer portal if signing fails

---

## Project Structure

```
recipe-pilot-flutter/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_config.dart         # Free tier limits, feature flags
│   │   │   ├── app_strings.dart        # All UI strings
│   │   │   └── regions.dart            # World cuisine regions
│   │   ├── theme/
│   │   │   ├── app_colors.dart         # Color tokens (light + dark)
│   │   │   └── app_theme.dart          # Material theme config
│   │   ├── router/
│   │   │   ├── app_router.dart         # GoRouter config, auth redirect, performSignOut()
│   │   │   ├── route_names.dart        # Route path constants
│   │   │   └── scaffold_with_nav.dart  # Bottom nav shell
│   │   └── services/
│   │       ├── chat_service.dart       # Claude API (Edge Function → direct API → demo fallback)
│   │       ├── purchase_service.dart   # RevenueCat wrapper
│   │       ├── storage_service.dart    # SharedPreferences helpers
│   │       └── supabase_service.dart   # Auth, profile, chat, native Apple Sign-In
│   ├── features/
│   │   ├── auth/presentation/
│   │   │   ├── welcome_screen.dart     # Landing page
│   │   │   ├── login_screen.dart       # Email + Google + Apple sign-in
│   │   │   ├── signup_screen.dart      # Registration
│   │   │   └── walkthrough_screen.dart # Onboarding (shown once)
│   │   ├── recipe_generation/
│   │   │   ├── domain/chat_provider.dart
│   │   │   └── presentation/
│   │   │       ├── chat_screen.dart            # Main AI chat (text, voice, image)
│   │   │       ├── ingredient_input_screen.dart # Home tab
│   │   │       └── recipe_results_screen.dart   # Recipe detail view
│   │   ├── saved_recipes/
│   │   │   ├── domain/saved_recipes_provider.dart
│   │   │   └── presentation/saved_recipes_screen.dart
│   │   ├── pantry/
│   │   │   ├── domain/todos_provider.dart
│   │   │   └── presentation/todo_list_screen.dart  # Shopping list
│   │   ├── meal_planning/
│   │   │   ├── domain/meal_plan_provider.dart
│   │   │   └── presentation/meal_planner_screen.dart
│   │   ├── cook_mode/presentation/cooking_tools_screen.dart
│   │   ├── subscription/presentation/
│   │   │   ├── paywall_screen.dart              # Premium upsell
│   │   │   └── restaurant_recipes_screen.dart   # Premium feature
│   │   └── profile/
│   │       ├── domain/profile_provider.dart
│   │       └── presentation/profile_screen.dart  # Settings, subscription, about
│   ├── shared/
│   │   ├── models/                     # Freezed models (Recipe, Message, ChatSession, etc.)
│   │   ├── utils/
│   │   └── widgets/                    # GlassCard, GradientButton, RecipeCard, etc.
│   └── main.dart                       # Entry point (Supabase init, RevenueCat init)
├── assets/icon/
│   ├── app_icon.png                    # Source icon (1024x1024, transparent bg)
│   └── app_icon_ios.png                # iOS icon (1024x1024, dark bg, no alpha)
├── ios/
│   ├── Runner/
│   │   ├── Info.plist                  # Privacy descriptions, URL schemes, encryption flag
│   │   └── Runner.entitlements         # Sign In with Apple capability
│   └── Runner.xcodeproj/
├── android/
│   └── app/src/main/
│       ├── AndroidManifest.xml         # Permissions, deep link intent filter
│       └── kotlin/com/chefai2/app/MainActivity.kt
├── supabase/
│   ├── functions/chat/index.ts         # Edge Function — Claude API proxy
│   ├── config.toml
│   └── migration.sql
├── codemagic.yaml                      # CI/CD config
├── pubspec.yaml
└── CLAUDE.md                           # THIS FILE
```

---

## Navigation Map

```
Root (GoRouter)
├── /welcome          — WelcomeScreen (landing)
├── /login            — LoginScreen (email + social)
├── /signup           — SignupScreen
├── /walkthrough      — WalkthroughScreen (first-time only)
├── /tools            — CookingToolsScreen (full-screen)
├── /restaurants      — RestaurantRecipesScreen (premium, full-screen)
└── ShellRoute (ScaffoldWithNav — bottom nav)
    ├── /             — IngredientInputScreen (Home tab)
    │   └── /results  — RecipeResultsScreen
    ├── /saved        — SavedRecipesScreen
    ├── /shopping-list— TodoListScreen
    ├── /meal-plan    — MealPlannerScreen
    └── /profile      — ProfileScreen
```

---

## Auth Flow

- **Email/password** — Supabase `signUp` / `signInWithPassword`
- **Google** — OAuth redirect via `signInWithOAuth` + deep link callback
- **Apple** — Native `sign_in_with_apple` package → `signInWithIdToken` (no browser redirect)
- **Sign-out** — `performSignOut()` in `app_router.dart` (coordinates navigation + session invalidation to avoid black screen)
- **Router redirect** — `_AuthNotifier` listens to Supabase `onAuthStateChange`, redirects unauthenticated users to `/welcome`

---

## App Store Compliance (Implemented)

- **Info.plist privacy descriptions** — Camera, Microphone, Speech Recognition, Photo Library
- **ITSAppUsesNonExemptEncryption** — `false`
- **Privacy Policy** — `https://1865freemoney.com/privacy` (in profile + paywall)
- **Terms of Service** — `https://1865freemoney.com/terms` (in profile + paywall)
- **Support** — `help@recipepilot.app`
- **Subscription disclaimers** — iTunes billing, auto-renewal, manage in settings
- **Restore Purchases** — button on paywall and profile
- **URL scheme** — `io.supabase.recipepilot` for OAuth deep links

---

## Known Issues / TODO

- [ ] **Apple Sign-In** — Supabase provider configured via Management API (Apr 5, 2026). `.p8` key at `C:\Users\oouch\Downloads\AuthKey_SY54CA26JU.p8`. Needs device testing to confirm native flow works end-to-end.
- [ ] **Apple Sign-In secret expiry** — Client secret JWT expires Oct 2, 2026. Must regenerate before then using the `.p8` key + Team ID `BA7AX9ZFTR` + Key ID `SY54CA26JU`.
- [ ] **Google Sign-In** — OAuth provider needs Google Cloud OAuth Client ID configured in Supabase dashboard. Note: Google client ID `665822262098-gecvghcsfneej20v5sb67oqr8n5tfst8.apps.googleusercontent.com` is already set in Supabase.
- [ ] **Codemagic signing intermittent** — Sometimes fails with "No valid code signing certificates". Fix: delete stale certs from Apple Developer portal and re-run.
- [ ] **Android app label** — Shows `recipe_pilot` instead of `Recipe Pilot` in AndroidManifest
- [ ] **Profile provider stale data** — Fixed with `loadProfile()` on screen visit, but provider should ideally listen to auth state changes
- [ ] **Version display** — Hardcoded in profile screen, should use `package_info_plus`

---

## Local Storage Keys (SharedPreferences)

| Key | Purpose |
|-----|---------|
| `recipe_pilot_sessions` | Chat session history |
| `recipe_pilot_saved_recipes` | Saved recipes JSON |
| `recipe_pilot_todos` | Shopping list items |
| `chef-ai-api-key` | User's stored API key (fallback) |
| `recipepilot_daily_usage` | Free tier usage (count + date) |
| `recipepilot_restaurant_trial_used` | One-time trial flag |
| `recipe_pilot_region` | Selected cuisine region |
| `walkthrough_seen` | Onboarding completion flag |

---

## Supabase Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile, premium status, daily usage tracking |
| `saved_recipes` | Cloud-synced saved recipes (JSONB). Unique on `(user_id, recipe_name, cuisine)` |

---

## Commands

```bash
# Run app (use full Flutter path on this machine)
/c/Users/oouch/Flutter/flutter/bin/flutter run

# Run on connected Android device
/c/Users/oouch/Flutter/flutter/bin/flutter run -d RFCY81PNYGH --no-dds

# Generate freezed models
/c/Users/oouch/Flutter/flutter/bin/flutter pub run build_runner build --delete-conflicting-outputs

# Regenerate app icons
/c/Users/oouch/Flutter/flutter/bin/flutter pub run flutter_launcher_icons

# Analyze
/c/Users/oouch/Flutter/flutter/bin/flutter analyze

# Deploy to Codemagic (auto-triggers on push)
git push origin flutter-migration
```

---

## Important Notes

1. **Bundle ID is `com.chefai2.app`** — matches existing App Store listing from RN version
2. **RN code lives on `main` branch** — do NOT merge `flutter-migration` into `main` until migration is complete
3. **RevenueCat iOS key is live** — `appl_OQnKoMJWXJCotYpzyhQoBCpVZlU`
4. **Build numbers must increment** for each TestFlight upload (App Store Connect rejects duplicates)
5. **Version 1.0.1 train is closed** — must use 1.0.2+ for new submissions
6. **Sign-out uses `performSignOut()`** — do NOT call `SupabaseService.signOut()` directly from UI. The coordinated function prevents Navigator lock crash / black screen.
7. **Dialog context bug** — Always use `builder: (dialogContext) =>` and `Navigator.pop(dialogContext)`, never pop with the parent widget's context.
8. **iOS icons need `app_icon_ios.png`** — separate file with dark bg filling entire canvas (iOS doesn't support transparency in app icons)
9. **Supabase Apple provider** — Dashboard won't save Apple config (secret key validation bug). Use Management API `PATCH /v1/projects/{ref}/config/auth` with Bearer token from supabase.com/dashboard/account/tokens. Send `.p8` PEM content as `external_apple_secret`.
