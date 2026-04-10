---
active: true
iteration: 1
max_iterations: 30
completion_promise: "COMPLETE"
started_at: "2026-01-22T03:21:06Z"
---

Implement: RecipePilot iOS — UI Polish + Subscription Gating Verification Pass

ROLE:
You are a senior iOS engineer. This is a UI polish + subscription gating verification pass.

NON-NEGOTIABLE RULES:
- Do NOT change any AI/networking logic, data models, database schema, or core app flows.
- Do NOT refactor unrelated code.
- Only modify UI layout/styling + paywall/gating checks + configuration constants if needed.
- Keep diffs minimal and safe.

Context:
You are working inside an existing RecipePilot iOS app codebase (SwiftUI).
Focus only on UI/layout polish + premium gating verification. Make minimal changes.

PROJECT GOAL:
Finish and polish the RecipePilot iOS app. Everything works; we are improving presentation and verifying premium locks/pricing.

PRIMARY UI TASKS (Home Screen):
1) HEADER LOGO READABILITY
- Make the header logo large enough that “RecipePilot” is readable on all devices (iPhone SE/mini up to Pro Max).
- If logo is currently in the navigation bar and too constrained, implement a custom SwiftUI header view (BrandHeaderView) at the top of the screen with a fixed height (e.g., 64–80pt) so we control sizing.
- Keep existing left hamburger icon and right-side icons (wrench/edit) working exactly as-is; just align them visually with the larger logo.
- Ensure it scales responsively (use GeometryReader or .minimumScaleFactor only if needed).

2) REMOVE MID-PAGE LOGO ABOVE “WELCOME”
- Remove the logo tile/image above “Welcome to RecipePilot!” on the home screen (the one shown in the screenshot).
- Replace that space with a cleaner hero layout (title/subtitle) and better spacing so the screen doesn’t look empty.

3) HOME SCREEN MAKEOVER (“POP”) WITHOUT BREAKING ANYTHING
- Keep all existing sections and behaviors: cuisine chips, quick actions (Meal Plan, Restaurants), prompt cards, input bar, tab bar.
- Improve visual hierarchy:
  - Title: “Welcome to RecipePilot!” large + bold.
  - Subtitle: smaller, lighter, 2–3 lines max.
  - Section labels: subtle but clear.
- Apply a premium dark UI style:
  - Background: deep navy/near-black with a subtle radial blue glow.
  - Cards: “glass” style (slightly translucent) with soft border + shadow, 16–20 corner radius.
  - Chips: selected chip has a stronger blue fill/gradient; unselected chips are darker + subtle border.
  - Improve spacing/padding consistency (16–20).
- Do NOT alter any actions or logic; only presentation.

RESTAURANT MENU SCREEN BUG:
4) BOTTOM BLUE BOX/BAR NOT REACHABLE
- On the Restaurant menu screen, the blue element at the bottom is clipped/hidden behind the tab bar or safe area, so it can’t be reached.
- Fix layout so it is ALWAYS visible/reachable:
  - Prefer using .safeAreaInset(edge: .bottom) for bottom actions OR add bottom padding equal to tab bar height + safe area inset for scroll content.
  - Ensure no .ignoresSafeArea causes content to slide under the tab bar.
  - Verify on multiple device sizes in Preview/Simulator.
- After fix, user can scroll to it and tap it reliably.

PREMIUM / SUBSCRIPTION VERIFICATION TASKS:
We need to double-check premium locks are correct and pricing is correct.

5) SUBSCRIPTION PRICE MUST SHOW .99 / month
- Find the source of truth for the monthly price display (PaywallView, SubscriptionView, Constants, StoreKit product formatting).
- Ensure UI displays “.99 / month” (or localized price that matches the StoreKit product) AND that anywhere a hardcoded price exists is updated to 4.99.
- If using StoreKit Product.displayPrice, ensure it renders the actual price; if it’s hardcoded, replace with a single constant used everywhere to avoid mismatch.
- Do not break StoreKit purchase flow.

6) FEATURE GATING REQUIREMENTS
- Restaurants feature:
  - Allow exactly ONE free sample TOTAL (lifetime) — NOT one per day.
  - After the one free sample is used, lock the Restaurants premium functionality and show the paywall/upgrade UI.
  - Ensure the “one free sample” counter persists across app launches (UserDefaults or existing persistence layer), but do not change database models.
- Meal Prep / Meal Plan feature:
  - Must be premium-locked (no free access).
  - Attempting to use should show paywall/upgrade prompt.

7) CONFIRM PREMIUM LOCK VISUALS
- Ensure locked sections show consistent UI (lock icon, “Premium” badge, disabled state).
- Ensure unlocked/premium users do not see locks.

README UPDATE:
8) Update README.md once done:
- Include:
  - App summary
  - Premium features list
  - Free usage rules (Restaurants: 1 lifetime free sample; Meal Plan premium)
  - Subscription price: .99/month
  - How to run the app, install dependencies, and any StoreKit testing notes (StoreKit config file if present)
- Keep it concise but complete.

PROCESS REQUIREMENTS:
- First: locate relevant SwiftUI files:
  - Home screen view (HomeView / ChatHomeView / MainHomeView)
  - Restaurants view (RestaurantsView / RestaurantListView)
  - Paywall/Subscription views (PaywallView / PremiumView)
  - Premium state manager (EntitlementManager / SubscriptionManager / PurchaseManager)
- Make minimal changes.
- Add small reusable UI components/modifiers if helpful:
  - BrandHeaderView
  - GlassCardModifier
  - ChipStyle
- Add a small “Gating” helper only if it already exists; avoid new architecture.

Deliverables:
- List ALL files changed with short descriptions.
- For premium gating, point to the exact code paths enforcing:
  - Restaurants: 1 lifetime sample then locked
  - Meal Plan: premium locked
- Confirm the price display shows .99/month in the paywall and anywhere else it appears.
- Confirm the restaurant bottom blue bar is reachable.
- Confirm home header logo readable and mid-page logo removed.
- Confirm README updated.

Success criteria:
- All requirements implemented with minimal safe diffs
- No new runtime issues introduced
- No build errors
- README updated and accurate

Output <promise>COMPLETE</promise> when done.
