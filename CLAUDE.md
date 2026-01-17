# RecipePilot - AI-Powered Recipe Assistant

## Project Overview

**Application Name:** RecipePilot
**Bundle ID:** com.chefai2.app
**Description:** AI-powered recipe discovery, meal planning, and step-by-step cooking assistant
**Target Platform:** iOS 15.0+ (iPhone and iPad), Android
**Distribution:** Apple App Store, Google Play Store
**Current Build:** 25

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
| Styling | NativeWind 4.x (Tailwind for React Native) |
| Animations | react-native-reanimated 3.x |
| Glassmorphism | expo-blur + expo-linear-gradient |
| Storage | @react-native-async-storage/async-storage |
| Haptics | expo-haptics |
| Notifications | expo-notifications |
| Backend | Supabase (PostgreSQL, Edge Functions, Auth) |
| AI Integration | Claude API (Anthropic) via Supabase Edge Function |
| Payments | RevenueCat (react-native-purchases) |

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
│   ├── app.json             # Expo config
│   ├── package.json
│   └── eas.json             # EAS Build config
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

### RecipePilotRN/.env

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

### Supabase Edge Function Secrets

```bash
npx supabase secrets set CLAUDE_API_KEY=sk-ant-xxxxx
```

### EAS Build (eas.json)

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

---

## Supabase Configuration

### Edge Function (supabase/functions/chat/)

```bash
# Deploy
npx supabase functions deploy chat

# View logs
npx supabase functions logs chat
```

### Claude API Settings

```typescript
model: 'claude-sonnet-4-20250514'
max_tokens: 2048
```

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
- Build: Auto-increment on EAS Build

### Legacy iOS (project.pbxproj)
- Marketing Version: 1.0
- Build Number: 25

---

## Common Issues

### Expo Go SDK Mismatch
Use matching Expo Go version or create a development build:
```bash
npx expo run:ios
```

### RevenueCat Plugin Error
The react-native-purchases plugin requires a development build, not Expo Go.

### Reanimated Worklets Mismatch
Version mismatch between JS and native - requires development build.

### TestFlight Build Number Error
Increment `CURRENT_PROJECT_VERSION` in `ios/App/App.xcodeproj/project.pbxproj`.

---

## Support & Resources

- **Expo Docs:** https://docs.expo.dev
- **NativeWind Docs:** https://www.nativewind.dev
- **Supabase Docs:** https://supabase.com/docs
- **Claude API Docs:** https://docs.anthropic.com
- **RevenueCat Docs:** https://docs.revenuecat.com
- **Reanimated Docs:** https://docs.swmansion.com/react-native-reanimated
