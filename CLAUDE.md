# RecipePilot - AI-Powered Recipe Assistant

## Project Overview

**Application Name:** RecipePilot
**Bundle ID:** com.chefai2.app
**Description:** AI-powered recipe discovery, meal planning, and step-by-step cooking assistant
**Target Platform:** iOS 15.0+ (iPhone and iPad), Android
**Distribution:** Apple App Store, Google Play Store

### Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.x with React 19 |
| Language | TypeScript 5.x |
| Styling | TailwindCSS 4.x |
| Native Wrapper | Capacitor 8.x |
| Backend | Supabase (PostgreSQL, Edge Functions, Auth) |
| AI Integration | Claude API (Anthropic) via Supabase Edge Function |
| Payments | RevenueCat (iOS/Android subscriptions) |
| Animations | Framer Motion |

### Project Structure

```
recipe-chatbot/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Main application page
│   │   ├── layout.tsx         # Root layout with metadata
│   │   └── globals.css        # Global styles and CSS variables
│   ├── components/            # React components
│   │   ├── ChatInterface.tsx  # Main chat UI with messages
│   │   ├── Header.tsx         # App header with region selector
│   │   ├── Sidebar.tsx        # Chat session history
│   │   ├── RecipeCard.tsx     # Recipe display component
│   │   ├── CookingTools.tsx   # Timer, converter tools
│   │   ├── MealPlanner.tsx    # Weekly meal planning
│   │   ├── TodoList.tsx       # Shopping/cooking tasks
│   │   ├── SavedRecipes.tsx   # Favorites collection
│   │   ├── Settings.tsx       # User preferences
│   │   └── Paywall.tsx        # Premium subscription UI
│   ├── lib/                   # Utilities and services
│   │   ├── chat.ts           # Claude API client (direct)
│   │   ├── supabase.ts       # Supabase client & Edge Function calls
│   │   ├── storage.ts        # Local storage helpers
│   │   └── purchases.ts      # RevenueCat integration
│   └── types/                # TypeScript definitions
│       └── index.ts          # All type definitions
├── supabase/
│   └── functions/
│       └── chat/             # Claude API Edge Function
│           └── index.ts
├── ios/                      # iOS native project (Capacitor)
├── android/                  # Android native project (Capacitor)
├── public/                   # Static assets
│   └── images/              # App images and icons
├── capacitor.config.ts      # Capacitor configuration
├── tailwind.config.ts       # Tailwind configuration
└── package.json             # Dependencies and scripts
```

---

## Data Models

### Core Types

```typescript
// Recipe - Main content type
interface Recipe {
  id: string;
  name: string;
  region: WorldRegion;
  cuisine: string;
  description: string;
  prepTime: string;      // e.g., "15 mins"
  cookTime: string;      // e.g., "30 mins"
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  instructions: string[];
  tips?: string[];
  imageUrl?: string;
  tags: string[];
}

// Ingredient with structured data
interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

// Chat message with optional recipe
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  recipe?: Recipe;
}

// Chat session for conversation history
interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

// Todo/Shopping item
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  recipeId?: string;
  category: 'prep' | 'shopping' | 'cooking' | 'other';
  createdAt: number;
}

// Global app state
interface AppState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  todos: TodoItem[];
  savedRecipes: Recipe[];
  selectedRegion: WorldRegion | 'all';
}

// World regions for cuisine filtering
type WorldRegion =
  | 'african' | 'asian' | 'european' | 'latin-american'
  | 'middle-eastern' | 'southern' | 'soul-food' | 'cajun-creole'
  | 'tex-mex' | 'bbq' | 'new-england' | 'midwest'
  | 'oceanian' | 'caribbean';
```

---

## iOS UI/UX Design Guidelines

### Design System

- **Follow Apple Human Interface Guidelines** for native feel
- **Safe Area Insets:** All components must respect `env(safe-area-inset-*)` for notched devices
- **Dark Mode:** Full support with CSS `prefers-color-scheme`
- **Dynamic Type:** Base font size 16px to prevent iOS zoom on inputs

### Color Scheme

