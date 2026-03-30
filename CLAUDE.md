# CLAUDE.md — Recipe Pilot

> This file provides Claude Code with full context on the Recipe Pilot project.
> Read this BEFORE writing any code or making any architectural decisions.

---

## Project Overview

**App Name:** Recipe Pilot
**Owner:** Oouchie / 1865 Free Money LLC
**Contact:** oouchie@1865freemoney.com | 404-490-5856
**Status:** Published on Apple App Store. Google Play Store release pending.
**Migration:** Converting from current stack → Flutter for better UI/UX and cross-platform parity.

Recipe Pilot is an **AI-powered ingredient-based recipe app**. Users input ingredients they have on hand and the app generates personalized recipes they can cook right now — reducing food waste and eliminating the "what's for dinner?" problem.

---

## Current Tech Stack (Pre-Migration)

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native / Expo |
| **Backend** | Firebase (Auth, Firestore, Cloud Functions) |
| **AI Engine** | Claude API (recipe generation from ingredients) |
| **Payments** | RevenueCat (subscription management) |
| **Analytics** | Firebase Analytics |
| **Marketing** | Facebook carousel ads, Sora video prompts |

---

## Current Features (What's Already Built & Shipping)

### Core — Ingredient-Based Recipe Generation
- User inputs ingredients they have available (text input, tag-based selection)
- Claude API processes ingredients and generates full recipes including:
  - Recipe title
  - Ingredient list with quantities
  - Step-by-step cooking instructions
  - Estimated prep time + cook time
  - Serving size
- Results are tailored to the ingredients provided — no "go buy this" filler
- Multiple recipe suggestions per ingredient set

### Recipe Display
- Clean recipe card view with image (AI-generated or placeholder)
- Expandable ingredient list
- Numbered step-by-step instructions
- Prep time / cook time / total time display
- Serving size indicator

### User Accounts & Auth
- Firebase Authentication (email/password, possible social login)
- User profile with saved preferences

### Saved Recipes / Favorites
- Users can save/favorite generated recipes
- Saved recipes accessible from profile
- Persistent across sessions via Firestore

### Subscription Model (RevenueCat)
- Free tier with limited daily recipe generations
- Premium subscription unlocking unlimited generations
- RevenueCat handles subscription management, receipt validation, entitlements
- App Store subscription integration (live)
- Google Play subscription integration (pending with store release)

### Marketing Assets (Already Produced)
- Facebook carousel ad creatives
- Sora video prompt templates for video ad production
- App Store listing with screenshots and description

---

## Database Schema (Current — Firestore)

```
users/
  {uid}/
    email: string
    displayName: string
    createdAt: timestamp
    subscription: {
      plan: 'free' | 'premium'
      expiresAt: timestamp
      revenueCatId: string
    }
    preferences: {
      dietaryRestrictions: string[]  // e.g., ['vegetarian', 'gluten-free']
      cuisinePreferences: string[]   // e.g., ['italian', 'mexican']
      servingSize: number
    }

savedRecipes/
  {recipeId}/
    userId: string
    title: string
    ingredients: [{name, quantity, unit}]
    instructions: string[]
    prepTime: number
    cookTime: number
    servings: number
    cuisineType: string
    imageUrl: string (optional)
    createdAt: timestamp
    sourceIngredients: string[]  // what the user originally input

generationHistory/
  {generationId}/
    userId: string
    inputIngredients: string[]
    generatedRecipes: [{...recipe data}]
    createdAt: timestamp
```

---

## App Navigation Structure (Current)

```
Root
├── Auth Flow
│   ├── Login Screen
│   ├── Sign Up Screen
│   └── Forgot Password
├── Main App (Bottom Tab Navigation)
│   ├── Home / Generate Tab
│   │   ├── Ingredient Input Screen
│   │   └── Recipe Results Screen
│   │       └── Recipe Detail Screen
│   ├── Saved Recipes Tab
│   │   └── Recipe Detail Screen
│   ├── Profile Tab
│   │   ├── Dietary Preferences
│   │   ├── Subscription Management
│   │   └── Settings
│   └── (Premium upsell paywall screen)
```

---

## API Integration (Claude)

### Recipe Generation Prompt Pattern
```
System: You are a professional chef and recipe creator. Given a list of 
ingredients the user has available, generate [N] complete recipes that 
can be made primarily using those ingredients. Each recipe should include:
- A creative title
- Full ingredient list with measurements
- Step-by-step instructions
- Prep time and cook time estimates
- Serving size
- Difficulty level
- Any common pantry staples assumed (salt, pepper, oil, etc.)

Prioritize recipes that use the MOST of the provided ingredients.
If a recipe requires 1-2 additional common items, note them clearly.

User: I have these ingredients: [ingredient_list]
Dietary restrictions: [restrictions]
Cuisine preference: [preference]
Serving size: [number]
```

### Response Format
Claude returns structured recipe data (JSON) that the app parses and displays.

---

## RevenueCat Configuration

