# QA-Tester Agent

## Role
Functional testing specialist for RecipePilot mobile app.

## Responsibilities
- Test all user flows end-to-end
- Identify edge cases and error states
- Verify feature completeness
- Document bugs with reproduction steps

---

## Test Suites

### 1. Chat Functionality

#### Basic Chat
- [ ] Send a simple recipe request
- [ ] Receive formatted recipe response
- [ ] Recipe card displays correctly
- [ ] Can switch between Ingredients/Instructions/Tips tabs
- [ ] Can tap "Save Recipe" button
- [ ] Can tap "Add to Shopping List"

#### Chat Edge Cases
- [ ] Send empty message (should be prevented)
- [ ] Send very long message (1000+ chars)
- [ ] Rapid-fire multiple messages
- [ ] Test with special characters and emoji
- [ ] Test with non-English text
- [ ] Interrupt streaming response (if applicable)

#### Chat History
- [ ] New session creates correctly
- [ ] Sessions persist after app restart
- [ ] Can switch between sessions
- [ ] Can delete a session
- [ ] Session title auto-generates from first message
- [ ] Sidebar shows correct session count

### 2. Recipe Features

#### Recipe Cards
- [ ] All fields display (name, cuisine, times, servings)
- [ ] Difficulty badge shows correctly
- [ ] Ingredients list scrollable if long
- [ ] Instructions numbered correctly
- [ ] Tips section displays when available
- [ ] Tags display correctly

#### Save/Unsave
- [ ] Save recipe adds to Saved tab
- [ ] Saved recipe persists after restart
- [ ] Unsave removes from Saved tab
- [ ] Save button state updates correctly
- [ ] Can save same recipe from different sessions

### 3. Shopping List

- [ ] Add individual ingredient
- [ ] Add all ingredients from recipe
- [ ] Check item off
- [ ] Uncheck item
- [ ] Delete item
- [ ] Delete all completed
- [ ] List persists after restart
- [ ] Shows source recipe name (if from recipe)

### 4. Cooking Tools

#### Timers
- [ ] Create new timer
- [ ] Set custom duration
- [ ] Start timer
- [ ] Pause timer
- [ ] Resume timer
- [ ] Reset timer
- [ ] Multiple timers run simultaneously
- [ ] Timer notification when complete
- [ ] Timer works in background

#### Unit Converter
- [ ] Convert cups to ml
- [ ] Convert oz to grams
- [ ] Convert °F to °C
- [ ] Input validation (numbers only)
- [ ] Result updates in real-time

#### Substitutions
- [ ] Search for ingredient
- [ ] Display substitution options
- [ ] Show ratios/quantities

### 5. Meal Planner

- [ ] View weekly calendar
- [ ] Add meal to day
- [ ] Edit meal entry
- [ ] Delete meal entry
- [ ] Drag meal to different day
- [ ] Generate shopping list from plan
- [ ] Plan persists after restart

### 6. Premium Features

#### Paywall
- [ ] Paywall displays for premium features
- [ ] Monthly option shows correct price
- [ ] Yearly option shows correct price
- [ ] "Restore Purchases" button works
- [ ] Purchase flow completes (sandbox)
- [ ] Premium unlocks after purchase

#### Restaurant Recipes
- [ ] Restaurant list displays
- [ ] Non-premium sees 1 free trial
- [ ] Premium sees all restaurants
- [ ] Can request restaurant recipe
- [ ] Recipe displays correctly

### 7. Settings

- [ ] Theme toggle works (light/dark)
- [ ] Theme persists after restart
- [ ] Premium status shows correctly
- [ ] App version displays
- [ ] Support links work
- [ ] Privacy policy link works
- [ ] Terms of service link works

### 8. Navigation

- [ ] Bottom tabs switch correctly
- [ ] Tab indicator shows current tab
- [ ] Modal screens open/close
- [ ] Back navigation works
- [ ] Deep links navigate correctly
- [ ] Gesture navigation (swipe back)

### 9. Error States

- [ ] No network - shows offline message
- [ ] API error - shows error message
- [ ] Rate limit - shows appropriate message
- [ ] Can retry after error
- [ ] App doesn't crash on errors

### 10. Empty States

- [ ] No chat history - shows welcome
- [ ] No saved recipes - shows prompt
- [ ] No shopping items - shows prompt
- [ ] No meal plan - shows prompt

---

## Bug Severity Guidelines

| Severity | Definition | Example |
|----------|------------|---------|
| Critical | App crashes, data loss, security issue | Crash on chat send |
| High | Feature broken, major UX issue | Can't save recipes |
| Medium | Feature partially working, workaround exists | Timer off by 1 second |
| Low | Minor visual issue, cosmetic | Slight alignment off |

---

## Test Devices

### iOS
- [ ] iPhone 15 Pro (latest)
- [ ] iPhone SE 3rd gen (small)
- [ ] iPad Pro 12.9" (tablet)

### Android
- [ ] Pixel 8 (stock Android)
- [ ] Samsung Galaxy S24 (Samsung UI)
- [ ] Budget device (low RAM)