```css
:root {
  /* Primary Colors */
  --primary: #ff6b35;           /* Warm orange - food appeal */
  --primary-hover: #e85d04;
  --secondary: #4ecdc4;         /* Fresh teal - healthy */
  --accent: #f7931e;            /* Golden accent - warmth */

  /* Background */
  --background: #faf7f2;        /* Warm cream */
  --card: #ffffff;
  --foreground: #1a1a1a;

  /* Semantic */
  --border: #e5e5e5;
  --muted: #6b7280;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;

  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.75);
  --glass-bg-strong: rgba(255, 255, 255, 0.9);
  --glass-border: rgba(255, 255, 255, 0.4);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);

  /* Premium Gradients */
  --gradient-primary: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  --gradient-secondary: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  --gradient-premium: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-rose: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%);

  /* Glow Effects */
  --glow-primary: 0 0 20px rgba(255, 107, 53, 0.4);
  --glow-secondary: 0 0 20px rgba(78, 205, 196, 0.4);
  --glow-rose: 0 0 20px rgba(244, 63, 94, 0.4);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --card: #171717;
    --foreground: #fafafa;
    --border: #2a2a2a;
    --muted: #a1a1aa;

    /* Dark mode glassmorphism */
    --glass-bg: rgba(30, 30, 30, 0.75);
    --glass-bg-strong: rgba(30, 30, 30, 0.9);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}
```

### Glassmorphism Utility Classes

The app uses a premium glassmorphism design system. Key utility classes:

```css
/* Glass backgrounds */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.glass-card {
  background: var(--glass-bg-strong);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.glass-strong {
  background: var(--glass-bg-strong);
  backdrop-filter: blur(24px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

/* Gradient buttons */
.btn-gradient {
  background: var(--gradient-primary);
  color: white;
  font-weight: 600;
}

.btn-gradient-secondary {
  background: var(--gradient-secondary);
  color: white;
}

.btn-gradient-rose {
  background: var(--gradient-rose);
  color: white;
}

.btn-glass {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
}

/* Glow effects */
.shadow-glow-primary { box-shadow: var(--glow-primary); }
.shadow-glow-secondary { box-shadow: var(--glow-secondary); }
.shadow-glow-rose { box-shadow: var(--glow-rose); }

/* Recipe card */
.recipe-card {
  background: var(--glass-bg-strong);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

/* Difficulty badges */
.badge-easy {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.badge-medium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.badge-hard {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}
```

### Premium Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in { animation: fadeIn 0.3s ease-out; }

/* Slide up */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slideUp 0.4s ease-out; }

/* Scale in (for modals) */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-in { animation: scaleIn 0.2s ease-out; }

/* Float (for icons) */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float { animation: float 3s ease-in-out infinite; }

/* Glow pulse */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.3); }
  50% { box-shadow: 0 0 40px rgba(255, 107, 53, 0.6); }
}
.animate-glow { animation: glow 2s ease-in-out infinite; }

/* Shimmer (for loading) */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Typography

- **Headings:** System font (SF Pro Display on iOS)
- **Body:** System font (SF Pro Text on iOS)
- **Font Sizes:** Use Tailwind's responsive sizing
- **Input Fields:** Always 16px minimum to prevent iOS zoom

### Layout Guidelines

| Element | Specification |
|---------|---------------|
| Minimum tap target | 44x44 points |
| Spacing grid | 4px base (0.25rem) |
| Card border radius | 12px (rounded-xl) |
| Container max-width | 1280px (max-w-6xl) |
| Mobile padding | 16px (p-4) |

### Safe Area Handling

```tsx
// Header - respect top safe area (notch)
<header style={{ paddingTop: 'env(safe-area-inset-top)' }}>

// Bottom input - respect home indicator
<div style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>

// Fixed buttons - account for safe areas
<button style={{
  bottom: 'calc(5rem + env(safe-area-inset-bottom))',
  left: 'max(1rem, env(safe-area-inset-left))'
}}>
```

---

## Core Features

### 1. AI-Powered Recipe Search

**Natural Language Processing:**
- Users ask in plain English: "What can I make with chicken?"
- Claude API processes requests and returns structured recipes
- Supports ingredient-based, cuisine-based, and dietary searches

**Implementation:**
```typescript
// Call via Supabase Edge Function (recommended - keeps API key secure)
import { sendChatMessage } from '@/lib/supabase';

const response = await sendChatMessage(
  userMessage,
  selectedRegion,
  conversationHistory
);
```

