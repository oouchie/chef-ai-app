# RecipePilot - AI-Powered Recipe Assistant

## Project Overview

**Application Name:** RecipePilot
**Bundle ID:** com.chefai2.app
**Description:** AI-powered recipe discovery, meal planning, and step-by-step cooking assistant
**Target Platform:** iOS 15.0+ (iPhone and iPad), Android
**Distribution:** Apple App Store, Google Play Store
**Current Build:** 68

---

## Mission Complete: App Store Submission Ready

**Previous Issues (All Resolved):**
1. **AI not working on TestFlight** - Supabase anon key was stale/outdated - Updated to new key
2. **RevenueCat "no packages"** - Multiple causes identified and fixed:
   - `purchaseService.initialize()` was never called at app startup - Added to `_layout.tsx`
   - Added promise-based initialization tracking to prevent race conditions
   - Added retry logic for getOfferings()
   - **Root cause: Paid Apps Agreement not set up in App Store Connect** (banking/tax info required)

**Status:** v1.0.1 (Build 68) SUBMITTED to App Store Connect - February 23, 2026

### Build History & Apple Review Journey

The app went through **4 review rejections** before all issues were resolved. See `agents/App-Store-Approval.md` for a comprehensive guide based on these lessons learned.

**Review 1 (Jan 30):** Guideline 3.1.2 (Terms of Use), 2.1 (IAP Error), 2.5.4 (Audio Background Mode), 2.3.3 (iPad Screenshots)
**Review 2 (Feb 3):** Guideline 2.3.3 (iPad Screenshots still wrong), 2.1 (IAP Error on iPad)
**Review 3 (Feb 5):** Guideline 2.1 (Subscription re-prompt bug)
**Review 4 (Feb 23):** v1.0.1 Build 68 submitted with all fixes + new features

### What's in v1.0.1 (Build 68)
1. **Photo-to-Recipe** - Snap a photo of food or ingredients, AI identifies and suggests recipes (Claude Vision)
2. **Voice Input (Premium)** - Hands-free recipe search via speech-to-text
3. **Smarter AI Prompts** - Better recipe responses with more detail
4. **Daily Free Requests** - 10/day counter for free users
5. **New Architecture Enabled** - Required by Reanimated 4.x
6. **All Apple review issues resolved** - IAP, Terms, Screenshots, Background Modes

---

## Volume 2 - Future Enhancements

Ideas for future updates once revenue is generated:

### AI & Chat Enhancements
- [ ] Recipe image generation (AI-generated food photos)
- [ ] Voice-guided cooking mode (step-by-step audio instructions)
- [ ] Multi-language support
- [ ] Dietary restriction profiles (vegan, gluten-free, keto, etc.)
- [ ] Allergy warnings and substitution suggestions

### Social Features
- [ ] Share recipes with friends
- [ ] Community recipe submissions
- [ ] Recipe ratings and reviews
- [ ] Follow favorite chefs/creators

### Smart Kitchen Integration
- [ ] Smart appliance integration (Instant Pot, air fryer presets)
- [ ] Grocery delivery integration (Instacart, Amazon Fresh)
- [ ] Barcode scanner for pantry management
- [ ] Expiration date tracking

### Meal Planning Pro
- [ ] Nutritional goal tracking
- [ ] Budget-based meal planning
- [ ] Family meal planning (multiple preferences)
- [ ] Leftover recipe suggestions

### Gamification
- [ ] Cooking streaks and achievements
- [ ] Recipe challenges
- [ ] Cuisine exploration badges
- [ ] Weekly cooking goals

---

## Android Launch Checklist

The code is ready for Android - it automatically uses the correct API key per platform. Complete these steps when ready:

### 1. RevenueCat API Key (Code Change Needed)
Currently a placeholder in `src/lib/purchases.ts`:
```typescript
const REVENUECAT_API_KEY_ANDROID = 'goog_xxx'; // TODO: Add Android key
```
Replace `goog_xxx` with your actual key from RevenueCat.

### 2. Google Play Console Setup
- [ ] Create developer account at https://play.google.com/console ($25 one-time fee)
- [ ] Create app listing for RecipePilot
- [ ] Set up **Subscriptions** (Monetize → Products → Subscriptions):
  - `recipepilot_premium_monthly` - $4.99/month
  - `recipepilot_premium_yearly` - $29.99/year
