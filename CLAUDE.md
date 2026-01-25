# RecipePilot - AI-Powered Recipe Assistant

## Project Overview

**Application Name:** RecipePilot
**Bundle ID:** com.chefai2.app
**Description:** AI-powered recipe discovery, meal planning, and step-by-step cooking assistant
**Target Platform:** iOS 15.0+ (iPhone and iPad), Android
**Distribution:** Apple App Store, Google Play Store
**Current Build:** 47

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **AI Chat** | Natural language recipe search powered by Claude AI |
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
| Restaurant Recipes | 1 trial | Unlimited |
| Voice Input | No | Yes |
| Ad-free | No | Yes |

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
| Framework | Expo SDK 52 with expo-router 4.x |
| Language | TypeScript 5.x |
| Styling | React Native StyleSheet (inline styles) |
| Animations | react-native-reanimated 3.x |
| Glassmorphism | expo-blur + expo-linear-gradient |
| Storage | @react-native-async-storage/async-storage |
| Haptics | expo-haptics |
| Notifications | expo-notifications |
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
│   │   ├── hooks/            # useAppState, useTheme
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
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://bwddfoqaqgrbendjgchr.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJxxx..."
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
```

Users don't need API keys. The Settings screen only shows subscription and app info.

---

## RevenueCat Integration

### Product IDs
- `recipepilot_premium_monthly`
- `recipepilot_premium_yearly`

### Entitlement ID
- `premium`

### API Keys (app.json)
- iOS: `appl_xxx` (replace with actual)
- Android: `goog_xxx` (replace with actual)

---

## Versioning

### React Native (app.json)
- Version: 1.0.0
- Build: 41 (manually increment before each TestFlight submission)

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
   "newArchEnabled": false
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