| Setting | Value |
|---------|-------|
| **Free Tier** | Limited recipe generations per day (e.g., 3/day) |
| **Premium Tier** | Unlimited generations, saved recipes, advanced preferences |
| **Entitlement ID** | `premium` |
| **Platforms** | iOS (live), Android (pending) |
| **Offering** | Monthly and/or annual subscription options |

---

## Current Pain Points & Reasons for Flutter Migration

1. **UI feels generic** — React Native default components; needs distinctive, polished design
2. **Performance on recipe generation** — loading states could be smoother
3. **Cross-platform parity** — need consistent experience on iOS + Android
4. **Animation & microinteractions** — limited in current build
5. **Cook mode** — no hands-free or step-by-step cooking mode exists yet
6. **No meal planning** — recipes are one-off; no weekly planning capability
7. **No grocery list generation** — obvious feature gap
8. **No social/sharing** — can't share recipes with friends/family
9. **No pantry management** — user re-enters ingredients every time
10. **No nutritional information** — users want calorie/macro data

---

## File Structure Convention for Flutter Migration

All new Flutter code should follow feature-first architecture:

```
recipe_pilot/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   ├── theme/
│   │   ├── router/
│   │   ├── services/        # API clients, RevenueCat, Firebase wrappers
│   │   └── utils/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   ├── recipe_generation/
│   │   ├── saved_recipes/
│   │   ├── pantry/           # NEW — persistent ingredient tracking
│   │   ├── meal_planning/    # NEW — weekly meal planner
│   │   ├── grocery_list/     # NEW — auto-generated shopping lists
│   │   ├── cook_mode/        # NEW — hands-free step-by-step
│   │   ├── profile/
│   │   └── subscription/
│   ├── shared/
│   │   ├── widgets/
│   │   └── models/
│   └── main.dart
├── supabase/                 # If migrating from Firebase
│   ├── migrations/
│   └── functions/
├── test/
├── pubspec.yaml
├── CLAUDE.md                 # THIS FILE
└── README.md
```

---

## Coding Standards

- **State management:** Riverpod 2.x (not BLoC, not Provider)
- **Navigation:** GoRouter with declarative routing
- **Models:** Freezed + json_serializable for all data classes
- **Async state:** Always use `AsyncValue<T>` for loading/error/data
- **Error handling:** Result pattern or typed failures
- **Money:** If adding any payment features, always use integers (cents)
- **Strings:** No hardcoded UI strings — use constants file (l10n ready)
- **Tests:** Minimum 80% coverage on business logic
- **Accessibility:** Semantic labels on all interactive elements
- **Dark mode:** Support from day one

---

## Backend Decision: Firebase → Supabase Migration (Optional)

The current app uses Firebase. The Flutter migration may optionally move to Supabase for:
- Better Postgres querying for recipe search/filtering
- Row Level Security for user data
- Edge Functions for Claude API proxy (keep API key server-side)
- Realtime for future social features
- Lower cost at scale

**If staying on Firebase:** Use `cloud_firestore`, `firebase_auth`, `cloud_functions` Flutter packages.
**If migrating to Supabase:** Use `supabase_flutter` package, migrate Firestore docs → Postgres tables.

Either way, the Claude API calls should go through a server-side function (Edge Function or Cloud Function) — never expose the API key in the client.

---

## Environment Variables Required

```env
# Claude API (server-side only)
ANTHROPIC_API_KEY=sk-ant-...

# Firebase (if keeping)
FIREBASE_PROJECT_ID=
FIREBASE_API_KEY=
FIREBASE_APP_ID=

# Supabase (if migrating)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# RevenueCat
REVENUECAT_API_KEY_IOS=
REVENUECAT_API_KEY_ANDROID=
REVENUECAT_ENTITLEMENT_ID=premium

# Analytics
FIREBASE_ANALYTICS_ENABLED=true
```

---

## Commands

```bash
# Run app
flutter run

# Generate freezed models
dart run build_runner build --delete-conflicting-outputs

# Run tests
flutter test

# Run tests with coverage
flutter test --coverage

# Analyze code
flutter analyze

# Format code
dart format lib/
```

---

## Important Notes for Claude Code

1. **This is a MIGRATION, not a greenfield build.** The app already exists and has live users on iOS. Preserve all existing functionality before adding new features.
2. **RevenueCat subscriptions are LIVE.** Do not break the subscription flow. Existing premium users must retain access seamlessly.
3. **Claude API is the recipe engine.** All recipe generation goes through Claude. The prompt engineering is already tuned — preserve the generation quality.
4. **App Store is already approved.** Any changes must maintain App Store compliance (especially around subscription UI, privacy, and in-app purchase flows).
5. **Google Play release is imminent.** Flutter build must produce a clean Android build alongside iOS.
6. **Marketing assets exist.** The app name "Recipe Pilot" and branding are established. Maintain brand consistency.
7. **Read the orchestrator prompt** for the full Flutter migration plan with phased build order and sub-agent definitions.