- [ ] Complete store listing (description, screenshots, etc.)
- [ ] Set up **Payments profile** (banking info for payouts)
- [ ] Create **Service Account** for RevenueCat (see step 3)

### 3. RevenueCat Android Setup
- [ ] In RevenueCat dashboard → **Apps & providers** → **+ New app**
- [ ] Select **Google Play Store**
- [ ] Enter package name: `com.chefai2.app`
- [ ] Upload **Google Play Service Account JSON** (for server-side validation):
  - Google Cloud Console → Create Service Account
  - Grant "Pub/Sub Admin" permission
  - Download JSON key
  - Link in Google Play Console → API access
- [ ] Copy the **Public SDK Key** (starts with `goog_`)
- [ ] Products will auto-import from Play Console
- [ ] Add products to existing "default" offering

### 4. Build for Android
```bash
cd RecipePilotRN
eas build --platform android --profile production
```

### 5. Submit to Play Store
```bash
eas submit --platform android
```

### What's Already Working
- Same codebase works for both platforms
- RevenueCat handles both stores seamlessly
- Same product IDs used on both platforms
- UI is already cross-platform compatible
- All features work identically

---

## RevenueCat Debug Runbook

### Pre-Flight Checklist
- [ ] **NOT using Expo Go** - Must use dev build (`npx expo run:ios`) or EAS build
- [ ] `Purchases.configure()` called once on app startup
- [ ] Correct API key for platform (iOS: `appl_...`, Android: `goog_...`)
- [ ] Bundle ID matches RevenueCat app settings (`com.chefai2.app`)

### Offerings Verification
1. Call `Purchases.getOfferings()` and confirm:
   - `offerings.current` exists (not null)
   - `offerings.current.availablePackages.length > 0`
2. If packages empty, check RevenueCat Dashboard:
   - **Offerings** → Verify "Current" offering is set (star icon)
   - **Packages** → Verify packages attached (`$rc_monthly`, `$rc_annual`)
   - **Products** → Verify product IDs match App Store Connect exactly (case-sensitive)

### App Store Connect Verification
- [ ] Subscription group exists ("Premium")
- [ ] Products created with correct IDs:
  - `recipepilot_premium_monthly` - $4.99/month
  - `recipepilot_premium_yearly` - $29.99/year
- [ ] Products status: "Ready to Submit" or "Approved"
- [ ] Agreements, Tax, and Banking completed
- [ ] Sandbox tester account configured

### RevenueCat Dashboard Verification
- [ ] iOS app configured with Bundle ID: `com.chefai2.app`
- [ ] App Store Connect API key uploaded (`.p8` file)
- [ ] Products imported from App Store Connect
- [ ] Offering created and set as **Current**
- [ ] Packages added: `$rc_monthly`, `$rc_annual`
- [ ] Entitlement "premium" linked to products

### Common Issues
| Symptom | Cause | Fix |
|---------|-------|-----|
| Empty packages | No current offering | Set offering as Current in RevenueCat |
| Empty packages | Packages not attached | Add packages to offering |
| 401 errors | Wrong API key | Verify SDK API key matches dashboard |
| Purchases fail | Expo Go | Use dev build or EAS build |
| Products not found | ID mismatch | Check case-sensitive product IDs |

---

## How to Test RevenueCat

### Development Testing
```bash
cd RecipePilotRN

# Create development build (required for purchases)
npx expo run:ios

# Or use EAS development build
eas build --platform ios --profile development
```