### 2. Recipe Display

**Recipe Card Component:**
- High-quality image display
- Prep/cook time badges
- Difficulty indicator
- Servings adjuster
- Save to favorites
- Add ingredients to shopping list

### 3. Cooking Mode (CookingTools)

- Step-by-step instructions
- Multiple timers with notifications
- Unit converter (cups ↔ ml, °F ↔ °C)
- Screen stays awake during cooking

### 4. Meal Planning

- Weekly calendar view
- Drag-and-drop meal assignment
- Nutritional summary per day
- Auto-generate shopping list from meal plan

### 5. Shopping List (TodoList)

- Auto-populate from recipes
- Manual item addition
- Category organization
- Check off while shopping
- Clear completed items

### 6. World Cuisine Regions

| Region | Flag | Example Cuisines |
|--------|------|------------------|
| African | 🌍 | Ethiopian, Moroccan, Nigerian |
| Asian | 🌏 | Chinese, Japanese, Thai, Indian |
| European | 🇪🇺 | Italian, French, Spanish, Greek |
| Latin American | 🌎 | Mexican, Brazilian, Peruvian |
| Middle Eastern | 🕌 | Lebanese, Turkish, Persian |
| Oceanian | 🌊 | Australian, Hawaiian, Polynesian |
| Caribbean | 🏝️ | Jamaican, Cuban, Puerto Rican |

**US Regional Cuisines (expanded from North American):**

| Region | Flag | Description |
|--------|------|-------------|
| Southern | 🍗 | Fried chicken, biscuits, gravy, comfort classics |
| Soul Food | 🥘 | Collard greens, mac & cheese, candied yams |
| Cajun & Creole | 🦐 | Gumbo, jambalaya, étouffée, Louisiana flavors |
| Tex-Mex | 🌮 | Fajitas, enchiladas, queso, Texas-Mexican fusion |
| BBQ | 🍖 | Texas brisket, Carolina pulled pork, Memphis ribs |
| New England | 🦞 | Clam chowder, lobster rolls, coastal classics |
| Midwest | 🌾 | Casseroles, cheese curds, farm-to-table comfort |

---

## Claude API Integration

### Edge Function Configuration

**Location:** `supabase/functions/chat/index.ts`

**Environment Variables (Supabase Secrets):**
```
CLAUDE_API_KEY=sk-ant-xxxxx
```

**API Settings:**
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: conversationHistory,
  }),
});
```

### System Prompt

The AI assistant is configured as "Chef AI" with:
- Warm, encouraging personality
- Cultural context about dishes
- Practical tips for home cooks
- Ingredient substitution suggestions
- Dietary modification support

### Recipe JSON Format

Claude returns recipes in a structured JSON block.

**Valid region values:** `african`, `asian`, `european`, `latin-american`, `middle-eastern`, `southern`, `soul-food`, `cajun-creole`, `tex-mex`, `bbq`, `new-england`, `midwest`, `oceanian`, `caribbean`

```json
{
  "name": "Recipe Name",
  "region": "southern",
  "cuisine": "Southern Comfort",
  "description": "Brief description",
  "prepTime": "15 mins",
  "cookTime": "30 mins",
  "servings": 4,
  "difficulty": "Easy",
  "ingredients": [
    {"name": "ingredient", "amount": "1", "unit": "cup", "notes": "optional"}
  ],
  "instructions": ["Step 1", "Step 2"],
  "tips": ["Tip 1", "Tip 2"],
  "tags": ["tag1", "tag2"]
}
```

---

## Supabase Configuration

### Database Tables

```sql
-- User profiles with premium status
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  daily_requests INT DEFAULT 0
);

-- Saved recipes (future feature)
CREATE TABLE saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  recipe_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Edge Functions

| Function | Purpose |
|----------|---------|
| `chat` | Claude API proxy - handles AI conversations |

**Deploying Edge Functions:**
```bash
npx supabase functions deploy chat
```

**Setting Secrets:**
```bash
npx supabase secrets set CLAUDE_API_KEY=sk-ant-xxxxx
```

---

## RevenueCat Integration

### Configuration

