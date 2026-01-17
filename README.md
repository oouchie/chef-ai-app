# RecipePilot

AI-powered recipe discovery and cooking assistant for iOS and Android.

![RecipePilot](RecipePilotRN/assets/images/icon.png)

## Features

### AI-Powered Recipe Discovery
- **Natural Language Search** - Ask for recipes in plain English ("What can I make with chicken and rice?")
- **Claude AI Integration** - Powered by Anthropic's Claude for intelligent recipe suggestions
- **14 World Cuisine Regions** - Filter by African, Asian, European, Latin American, Middle Eastern, Southern, Soul Food, Cajun & Creole, Tex-Mex, BBQ, New England, Midwest, Oceanian, and Caribbean

### Recipe Management
- **Interactive Recipe Cards** - Tabbed view for ingredients, instructions, and chef tips
- **Save Favorites** - Build your personal recipe collection
- **Smart Shopping List** - Add ingredients directly from recipes with one tap
- **Categorized Items** - Organize shopping list by category

### Cooking Tools
- **Multiple Timers** - Run several timers simultaneously
- **Unit Converter** - Convert between cups, ml, oz, grams, °F, °C
- **Ingredient Substitutions** - Find alternatives for missing ingredients
- **Nutrition Calculator** - Estimate nutritional information

### Meal Planning
- **Weekly Calendar** - Plan meals for the entire week
- **Drag & Drop** - Easily organize your meal schedule
- **Auto Shopping List** - Generate lists from your meal plan

### Premium Features
- **Unlimited AI Requests** - No daily limits
- **Restaurant-Inspired Recipes** - Recreate dishes from Olive Garden, Chipotle, Chick-fil-A, and more
- **Voice Input** - Search by speaking
- **Ad-Free Experience**

## Screenshots

Coming soon...

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native + Expo SDK 52 |
| Navigation | expo-router 4.x (file-based) |
| Styling | NativeWind 4.x (Tailwind CSS) |
| Animations | react-native-reanimated 3.x |
| UI Effects | expo-blur, expo-linear-gradient |
| Backend | Supabase (PostgreSQL, Edge Functions) |
| AI | Claude API (Anthropic) |
| Payments | RevenueCat |
| Haptics | expo-haptics |

## Design

- **Glassmorphism UI** - Modern frosted glass effects
- **Blue Theme** - Primary color matching the compass/pepper logo
- **60fps Animations** - Smooth native animations throughout
- **Dark Mode** - Full dark mode support
- **iOS Native Feel** - Designed following Apple Human Interface Guidelines

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/oouchie/chef-ai-app.git
cd chef-ai-app/RecipePilotRN

# Install dependencies
npm install

# Start development server
npx expo start
```

### Environment Variables

Create a `.env` file in the RecipePilotRN directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Building for Production

### iOS (TestFlight)

```bash
cd RecipePilotRN
eas build --platform ios --profile production
eas submit --platform ios
```

### Android (Play Store)

```bash
cd RecipePilotRN
eas build --platform android --profile production
eas submit --platform android
```

## Project Structure

```
RecipePilotRN/
├── app/                    # expo-router pages
│   ├── (tabs)/            # Bottom tab screens
│   │   ├── chat.tsx       # Main chat interface
│   │   ├── saved.tsx      # Saved recipes
│   │   └── settings.tsx   # Settings
│   └── (modals)/          # Modal screens
│       ├── tools.tsx      # Cooking tools
│       ├── meal-planner.tsx
│       ├── paywall.tsx
│       └── restaurant.tsx
├── src/
│   ├── components/        # UI components
│   ├── lib/              # Services (API, storage)
│   ├── theme/            # Colors, gradients, animations
│   ├── types/            # TypeScript definitions
│   └── providers/        # Context providers
└── assets/               # Images, sounds
```

## Version

- **App Version:** 1.0.0
- **Build Number:** 25
- **Bundle ID:** com.chefai2.app

## License

Proprietary - All rights reserved.

## Contact

For support or inquiries, please visit [1865freemoney.com](https://1865freemoney.com).
