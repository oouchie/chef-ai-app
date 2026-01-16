# RecipePilot - React Native

AI-powered recipe discovery, meal planning, and step-by-step cooking assistant built with React Native and Expo.

## Tech Stack

- **Framework**: Expo SDK 52+ with expo-router 4.x
- **Styling**: NativeWind 4.x (Tailwind for React Native)
- **Animations**: react-native-reanimated 3.x (60fps native animations)
- **Glassmorphism**: expo-blur + expo-linear-gradient
- **Storage**: @react-native-async-storage/async-storage
- **Haptics**: expo-haptics
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **AI**: Claude API (Anthropic)
- **Payments**: RevenueCat (react-native-purchases)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

## Project Structure

```
RecipePilotRN/
├── app/                    # expo-router pages
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Redirect to chat
│   ├── (tabs)/            # Tab navigator
│   │   ├── chat.tsx       # Main chat screen
│   │   ├── saved.tsx      # Saved recipes
│   │   └── settings.tsx   # Settings
│   └── (modals)/          # Modal screens
│       ├── tools.tsx      # Cooking tools
│       ├── paywall.tsx    # Premium subscription
│       └── ...
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable primitives
│   │   ├── chat/         # Chat components
│   │   ├── recipe/       # Recipe components
│   │   └── ...
│   ├── lib/              # Utilities and services
│   ├── hooks/            # Custom hooks
│   ├── theme/            # Colors, gradients, shadows
│   ├── types/            # TypeScript definitions
│   └── providers/        # Context providers
├── assets/               # Images, sounds
└── app.json             # Expo config
```

## Features

- AI-powered recipe chat with Claude
- 14 world cuisine regions
- Recipe cards with ingredients, instructions, tips
- Shopping list management
- Cooking timers and unit converter
- Ingredient substitutions
- Meal planning calendar
- Restaurant-inspired recipes (Premium)
- Premium subscriptions via RevenueCat

## Building for Production

```bash
# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

## License

Proprietary - All rights reserved
