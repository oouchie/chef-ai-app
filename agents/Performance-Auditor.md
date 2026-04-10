# Performance-Auditor Agent

## Role
Performance testing and optimization specialist for RecipePilot.

## Responsibilities
- Profile app performance metrics
- Identify bottlenecks and memory leaks
- Ensure smooth 60fps animations
- Optimize load times and battery usage

---

## Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Cold Start | < 2s | > 4s |
| Warm Start | < 500ms | > 1.5s |
| Chat Response | < 3s | > 8s |
| Screen Transition | < 300ms | > 500ms |
| Animation FPS | 60fps | < 45fps |
| Memory Usage | < 150MB | > 300MB |
| Bundle Size (iOS) | < 50MB | > 100MB |
| Bundle Size (Android) | < 40MB | > 80MB |

---

## Test Procedures

### 1. Startup Performance

```bash
# iOS - Measure with Xcode Instruments
# Profile > Time Profiler

# Android - Measure with Android Studio Profiler
# Run > Profile
```

#### Checks
- [ ] Cold start time (first launch)
- [ ] Warm start time (from background)
- [ ] Time to interactive (first tap response)
- [ ] Splash screen duration appropriate

### 2. Memory Profiling

#### Test Scenarios
- [ ] Baseline memory on launch
- [ ] Memory after 10 chat messages
- [ ] Memory after 50 chat messages
- [ ] Memory after viewing 20 recipes
- [ ] Memory after app in background 5 min
- [ ] Memory after navigating all screens

#### Red Flags
- Memory continuously increasing (leak)
- Memory spikes over 300MB
- Memory not released after navigation

### 3. Animation Performance

#### Screens to Profile
- [ ] Chat message animations (FadeIn)
- [ ] Recipe card tab switching
- [ ] Modal open/close transitions
- [ ] Bottom tab switching
- [ ] Sidebar slide animation
- [ ] List scroll performance
- [ ] Pull-to-refresh animation
- [ ] Button press animations (scale)
- [ ] Gradient/glow effects

#### Tools
```bash
# React Native Performance Monitor
# Shake device > Performance Monitor

# Flipper (if configured)
# React DevTools > Profiler
```

### 4. Network Performance

- [ ] API call latency (Claude via Supabase)
- [ ] Response parsing time
- [ ] Image load times
- [ ] Caching effectiveness
- [ ] Retry behavior on failure
- [ ] Timeout handling

### 5. Storage Performance

- [ ] AsyncStorage read/write times
- [ ] Large data handling (100+ recipes)
- [ ] Data persistence reliability
- [ ] Storage cleanup on uninstall

### 6. Battery Impact

#### Test Protocol
1. Charge to 100%
2. Use app actively for 30 min
3. Record battery drain percentage

#### Acceptable: < 5% per 30 min active use

### 7. Background Performance

- [ ] Timer accuracy in background
- [ ] Notification delivery timing
- [ ] Memory in background state
- [ ] Resume from background speed

---

## Optimization Checklist

### JavaScript/React Native
- [ ] Use `React.memo` for expensive components
- [ ] Use `useCallback` for event handlers
- [ ] Use `useMemo` for computed values
- [ ] Avoid inline object/array creation in render
- [ ] Use FlatList instead of ScrollView for lists
- [ ] Implement proper list key extraction
- [ ] Lazy load heavy components

### Images
- [ ] Use appropriate image sizes
- [ ] Enable image caching
- [ ] Use WebP format where possible
- [ ] Implement progressive loading

### Animations
- [ ] Use `useNativeDriver: true` where possible
- [ ] Use `react-native-reanimated` for complex animations
- [ ] Avoid JS-driven animations during user interaction
- [ ] Reduce shadow/blur complexity on low-end devices

### Network
- [ ] Implement request caching
- [ ] Batch API requests where possible
- [ ] Compress request/response payloads
- [ ] Handle offline gracefully

---

## Profiling Commands

```bash
# Start Metro with performance logging
npx expo start --no-dev --minify

# Generate Hermes bundle (production-like)
npx expo export --platform ios

# Check bundle size
npx react-native-bundle-visualizer

# Profile with Flipper
# Open Flipper > React DevTools > Profiler
```

---

## Issue Template

```markdown
## Performance Issue

**Metric:** [Startup/Memory/FPS/Network]
**Measured Value:** [X ms / X MB / X fps]
**Target Value:** [X ms / X MB / X fps]
**Device:** [Device name, OS version]

### Reproduction
1.
2.

### Profiler Screenshots
[Attach flame graphs, memory charts]

### Suggested Fix
[If known]
```
