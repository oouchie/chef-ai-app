# RecipePilot - AI-Powered Recipe Assistant

## Project Overview

**Application Name:** RecipePilot
**Bundle ID:** com.chefai2.app
**Description:** AI-powered recipe discovery, meal planning, and step-by-step cooking assistant
**Target Platform:** iOS 15.0+ (iPhone and iPad), Android
**Distribution:** Apple App Store, Google Play Store

## Technology Stack

The project has two implementations:

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
| Backend | Supabase (PostgreSQL, Edge Functions, Auth) |
| AI Integration | Claude API (Anthropic) via Supabase Edge Function |
| Payments | RevenueCat (react-native-purchases) |

### Legacy Next.js + Capacitor (src/)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.x with React 19 |
| Language | TypeScript 5.x |
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
│   │   │   ├── ui/           # GlassView, GradientButton, etc.
│   │   │   ├── chat/         # ChatInterface, MessageBubble
│   │   │   ├── recipe/       # RecipeCard
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
├── src/                       # Legacy Next.js (for reference)
├── supabase/                  # Supabase Edge Functions
│   └── functions/chat/       # Claude API proxy
├── ios/                       # Legacy Capacitor iOS
├── android/                   # Legacy Capacitor Android
└── CLAUDE.md                  # This file
```

---

## React Native Development

### Getting Started

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
```

### Building for TestFlight

```bash
cd RecipePilotRN

# Build for iOS
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

### Environment Setup

Create `.env` file in RecipePilotRN/:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

### EAS Build Configuration

Update `eas.json` with your credentials:
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

## Data Models

### Core Types (src/types/index.ts)

```typescript
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

## UI Design System

### Color Palette (src/theme/colors.ts)

```typescript
const Colors = {
  light: {
    primary: '#ff6b35',      // Warm orange
    secondary: '#4ecdc4',    // Fresh teal
    accent: '#f7931e',       // Golden
    background: '#faf7f2',   // Warm cream
    foreground: '#1a1a1a',
    // Glassmorphism
    glassBackground: 'rgba(255, 255, 255, 0.75)',
    glassBackgroundStrong: 'rgba(255, 255, 255, 0.9)',
    glassBorder: 'rgba(255, 255, 255, 0.4)',
  },
  dark: {
    // Dark mode variants
  }
};
```

### Gradients (src/theme/gradients.ts)

```typescript
const Gradients = {
  primary: ['#ff6b35', '#f7931e'],
  secondary: ['#4ecdc4', '#44a08d'],
  premium: ['#667eea', '#764ba2'],
  rose: ['#f43f5e', '#ec4899'],
};
```

### Glassmorphism Components

- `GlassView` - Container with blur effect (expo-blur)
- `GradientButton` - Animated gradient buttons
- `GlassInput` - Text input with glass styling
- `GlassButton` - Touch button with glass effect

### Animations (react-native-reanimated)

```typescript
// Available animation presets in src/theme/animations.ts
Animations.fadeIn(duration)
Animations.slideUp(distance)
Animations.scaleIn()
Animations.float()
Animations.pulse()
Animations.bounce()
```

---

## Core Features

### 1. AI Chat (ChatInterface)
- Natural language recipe requests
- Claude API via Supabase Edge Function
- Recipe cards embedded in responses

### 2. Recipe Cards (RecipeCard)
- Tabbed interface: Ingredients / Instructions / Tips
- Save to favorites
- Add ingredients to shopping list

### 3. Shopping List (TodoList)
- Categorized items
- Check off while shopping
- Add from recipes

### 4. Cooking Tools (tools.tsx)
- Multiple timers
- Unit converter
- Ingredient substitutions

### 5. Meal Planner (meal-planner.tsx)
- Weekly calendar view
- Drag-and-drop

### 6. Premium Features (paywall.tsx)
- RevenueCat subscriptions
- Unlimited AI requests
- Restaurant recipes
- Voice input

---

## World Cuisine Regions

| Region | Flag | Examples |
|--------|------|----------|
| African | 🌍 | Ethiopian, Moroccan |
| Asian | 🌏 | Chinese, Japanese, Thai |
| European | 🇪🇺 | Italian, French |
| Latin American | 🌎 | Mexican, Brazilian |
| Middle Eastern | 🕌 | Lebanese, Turkish |
| Southern | 🍗 | Fried chicken, biscuits |
| Soul Food | 🥘 | Collard greens, mac & cheese |
| Cajun & Creole | 🦐 | Gumbo, jambalaya |
| Tex-Mex | 🌮 | Fajitas, enchiladas |
| BBQ | 🍖 | Texas brisket, ribs |
| New England | 🦞 | Clam chowder, lobster |
| Midwest | 🌾 | Casseroles |
| Oceanian | 🌊 | Australian, Hawaiian |
| Caribbean | 🏝️ | Jamaican, Cuban |

---

## Supabase Configuration

### Edge Function (supabase/functions/chat/)

```bash
# Deploy
npx supabase functions deploy chat

# Set secrets
npx supabase secrets set CLAUDE_API_KEY=sk-ant-xxxxx
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

### Premium Features

| Feature | Free | Premium |
|---------|------|---------|
| AI Requests | 10/day | Unlimited |
| Restaurant Recipes | 1 trial | Unlimited |
| Voice Input | No | Yes |
| Ad-free | No | Yes |

---

## Build Commands

### React Native (RecipePilotRN/)

```bash
# Development
npx expo start
npx expo start --ios
npx expo start --android

# Production builds
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Legacy Next.js (src/)

```bash
npm run dev          # Development
npm run build        # Build
npx cap sync ios     # Sync to iOS
npx cap open ios     # Open Xcode
```

---

## Versioning

### React Native (app.json)
- Version: 1.0.0
- Auto-increment on EAS Build

### Legacy iOS (project.pbxproj)
- Marketing Version: 1.0
- Build Number: 17

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
Version mismatch between JS and native - requires development build or matching SDK versions.

---

## Support & Resources

- **Expo Docs:** https://docs.expo.dev
- **NativeWind Docs:** https://www.nativewind.dev
- **Supabase Docs:** https://supabase.com/docs
- **Claude API Docs:** https://docs.anthropic.com
- **RevenueCat Docs:** https://docs.revenuecat.com
- **Reanimated Docs:** https://docs.swmansion.com/react-native-reanimated
