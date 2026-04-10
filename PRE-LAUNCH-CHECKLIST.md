# RecipePilot Pre-Launch Checklist

## Overview
Complete checklist for launching RecipePilot on iOS App Store and Google Play Store.

**Target Launch Date:** _______________
**App Version:** 1.0.0
**Build Number:** 45+

---

## 1. Code Freeze Checklist

### Final Code Review
- [ ] All features implemented and working
- [ ] No TODO comments left in production code
- [ ] No console.log statements (use __DEV__ check)
- [ ] No hardcoded test data
- [ ] Error boundaries implemented
- [ ] Crash reporting integrated (Sentry/Bugsnag)
- [ ] Analytics events firing correctly

### Environment Variables
- [ ] Production Supabase URL configured
- [ ] Production Supabase anon key configured
- [ ] RevenueCat production API keys set
- [ ] All secrets removed from client code

### Build Configuration
- [ ] `app.json` version updated (1.0.0)
- [ ] `app.json` buildNumber incremented
- [ ] `eas.json` production profile configured
- [ ] Bundle identifier correct (com.chefai2.app)
- [ ] App name correct ("RecipePilot")

---

## 2. App Store Assets (iOS)

### App Icon
- [ ] 1024x1024 PNG (no alpha, no rounded corners)
- [ ] Icon follows Apple HIG
- [ ] No text in icon
- [ ] Recognizable at small sizes

### Screenshots (Required)
| Device | Size | Count |
|--------|------|-------|
| iPhone 6.7" | 1290 x 2796 | 3-10 |
| iPhone 6.5" | 1284 x 2778 | 3-10 |
| iPhone 5.5" | 1242 x 2208 | 3-10 |
| iPad Pro 12.9" | 2048 x 2732 | Optional |

#### Screenshot Content Plan
1. **Hero Shot** - Main chat interface with recipe
2. **Recipe Card** - Beautiful recipe display
3. **World Cuisines** - 14 cuisine selection
4. **Cooking Tools** - Timers and converter
5. **Meal Planner** - Weekly calendar view
6. **Dark Mode** - Premium dark theme

### App Preview Video (Optional but Recommended)
- [ ] 15-30 seconds
- [ ] Shows key features
- [ ] No hands in frame (use screen recording)
- [ ] Background music (royalty-free)

---

## 3. App Store Connect Setup (iOS)

### App Information
- [ ] **Name:** RecipePilot - AI Recipe Chef
- [ ] **Subtitle:** Cook Smarter with AI (30 chars max)
- [ ] **Category:** Food & Drink
- [ ] **Secondary Category:** Lifestyle (optional)

### Description (4000 chars max)
```
🍳 Meet RecipePilot - Your AI-Powered Kitchen Companion

Transform the way you cook with intelligent recipe suggestions tailored to your taste. Whether you're craving Italian pasta, Southern comfort food, or exploring exotic cuisines from around the world, RecipePilot has you covered.

✨ KEY FEATURES

🤖 AI Chef Assistant
Ask for any recipe in natural language. "What can I make with chicken and rice?" or "Give me a quick vegetarian dinner" - your AI chef delivers perfect recipes instantly.

🌍 14 World Cuisines
Explore authentic recipes from African, Asian, European, Latin American, Middle Eastern, Southern, Soul Food, Cajun & Creole, Tex-Mex, BBQ, New England, Midwest, Oceanian, and Caribbean traditions.

📝 Smart Recipe Cards
Every recipe includes detailed ingredients, step-by-step instructions, and pro chef tips. Save your favorites for quick access anytime.

🛒 Shopping List
One tap adds all ingredients to your shopping list. Check items off as you shop - never forget an ingredient again.

⏱️ Cooking Tools
- Multiple simultaneous timers with notifications
- Unit converter (cups ↔ ml, oz ↔ grams, °F ↔ °C)
- Ingredient substitutions
- Nutrition calculator

📅 Meal Planner
Plan your entire week with drag-and-drop simplicity. Automatically generate shopping lists from your meal plan.

🍔 Restaurant Recipes (Premium)
Recreate your favorite dishes from Olive Garden, Chipotle, Cheesecake Factory, Chick-fil-A, and more!

🌙 Beautiful Dark Mode
Easy on the eyes for late-night cooking sessions.

Download RecipePilot today and let AI transform your kitchen experience!
```

### Keywords (100 chars)
```
recipe,cooking,AI,chef,meal planner,ingredients,kitchen,food,cuisine,timer,shopping list,dinner
```

### What's New (Version 1.0.0)
```
🎉 Welcome to RecipePilot!

• AI-powered recipe discovery
• 14 world cuisines to explore
• Smart shopping lists
• Multiple cooking timers
• Weekly meal planner
• Beautiful dark mode

Start cooking smarter today!
```

### URLs
- [ ] **Privacy Policy:** https://[your-domain]/privacy
- [ ] **Support URL:** https://[your-domain]/support
- [ ] **Marketing URL:** https://[your-domain] (optional)

### Age Rating
- [ ] Complete questionnaire
- [ ] Expected rating: 4+

### App Review Information
- [ ] Contact name and email
- [ ] Phone number
- [ ] Demo account credentials (if needed)
- [ ] Notes for reviewer:
```
RecipePilot uses AI (Claude by Anthropic) to generate recipe suggestions.
The AI runs server-side via Supabase Edge Functions - no API keys are
exposed in the app. Users can chat naturally to discover recipes.

To test premium features, use sandbox account or contact us for a
promo code.
```