**Package:** `@revenuecat/purchases-capacitor`

**Product IDs:**
- `recipepilot_premium_monthly` - Monthly subscription
- `recipepilot_premium_yearly` - Annual subscription (discounted)

### Premium Features

| Feature | Free Tier | Premium |
|---------|-----------|---------|
| AI Requests | 10/day | Unlimited |
| Restaurant Recipes | 1 free trial | Unlimited |
| Voice Input | ❌ | ✅ |
| Meal Planning | Basic | Advanced |
| Ad-free | ❌ | ✅ |

### Restaurant Recipes Feature (Premium)

Users can get homemade recipes inspired by their favorite restaurants:

**Component:** `src/components/RestaurantRecipes.tsx`

**Features:**
- Curated list of 12 popular restaurants (Olive Garden, Chipotle, Chick-fil-A, etc.)
- Search for any restaurant
- Popular dishes per restaurant with one-tap recipe generation
- 1 free trial for non-premium users, then paywall

**Popular Restaurants Included:**
- Olive Garden, Chipotle, Cheesecake Factory, Chick-fil-A
- Panda Express, Texas Roadhouse, Red Lobster, Cracker Barrel
- P.F. Chang's, In-N-Out, Popeyes, Outback Steakhouse

**Trial Tracking:**
```typescript
import { hasUsedRestaurantTrial, markRestaurantTrialUsed } from '@/lib/storage';

// Check if user has used their free trial
const trialUsed = hasUsedRestaurantTrial();

// Mark trial as used
markRestaurantTrialUsed();
```

### Implementation

```typescript
import { purchaseService } from '@/lib/purchases';

// Initialize on app start
await purchaseService.initialize();

// Check status
const { isPremium } = await purchaseService.getSubscriptionStatus();

// Purchase
const result = await purchaseService.purchasePremium();
```

---

## Build & Deployment

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
http://localhost:3000
```

### Mobile Build

```bash
# Build Next.js static export
npm run build

# Sync with native projects
npx cap sync

# Open in Xcode
npx cap open ios

# Open in Android Studio
npx cap open android
```

### iOS Deployment (TestFlight)

**Manual Deployment:**
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select target device/simulator
3. Product → Archive
4. Distribute App → App Store Connect
5. Submit to TestFlight

**CI/CD (GitHub Actions + Fastlane):**
- Automated builds trigger on push to `main` branch
- Fastlane handles signing, building, and TestFlight upload
- Build number must be incremented for each TestFlight upload

### iOS Versioning

| Setting | Location | Purpose |
|---------|----------|---------|
| `MARKETING_VERSION` | project.pbxproj | App Store version (e.g., 1.0, 1.1) |
| `CURRENT_PROJECT_VERSION` | project.pbxproj | Build number for TestFlight (must increment) |

**Current versions:**
- Marketing Version: 1.0
- Build Number: 11

### Environment Variables

**`.env.local` (local development):**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
NEXT_PUBLIC_REVENUECAT_API_KEY=appl_xxx
```

**GitHub Repository Secrets (CI/CD):**

Required secrets for iOS TestFlight deployment (Settings → Secrets → Actions):

| Secret | Purpose |
|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for API calls |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `IOS_CERTIFICATE_P12` | Base64-encoded iOS distribution certificate |
| `IOS_CERTIFICATE_PASSWORD` | Password for the P12 certificate |
| `IOS_PROVISIONING_PROFILE` | Base64-encoded provisioning profile |
| `APP_STORE_CONNECT_API_KEY` | Base64-encoded App Store Connect API key (.p8) |
| `APP_STORE_CONNECT_API_KEY_ID` | API Key ID from App Store Connect |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID from App Store Connect |
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `PROVISIONING_PROFILE_NAME` | Name of the provisioning profile |

**Supabase Edge Function Secrets (production):**
```
CLAUDE_API_KEY=sk-ant-xxx
```

---

## Component Guidelines

### Creating New Components

```tsx
'use client';

import { useState } from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false);

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <button
        onClick={onAction}
        className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Action
      </button>
    </div>
  );
}
```

### Styling Conventions

