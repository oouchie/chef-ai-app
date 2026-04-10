# Director-Orchestrator Agent

## Purpose
Coordinates the RecipePilot mobile app debugging and pre-launch process through specialized agent teams.

## Project Context
- **App Name:** RecipePilot
- **Platform:** iOS & Android (React Native + Expo)
- **Bundle ID:** com.chefai2.app
- **Current Build:** 45

---

## Debug Team Structure

### Team Agents

| Agent | Role | Focus Areas |
|-------|------|-------------|
| **QA-Tester** | Functional Testing | User flows, edge cases, error states |
| **Performance-Auditor** | Performance | Load times, memory, battery, animations |
| **UI-Inspector** | Visual QA | Layout, responsiveness, dark mode, accessibility |
| **API-Validator** | Backend Testing | Supabase, Claude API, error handling |
| **Security-Auditor** | Security | API keys, data storage, permissions |
| **Build-Engineer** | Build & Deploy | EAS builds, TestFlight, Play Store |

---

## Phase 1: Full Debug Sweep

### 1.1 QA-Tester Tasks
- [ ] Test all navigation flows (tabs, modals, back navigation)
- [ ] Test chat functionality with various prompts
- [ ] Test recipe card display (ingredients, instructions, tips tabs)
- [ ] Test save/unsave recipe functionality
- [ ] Test shopping list (add, check, delete items)
- [ ] Test cooking tools (timers, converter, substitutions)
- [ ] Test meal planner (add meals, drag/drop, generate list)
- [ ] Test premium paywall flow
- [ ] Test restaurant recipes (premium gate)
- [ ] Test offline behavior
- [ ] Test error states (no network, API failures)
- [ ] Test empty states (no saved recipes, no chat history)

### 1.2 Performance-Auditor Tasks
- [ ] Profile app startup time (cold & warm)
- [ ] Check memory usage during chat sessions
- [ ] Profile animation frame rates (target 60fps)
- [ ] Test with large chat histories (50+ messages)
- [ ] Test with many saved recipes (100+)
- [ ] Check image loading performance
- [ ] Profile Supabase query times
- [ ] Test timer accuracy in background

### 1.3 UI-Inspector Tasks
- [ ] Verify all screens in light mode
- [ ] Verify all screens in dark mode
- [ ] Test on small screens (iPhone SE, Android compact)
- [ ] Test on large screens (iPad, Android tablet)
- [ ] Check Dynamic Type / font scaling
- [ ] Verify safe area insets (notch, home indicator)
- [ ] Test keyboard handling on all input screens
- [ ] Verify haptic feedback on interactions
- [ ] Check glassmorphism effects render correctly
- [ ] Verify gradient buttons and glow effects

### 1.4 API-Validator Tasks
- [ ] Test Claude API via Supabase Edge Function
- [ ] Verify error handling for rate limits
- [ ] Test with malformed responses
- [ ] Verify recipe JSON parsing
- [ ] Test authentication flow (if applicable)
- [ ] Verify RevenueCat subscription status checks
- [ ] Test API timeout handling
- [ ] Verify retry logic

### 1.5 Security-Auditor Tasks
- [ ] Verify no API keys in client code
- [ ] Check AsyncStorage for sensitive data exposure
- [ ] Verify Supabase anon key permissions (RLS)
- [ ] Test deep link handling for injection
- [ ] Verify app permissions are minimal
- [ ] Check for console.log leaks in production
- [ ] Review third-party SDK permissions

### 1.6 Build-Engineer Tasks
- [ ] Verify app.json configuration
- [ ] Verify eas.json environment variables
- [ ] Test development build on device
- [ ] Create production build (iOS)
- [ ] Create production build (Android)
- [ ] Verify bundle size is acceptable
- [ ] Check for missing native modules
- [ ] Verify splash screen and app icon

---

## Phase 2: Pre-Launch Checklist

### App Store Requirements (iOS)