---

## 4. In-App Purchases (iOS)

### Subscription Products

#### Monthly
- [ ] **Reference Name:** RecipePilot Premium Monthly
- [ ] **Product ID:** recipepilot_premium_monthly
- [ ] **Price:** $4.99/month
- [ ] **Description:** Unlimited AI requests, all restaurant recipes, voice input, ad-free experience
- [ ] **Review Screenshot:** Paywall screen

#### Yearly
- [ ] **Reference Name:** RecipePilot Premium Yearly
- [ ] **Product ID:** recipepilot_premium_yearly
- [ ] **Price:** $29.99/year (Save 50%)
- [ ] **Description:** Best value! All premium features for a full year
- [ ] **Review Screenshot:** Paywall screen

### Subscription Group
- [ ] **Group Name:** RecipePilot Premium
- [ ] **Localized display name and description

### RevenueCat Configuration
- [ ] Products synced from App Store Connect
- [ ] Entitlement "premium" configured
- [ ] Offerings set up
- [ ] Sandbox testing verified

---

## 5. Play Store Setup (Android)

### Store Listing Assets

#### Graphics
- [ ] **App Icon:** 512 x 512 PNG
- [ ] **Feature Graphic:** 1024 x 500 PNG
- [ ] **Screenshots:** Min 2, max 8 per device type

#### Device Screenshots
| Type | Size | Required |
|------|------|----------|
| Phone | Various | Yes (min 2) |
| 7" Tablet | 1024 x 600+ | No |
| 10" Tablet | 1280 x 800+ | No |

### Store Listing
- [ ] **Title:** RecipePilot - AI Recipe Chef (50 chars max)
- [ ] **Short Description:** (80 chars max)
```
Discover recipes with AI. 14 cuisines, meal planning, cooking tools.
```
- [ ] **Full Description:** (4000 chars - same as iOS)

### Categorization
- [ ] **Category:** Food & Drink
- [ ] **Tags:** (5 max) Recipe, Cooking, AI, Meal Planner, Kitchen

### Contact Details
- [ ] Developer email
- [ ] Privacy policy URL
- [ ] Website (optional)

### Content Rating
- [ ] Complete IARC questionnaire
- [ ] Expected: Everyone

### Data Safety
- [ ] **Data collected:** Usage data, app interactions
- [ ] **Data shared:** None
- [ ] **Security practices:** Data encrypted in transit
- [ ] **Data deletion:** Users can request via email

---

## 6. Legal Documents

### Privacy Policy (Required)
Must include:
- [ ] What data is collected
- [ ] How data is used
- [ ] Third-party services (Supabase, Claude, RevenueCat)
- [ ] Data retention policy
- [ ] User rights (deletion, export)
- [ ] Contact information
- [ ] GDPR section (EU users)
- [ ] CCPA section (California users)
- [ ] Children's privacy (COPPA)

**Host at:** https://[your-domain]/privacy

### Terms of Service (Recommended)
- [ ] Acceptable use policy
- [ ] Subscription terms
- [ ] Refund policy
- [ ] Limitation of liability
- [ ] Dispute resolution

**Host at:** https://[your-domain]/terms

---

## 7. Technical Pre-Launch

### Production Build
```bash
cd RecipePilotRN

# iOS Production Build
eas build --platform ios --profile production

# Android Production Build
eas build --platform android --profile production
```

- [ ] iOS build successful
- [ ] Android build successful
- [ ] Both builds tested on real devices

### Backend Verification
- [ ] Supabase Edge Function deployed
- [ ] Claude API key set in Supabase secrets
- [ ] RLS policies configured correctly
- [ ] Database backed up

### Monitoring Setup
- [ ] Error tracking configured (Sentry/Bugsnag)
- [ ] Analytics configured
- [ ] RevenueCat dashboard accessible
- [ ] Supabase logs accessible

---

## 8. Beta Testing

### TestFlight (iOS)
- [ ] Build uploaded to TestFlight
- [ ] Beta testers invited (min 5)
- [ ] Feedback collected
- [ ] Critical issues resolved
- [ ] Beta tested for min 3 days

### Internal Testing (Android)
- [ ] Build uploaded to Play Console
- [ ] Internal testers added
- [ ] Testing completed
- [ ] Move to closed/open testing if desired

---

## 9. Submission

### iOS Submission
- [ ] All screenshots uploaded
- [ ] All metadata complete
- [ ] Build selected
- [ ] Export compliance answered
- [ ] Advertising ID usage declared
- [ ] Submit for review

**Expected review time:** 24-48 hours

### Android Submission
- [ ] All graphics uploaded
- [ ] Store listing complete
- [ ] Content rating applied
- [ ] Data safety complete
- [ ] Build selected
- [ ] Submit for review

**Expected review time:** 3-7 days (first submission)

---

## 10. Post-Launch

### Day 1
- [ ] Monitor crash reports
- [ ] Monitor reviews
- [ ] Respond to user feedback
- [ ] Track download metrics

### Week 1
- [ ] Analyze user behavior
- [ ] Identify top issues
- [ ] Plan first update
- [ ] Marketing push

### Ongoing
- [ ] Regular updates (bug fixes, features)
- [ ] Respond to reviews
- [ ] Monitor server health
- [ ] Track subscription metrics

---

## Final Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
| Product | | | |

**Launch Approved:** ☐ Yes ☐ No

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________