- Use Tailwind utility classes combined with glassmorphism utilities
- Follow mobile-first responsive design
- Use CSS variables for theme colors
- Apply `transition-all` for smooth interactions
- Use glassmorphism classes for containers: `.glass`, `.glass-card`, `.glass-strong`
- Use gradient button classes for CTAs: `.btn-gradient`, `.btn-gradient-secondary`, `.btn-gradient-rose`
- Add glow effects on hover: `hover:shadow-glow-primary`

**Common Patterns:**
```tsx
// Glass container
<div className="glass rounded-xl p-4">

// Premium button
<button className="btn-gradient px-4 py-2 rounded-lg hover:shadow-glow-primary transition-all">

// Glass input with focus glow
<input className="glass border border-white/30 rounded-xl px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-glow-primary transition-all" />

// Glass panel (sidebars, modals)
<div className="glass-strong border-l border-white/20">

// Difficulty badge
<span className="badge-easy px-3 py-1 rounded-full text-xs font-semibold">Easy</span>
```

### Animation Guidelines

```tsx
// Fade in animation (defined in globals.css)
<div className="animate-fade-in">

// Slide up (for lists, cards)
<div className="animate-slide-up">

// Scale in (for modals)
<div className="animate-scale-in">

// Float (for decorative icons)
<div className="animate-float">

// Glow pulse (for important elements)
<button className="animate-glow">

// Loading shimmer
<div className="animate-shimmer">

// Framer Motion for complex animations
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

---

## Testing

### Manual Testing Checklist

- [ ] App loads without errors
- [ ] Chat sends messages and receives AI responses
- [ ] Recipes display correctly with all fields
- [ ] Region filter changes AI context
- [ ] Recipes can be saved to favorites
- [ ] Shopping list items can be added/checked/deleted
- [ ] Settings modal opens and closes
- [ ] Paywall displays for free users on premium features
- [ ] iOS safe areas respected (no content under notch/home indicator)
- [ ] Dark mode styling correct

### Device Testing

- iPhone SE (small screen)
- iPhone 14 Pro (notch + Dynamic Island)
- iPhone 15 Pro Max (large screen)
- iPad (tablet layout)

---

## Common Issues & Solutions

### iOS Layout Issues

**Problem:** Content hidden under notch or home indicator
**Solution:** Apply safe area insets to header and bottom input area

### API Key Not Working

**Problem:** Claude API returns errors
**Solution:**
1. Verify `CLAUDE_API_KEY` is set in Supabase secrets
2. Deploy edge function: `npx supabase functions deploy chat`
3. Check Supabase Edge Function logs

### Build Fails

**Problem:** Capacitor sync fails
**Solution:**
```bash
rm -rf .next out
npm run build
npx cap sync ios
```

### Build Fails: "supabaseUrl is required"

**Problem:** Next.js static export fails with Supabase initialization error
**Solution:** The Supabase client uses lazy initialization to avoid build-time errors. If this error occurs, ensure `src/lib/supabase.ts` uses the `getSupabase()` pattern:
```typescript
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}
```

### TestFlight Upload Fails: "bundle version must be higher"

**Problem:** iOS build rejected because build number already exists
**Solution:** Increment `CURRENT_PROJECT_VERSION` in `ios/App/App.xcodeproj/project.pbxproj`:
```
CURRENT_PROJECT_VERSION = 5;  // Must be higher than previous upload
```
Both Debug and Release configurations need to be updated.

### Voice Input Not Working

**Problem:** Microphone permission denied
**Solution:** Check iOS Settings → RecipePilot → Microphone permission

---

## Roadmap (Future Features)

- [ ] User authentication (Supabase Auth)
- [ ] Cloud sync for saved recipes
- [ ] Image recognition for ingredients
- [ ] Barcode scanner for packaged foods
- [ ] Social sharing of recipes
- [ ] Recipe collections/folders
- [ ] Cooking history tracking
- [ ] Nutritional information display
- [ ] Apple Watch companion app
- [ ] Siri Shortcuts integration
- [ ] Widget for meal of the day

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Capacitor Docs:** https://capacitorjs.com/docs
- **Claude API Docs:** https://docs.anthropic.com
- **RevenueCat Docs:** https://docs.revenuecat.com
- **Next.js Docs:** https://nextjs.org/docs
- **TailwindCSS Docs:** https://tailwindcss.com/docs