### Sandbox Testing (TestFlight)
1. Build and submit to TestFlight:
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```
2. Install from TestFlight
3. Use a **Sandbox Apple ID** (create in App Store Connect → Users → Sandbox Testers)
4. Sign out of regular Apple ID in Settings → App Store
5. When prompted to purchase, sign in with Sandbox account

### Verifying Purchases Work
1. Open app → Navigate to Paywall
2. Debug info should show: `[Free] Packages: $rc_monthly, $rc_annual`
3. Tap "Start Free Trial" → Sandbox purchase sheet appears
4. Complete purchase → Should show "Welcome to Premium!"

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **AI Chat** | Natural language recipe search powered by Claude AI |
| **Photo-to-Recipe** | Take a photo of food or ingredients, AI identifies them and suggests recipes (Claude Vision) |
| **14 World Cuisines** | African, Asian, European, Latin American, Middle Eastern, Southern, Soul Food, Cajun & Creole, Tex-Mex, BBQ, New England, Midwest, Oceanian, Caribbean |
| **Recipe Cards** | Tabbed view with ingredients, instructions, and chef tips |
| **Save Favorites** | Personal recipe collection stored locally |
| **Shopping List** | Add ingredients from recipes, check off while shopping |
| **Chat History** | Sidebar with conversation sessions |
| **Haptic Feedback** | Native haptics on all interactions |
| **Dark Mode** | Full dark mode support |

### Cooking Tools

| Tool | Description |
|------|-------------|
| **Multiple Timers** | Run several timers simultaneously with notifications |
| **Unit Converter** | Cups ↔ ml, oz ↔ grams, °F ↔ °C |
| **Substitutions** | Find ingredient alternatives |
| **Nutrition Calculator** | Estimate calories and macros |

### Meal Planning

| Feature | Description |
|---------|-------------|
| **Weekly Calendar** | Plan meals for 7 days |
| **Drag & Drop** | Organize meal schedule |
| **Auto Shopping List** | Generate list from meal plan |

### Premium Features (RevenueCat)

| Feature | Free | Premium |
|---------|------|---------|
| AI Requests | 10/day | Unlimited |
| Photo-to-Recipe | 10/day (shared with AI) | Unlimited |
| Restaurant Recipes | 1 trial | Unlimited |
| Voice Input | No | Yes |
| Early Access | No | Yes |

### Restaurant-Inspired Recipes (Premium)

Recreate dishes from popular restaurants:
- Olive Garden, Chipotle, Cheesecake Factory, Chick-fil-A
- Panda Express, Texas Roadhouse, Red Lobster, Cracker Barrel
- P.F. Chang's, In-N-Out, Popeyes, Outback Steakhouse

---

## Technology Stack

### React Native + Expo (Primary - RecipePilotRN/)

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 54 with expo-router 4.x |
| Language | TypeScript 5.x |
| Styling | React Native StyleSheet (inline styles) |
| Animations | react-native-reanimated 4.x (requires New Architecture) |
| Glassmorphism | expo-blur + expo-linear-gradient |
| Storage | @react-native-async-storage/async-storage |
| Haptics | expo-haptics |
| Notifications | expo-notifications |
| Voice Input | expo-speech-recognition (Premium) |
| Photo Recognition | expo-image-picker + Claude Vision API |
| Backend | Supabase (PostgreSQL, Edge Functions, Auth) |
| AI Integration | Claude API (Anthropic) via Supabase Edge Function |
| Payments | RevenueCat (react-native-purchases) |

**Note:** NativeWind was removed due to blank screen issues caused by JSX transform conflicts. The app uses standard React Native StyleSheet.create() for all styling.

### Legacy Next.js + Capacitor (src/ & ios/)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.x with React 19 |
| Styling | TailwindCSS 4.x |
| Native Wrapper | Capacitor 8.x |
| Animations | Framer Motion |

---

## Project Structure

```
recipe-chatbot/
├── RecipePilotRN/              # React Native + Expo (PRIMARY)
│   ├── app/                    # expo-router pages
│   │   ├── _layout.tsx        # Root layout with providers
│   │   ├── index.tsx          # Redirect to chat
│   │   ├── (tabs)/            # Bottom tab navigator
│   │   │   ├── chat.tsx       # Main chat screen
│   │   │   ├── saved.tsx      # Saved recipes
│   │   │   └── settings.tsx   # Settings
│   │   └── (modals)/          # Modal screens
│   │       ├── tools.tsx      # Cooking tools
│   │       ├── meal-planner.tsx
│   │       ├── paywall.tsx    # Premium subscription
│   │       ├── restaurant.tsx # Restaurant recipes
│   │       └── ingredients.tsx
│   ├── src/
│   │   ├── components/        # React Native components
│   │   │   ├── ui/           # GlassView, GradientButton, Badge
│   │   │   ├── chat/         # ChatInterface, MessageBubble, QuickPrompts
│   │   │   ├── recipe/       # RecipeCard, IngredientList
│   │   │   ├── navigation/   # Header, Sidebar
│   │   │   └── shopping/     # TodoList
│   │   ├── lib/              # Services
│   │   │   ├── chat.ts       # Claude API client
│   │   │   ├── supabase.ts   # Supabase client
│   │   │   ├── storage.ts    # AsyncStorage helpers
│   │   │   ├── purchases.ts  # RevenueCat
│   │   │   └── haptics.ts    # expo-haptics
│   │   ├── hooks/            # useAppState, useTheme, useVoiceInput, useImagePicker
│   │   ├── theme/            # colors, gradients, shadows, animations
│   │   ├── types/            # TypeScript definitions
│   │   └── providers/        # AppStateProvider, ThemeProvider
│   ├── assets/               # Images, sounds
│   ├── app.json             # Expo config (static)
│   ├── app.config.js        # Dynamic config with env vars
│   ├── package.json
│   └── eas.json             # EAS Build config with env vars
│
├── src/                       # Legacy Next.js (for Capacitor builds)
├── supabase/                  # Supabase Edge Functions
│   └── functions/chat/       # Claude API proxy
├── ios/                       # Capacitor iOS project
├── android/                   # Capacitor Android project
└── CLAUDE.md                  # This file
```

---

## UI Design System

### Color Palette (Blue Theme - Matching Logo)

```typescript
// src/theme/colors.ts
const Colors = {
  light: {
    // Primary blue matching logo
    primary: '#1a3a8f',
    primaryLight: '#3b5dc9',
    primaryDark: '#132c6b',
    // Warm accent for food elements
    secondary: '#f97316',
    accent: '#ef4444',
    // iOS-style backgrounds
    background: '#f8fafc',
    foreground: '#0f172a',
    card: '#ffffff',
    border: '#e2e8f0',
    muted: '#64748b',
    // Semantic
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    // Glassmorphism
    glassBackground: 'rgba(255, 255, 255, 0.85)',
    glassBackgroundStrong: 'rgba(255, 255, 255, 0.95)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
  },
  dark: {
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    background: '#0f172a',
    foreground: '#f8fafc',
    card: '#1e293b',
    // ... dark variants
  }
};
```

### Gradients

```typescript
// src/theme/gradients.ts
const Gradients = {
  primary: ['#1a3a8f', '#3b5dc9'],      // Blue (logo)
  secondary: ['#f97316', '#fb923c'],    // Orange (food warmth)
  premium: ['#7c3aed', '#a855f7'],      // Purple
  rose: ['#ef4444', '#f87171'],         // Red
  success: ['#22c55e', '#4ade80'],
  userMessage: ['#1a3a8f', '#3b5dc9'],  // User chat bubbles
};
```

### Shadow & Glow Effects

```typescript
// src/theme/shadows.ts
const Shadows = {
  glowPrimary: {
    shadowColor: '#1a3a8f',
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  glowSecondary: {
    shadowColor: '#f97316',
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  glassCard: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 24,
  },
};
```

### Animations (react-native-reanimated)

```typescript
// src/theme/animations.ts
// Timing presets
TimingConfigs.fast    // 200ms
TimingConfigs.normal  // 300ms
TimingConfigs.slow    // 500ms

// Spring presets
SpringConfigs.gentle  // damping: 20, stiffness: 100
SpringConfigs.bouncy  // damping: 10, stiffness: 150
SpringConfigs.stiff   // damping: 25, stiffness: 200

// Animation functions
fadeIn(duration)
fadeOut(duration)
slideUp(distance)
scaleIn()
float()        // Infinite floating
pulse()        // Infinite pulse
bounce()
glowPulse()
pressIn()      // Scale to 0.96
pressOut()     // Scale to 1
```

---

## Data Models

```typescript
// src/types/index.ts

interface Recipe {
  id: string;
  name: string;
  region: WorldRegion;
  cuisine: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  instructions: string[];
  tips?: string[];
  tags: string[];
}

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  recipe?: Recipe;
  imageUri?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  recipeId?: string;
  category: 'prep' | 'shopping' | 'cooking' | 'other';
  createdAt: number;
}

