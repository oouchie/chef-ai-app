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
  | 'middle-eastern' | 'north-american' | 'oceanian' | 'caribbean';
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
  --primary: #e85d04;           /* Warm orange - food appeal */
  --primary-hover: #d45003;
  --secondary: #059669;         /* Fresh green - healthy */
  --accent: #6C5CE7;            /* Deep purple - premium */

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
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --card: #171717;
    --foreground: #fafafa;
    --border: #2a2a2a;
    --muted: #a1a1aa;
  }
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
| North American | 🇺🇸 | American, Southern, Cajun |
| Oceanian | 🌊 | Australian, Hawaiian, Polynesian |
| Caribbean | 🏝️ | Jamaican, Cuban, Puerto Rican |

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

Claude returns recipes in a structured JSON block:
```json
{
  "name": "Recipe Name",
  "region": "asian",
  "cuisine": "Thai",
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
| Voice Input | ❌ | ✅ |
| Meal Planning | Basic | Advanced |
| Ad-free | ❌ | ✅ |

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

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select target device/simulator
3. Product → Archive
4. Distribute App → App Store Connect
5. Submit to TestFlight

### Environment Variables

**`.env.local` (local development):**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
NEXT_PUBLIC_REVENUECAT_API_KEY=appl_xxx
```

**Supabase Secrets (production):**
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

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Use CSS variables for theme colors
- Apply `transition-colors` or `transition-all` for interactions
- Use gradients sparingly for CTAs: `bg-gradient-to-r from-amber-500 to-orange-500`

### Animation Guidelines

```tsx
// Fade in animation (defined in globals.css)
<div className="animate-fade-in">

// Loading bounce
<span className="animate-bounce" style={{ animationDelay: '150ms' }}>

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