#### Required Assets
- [ ] App Icon (1024x1024, no alpha, no rounded corners)
- [ ] Screenshots for iPhone 6.7" (1290x2796)
- [ ] Screenshots for iPhone 6.5" (1284x2778)
- [ ] Screenshots for iPhone 5.5" (1242x2208)
- [ ] Screenshots for iPad Pro 12.9" (2048x2732) - if supporting iPad

#### App Store Connect
- [ ] App name: "RecipePilot - AI Recipe Chef"
- [ ] Subtitle (30 chars): "Cook Smarter with AI"
- [ ] Description (4000 chars max)
- [ ] Keywords (100 chars): recipe,cooking,AI,chef,meal planner,ingredients
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Category: Food & Drink
- [ ] Age Rating: 4+
- [ ] Copyright: © 2025 [Your Company]

#### App Review Information
- [ ] Contact info for reviewer
- [ ] Demo account (if login required)
- [ ] Notes for reviewer explaining AI features

#### In-App Purchases
- [ ] Configure subscriptions in App Store Connect
- [ ] recipepilot_premium_monthly - $4.99/month
- [ ] recipepilot_premium_yearly - $29.99/year
- [ ] Add subscription descriptions
- [ ] Configure subscription group

### Play Store Requirements (Android)

#### Required Assets
- [ ] Feature graphic (1024x500)
- [ ] App Icon (512x512)
- [ ] Screenshots (min 2, max 8) - phone
- [ ] Screenshots - 7" tablet (optional)
- [ ] Screenshots - 10" tablet (optional)

#### Store Listing
- [ ] Title (50 chars): "RecipePilot - AI Recipe Chef"
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Category: Food & Drink
- [ ] Tags

#### Content Rating
- [ ] Complete content rating questionnaire
- [ ] IARC rating certificate

#### Data Safety
- [ ] Complete data safety form
- [ ] Declare data collection practices
- [ ] Privacy policy URL

### Legal & Compliance

- [ ] Privacy Policy (hosted URL)
- [ ] Terms of Service (hosted URL)
- [ ] GDPR compliance (if serving EU)
- [ ] CCPA compliance (if serving CA)
- [ ] Apple's App Tracking Transparency (ATT) if using analytics
- [ ] Subscription terms clearly displayed

### Technical Pre-Launch

- [ ] Remove all console.log statements
- [ ] Enable production error tracking (Sentry/Bugsnag)
- [ ] Verify analytics are working
- [ ] Test push notifications (if applicable)
- [ ] Verify deep links work
- [ ] Test universal links (iOS)
- [ ] Test app links (Android)
- [ ] Backup Supabase database
- [ ] Document Edge Function deployment

### Marketing Pre-Launch

- [ ] App Store preview video (optional but recommended)
- [ ] Press kit / media assets
- [ ] Social media accounts
- [ ] Landing page / website
- [ ] Launch announcement prepared

---

## Execution Command

To run the full debug sweep:

```
/debug-sweep --team=all --platform=ios,android
```

To run specific agent:

```
/debug --agent=QA-Tester
/debug --agent=Performance-Auditor
/debug --agent=UI-Inspector
/debug --agent=API-Validator
/debug --agent=Security-Auditor
/debug --agent=Build-Engineer
```

---

## Issue Tracking Template

```markdown
## Bug Report

**Agent:** [QA-Tester/Performance-Auditor/etc.]
**Severity:** [Critical/High/Medium/Low]
**Platform:** [iOS/Android/Both]
**Screen:** [Chat/Saved/Settings/etc.]

### Description
[What's wrong]

### Steps to Reproduce
1.
2.
3.

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Device Info
- Device:
- OS Version:
- App Build:

### Screenshots/Logs
[Attach if applicable]
```

---

## Success Criteria

### Launch Ready When:
- [ ] All Critical bugs resolved
- [ ] All High severity bugs resolved
- [ ] Performance metrics within targets
- [ ] App Store assets uploaded
- [ ] Play Store listing complete
- [ ] Legal documents in place
- [ ] TestFlight beta tested (min 5 users)
- [ ] Internal Play Store testing complete