interface AppState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  todos: TodoItem[];
  savedRecipes: Recipe[];
  selectedRegion: WorldRegion | 'all';
}

type WorldRegion =
  | 'african' | 'asian' | 'european' | 'latin-american'
  | 'middle-eastern' | 'southern' | 'soul-food' | 'cajun-creole'
  | 'tex-mex' | 'bbq' | 'new-england' | 'midwest'
  | 'oceanian' | 'caribbean';
```

---

## World Cuisine Regions

| Region | Flag | Examples |
|--------|------|----------|
| African | 🌍 | Ethiopian, Moroccan, Nigerian |
| Asian | 🌏 | Chinese, Japanese, Thai, Indian, Korean |
| European | 🇪🇺 | Italian, French, Spanish, Greek |
| Latin American | 🌎 | Mexican, Brazilian, Peruvian, Argentinian |
| Middle Eastern | 🕌 | Lebanese, Turkish, Persian, Israeli |
| Southern | 🍗 | Fried chicken, biscuits, gravy |
| Soul Food | 🥘 | Collard greens, mac & cheese, candied yams |
| Cajun & Creole | 🦐 | Gumbo, jambalaya, étouffée |
| Tex-Mex | 🌮 | Fajitas, enchiladas, queso |
| BBQ | 🍖 | Texas brisket, Carolina pulled pork, Memphis ribs |
| New England | 🦞 | Clam chowder, lobster rolls |
| Midwest | 🌾 | Casseroles, cheese curds, hot dish |
| Oceanian | 🌊 | Australian, Hawaiian, Polynesian |
| Caribbean | 🏝️ | Jamaican jerk, Cuban, Puerto Rican |

---

## Development

### React Native (RecipePilotRN/)

```bash
cd RecipePilotRN

# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Create development build (required for RevenueCat)
npx expo run:ios
```

### Building for Production

```bash
cd RecipePilotRN

# Build for iOS TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios

# Build for Android Play Store
eas build --platform android --profile production
```

### Legacy Capacitor Build (ios/)

```bash
# Build Next.js
npm run build

# Sync to Capacitor
npx cap sync ios

# Open Xcode
npx cap open ios
```

---

## Environment Setup

### API Configuration (Server-Side)

The Claude API key is stored **server-side** in Supabase Edge Function secrets. Users do NOT need to configure API keys - it's all handled automatically.

```bash
# Set Claude API key on Supabase (already configured)
npx supabase secrets set CLAUDE_API_KEY=sk-ant-xxxxx
```

### RecipePilotRN/.env (Local Development)

```env
EXPO_PUBLIC_SUPABASE_URL=https://bwddfoqaqgrbendjgchr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

### RecipePilotRN/app.config.js (Build-Time Config)

The `app.config.js` exposes Supabase credentials via `expo-constants` for reliable access in production builds:

```javascript
module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bwddfoqaqgrbendjgchr.supabase.co',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJxxx...',
    },
  };
};
```

### EAS Build (eas.json)

Environment variables are configured in `eas.json` for production builds:

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "production": {
      "autoIncrement": false,
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://bwddfoqaqgrbendjgchr.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "oouchie@gmail.com",
        "ascAppId": "6757722794",
        "appleTeamId": "BA7AX9ZFTR"
      }
    }
  }
}
```

**IMPORTANT:** The `env` section in `eas.json` is required for production builds to access Supabase. Without it, the AI chat will not work.

---

## Supabase Configuration

### Project Details

- **Project Name:** RecipePilot
- **Reference ID:** bwddfoqaqgrbendjgchr
- **Region:** East US (Ohio)
- **URL:** https://bwddfoqaqgrbendjgchr.supabase.co

### Edge Function (supabase/functions/chat/)

The chat Edge Function proxies requests to Claude API. The API key is stored as a Supabase secret.

```bash
# Deploy
npx supabase functions deploy chat --project-ref bwddfoqaqgrbendjgchr

# View logs
npx supabase functions logs chat --project-ref bwddfoqaqgrbendjgchr

# List secrets
npx supabase secrets list --project-ref bwddfoqaqgrbendjgchr
```

### Claude API Settings

```typescript
model: 'claude-sonnet-4-20250514'
max_tokens: 2048
```

### Architecture

```
Mobile App → Supabase Edge Function → Claude API
                    ↓
            CLAUDE_API_KEY (secret)

