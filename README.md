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
- **Unit Converter** - Convert between cups, ml, oz, grams, F, C
- **Ingredient Substitutions** - Find alternatives for missing ingredients
- **Nutrition Calculator** - Estimate nutritional information

## Premium Features ($4.99/month)

| Feature | Free | Premium |
|---------|------|---------|
| AI Requests | 10/day | Unlimited |
| Restaurant Recipes | 1 lifetime trial | Unlimited |
| Meal Planning | No | Yes |
| Voice Input | No | Yes |
| Ad-Free | No | Yes |

### Subscription Pricing
- **Monthly:** $4.99/month
- **Yearly:** $29.99/year (Save 50%)
- **7-day free trial** included with subscription

### Restaurant-Inspired Recipes (Premium)
Recreate dishes from popular restaurants:
- Olive Garden, Chipotle, Cheesecake Factory, Chick-fil-A
- Panda Express, Texas Roadhouse, Red Lobster, Cracker Barrel
- P.F. Chang's, In-N-Out, Popeyes, Outback Steakhouse

### Meal Planning (Premium)
- **Weekly Calendar** - Plan meals for the entire week
- **Drag & Drop** - Easily organize your meal schedule
- **Auto Shopping List** - Generate lists from your meal plan

## Free Usage Rules

1. **AI Chat:** 10 requests per day for free users
2. **Restaurant Recipes:** 1 lifetime free trial, then premium-locked
3. **Meal Planning:** Premium feature only (no free access)
4. **Cooking Tools:** Always free (timers, converters, substitutions)
5. **Recipe Saving:** Always free

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native + Expo SDK 52 |
| Navigation | expo-router 4.x (file-based) |
| Styling | React Native StyleSheet |
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

### StoreKit Testing (iOS)

For testing in-app purchases during development:
1. Use Xcode's StoreKit Configuration file if available
2. RevenueCat sandbox mode is enabled by default in development
3. Test purchases use sandbox Apple IDs

## Building for Production

### iOS (TestFlight)

```bash
cd RecipePilotRN

# Build and auto-submit to TestFlight
eas build --platform ios --profile production --auto-submit

# Or build and submit separately
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
|-- app/                    # expo-router pages
|   |-- (tabs)/            # Bottom tab screens
|   |   |-- chat.tsx       # Main chat interface
|   |   |-- saved.tsx      # Saved recipes
|   |   |-- shopping.tsx   # Shopping list
|   |   |-- settings.tsx   # Settings
|   |-- (modals)/          # Modal screens
|       |-- tools.tsx      # Cooking tools
|       |-- meal-planner.tsx # Meal planning (Premium)
|       |-- paywall.tsx    # Subscription
|       |-- restaurant.tsx # Restaurant recipes
|-- src/
|   |-- components/        # UI components
|   |-- lib/              # Services (API, storage, purchases)
|   |-- theme/            # Colors, gradients, animations
|   |-- types/            # TypeScript definitions
|   |-- providers/        # Context providers
|-- assets/               # Images, sounds
```

## Version

- **App Version:** 1.0.0
- **Build Number:** 47
- **Bundle ID:** com.chefai2.app

## License

Proprietary - All rights reserved.

## Contact

For support or inquiries, please visit [1865freemoney.com](https://1865freemoney.com).