Photo-to-Recipe flow:
expo-image-picker → base64 → Edge Function → Claude Vision API → Recipe JSON
```

The Edge Function supports both text-only and image+text requests. When an image is included, it builds a Claude Vision content array with the base64 image and text prompt. Separate optimized system prompts are used for text vs. image requests.

Users don't need API keys. The Settings screen only shows subscription and app info.

---

## RevenueCat Integration

### Product IDs
- `recipepilot_premium_monthly`
- `recipepilot_premium_yearly`

### Entitlement ID
- `premium`

### API Keys (purchases.ts)
- iOS: `appl_OQnKoMJWXJCotYpzyhQoBCpVZlU`
- Android: `goog_xxx` (TODO: Add when ready)

### Offering Setup
1. Create offering named "default" in RevenueCat
2. Set as "Current" offering
3. Add packages:
   - `$rc_monthly` → attach `recipepilot_premium_monthly`
   - `$rc_annual` → attach `recipepilot_premium_yearly`

---

## Versioning

### React Native (app.json)
- Version: 1.0.1
- Build: 68 (manually increment before each TestFlight submission)

### Legacy iOS (project.pbxproj)
- Marketing Version: 1.0
- Build Number: 25 (deprecated - use React Native build)

---

## Common Issues

### Blank Screen After Build
**Problem:** App shows blue background with no content visible.

**Causes & Fixes:**
1. **NativeWind JSX Transform Conflict** - If using `jsxImportSource: "nativewind"` in babel.config.js but components use StyleSheet, remove it:
   ```javascript
   // babel.config.js - CORRECT (no NativeWind)
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ["babel-preset-expo"],
       plugins: ["react-native-reanimated/plugin"],
     };
   };
   ```

2. **New Architecture (Fabric) Compatibility** - Disable if having issues:
   ```json
   // app.json
   "newArchEnabled": true
   ```

3. **Reanimated Entering Animations** - The `entering={FadeInUp...}` animations may not run correctly, leaving components invisible. Replace with static Views for debugging.

4. **Metro Config** - Remove NativeWind wrapper if not using className styling:
   ```javascript
   // metro.config.js
   const { getDefaultConfig } = require("expo/metro-config");
   module.exports = getDefaultConfig(__dirname);
   ```

### Expo Go SDK Mismatch
Use matching Expo Go version or create a development build:
```bash
npx expo run:ios
```

### RevenueCat Plugin Error
The react-native-purchases plugin requires a development build, not Expo Go. Made defensive with lazy imports to prevent crashes:
```typescript
// lib/purchases.ts uses try/catch for require()
let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  console.warn('react-native-purchases not available');
}
```

### Reanimated Worklets Mismatch
Version mismatch between JS and native - requires development build.

### TestFlight Build Number Error
**Problem:** "Redundant Binary Upload" error.

**Solution:** Increment `buildNumber` in `RecipePilotRN/app.json` and update `CLAUDE.md`:
```json
"ios": {
  "buildNumber": "42"  // Current is 41, increment for next build
}
```

Also update the `**Current Build:**` line at the top of this file.

### Environment Variables Not Working in Build
**Problem:** Supabase calls fail because `process.env.EXPO_PUBLIC_*` is undefined in production builds.

**Solution:**
1. Create `app.config.js` that exposes env vars via `Constants.expoConfig.extra`
2. Use `expo-constants` in code instead of `process.env` directly
3. Add hardcoded fallbacks in `app.config.js` for reliability

```javascript
// app.config.js
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xxx.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJxxx',
  },
});

// In code
import Constants from 'expo-constants';
const extra = Constants.expoConfig?.extra || {};
const SUPABASE_URL = extra.supabaseUrl || '';
```

### react-native-worklets/plugin Not Found
**Problem:** Build fails with "Cannot find module 'react-native-worklets/plugin'".

**Solution:** The app needs react-native-worklets as a peer dependency. Ensure it's in package.json:
```json
"react-native-worklets": "^0.2.0"
```

But use `react-native-reanimated/plugin` in babel.config.js (NOT react-native-worklets/plugin).

---

## Support & Resources

- **Expo Docs:** https://docs.expo.dev
- **NativeWind Docs:** https://www.nativewind.dev
- **Supabase Docs:** https://supabase.com/docs
- **Claude API Docs:** https://docs.anthropic.com
- **RevenueCat Docs:** https://docs.revenuecat.com
- **Reanimated Docs:** https://docs.swmansion.com/react-native-reanimated
