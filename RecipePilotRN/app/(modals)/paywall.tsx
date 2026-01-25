import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { Colors, Gradients, Shadows } from '@/theme';
import { useToast } from '@/components/Toast';
import { hapticSuccess, hapticError } from '@/lib/haptics';
import { purchaseService } from '@/lib/purchases';
import { GlassView, GradientButton, GlassButton } from '@/components/ui';

interface Feature {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  isPremium: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: 'message-circle',
    title: 'Unlimited AI Requests',
    description: 'Ask Chef AI unlimited questions',
    isPremium: true,
  },
  {
    icon: 'coffee',
    title: 'Restaurant Recipes',
    description: 'Get recipes inspired by your favorite restaurants',
    isPremium: true,
  },
  {
    icon: 'mic',
    title: 'Voice Input',
    description: 'Talk to Chef AI hands-free while cooking',
    isPremium: true,
  },
  {
    icon: 'calendar',
    title: 'Advanced Meal Planning',
    description: 'Plan your meals with nutritional insights',
    isPremium: true,
  },
  {
    icon: 'zap-off',
    title: 'Ad-Free Experience',
    description: 'Enjoy cooking without interruptions',
    isPremium: true,
  },
];

export default function PaywallModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handlePurchase = useCallback(async () => {
    setIsLoading(true);
    try {
      const offerings = await purchaseService.getOfferings();
      const selectedPackage = offerings.find((p) =>
        selectedPlan === 'yearly'
          ? p.identifier.includes('yearly') || p.identifier.includes('annual')
          : p.identifier.includes('monthly')
      );

      if (!selectedPackage) {
        showToast('Package not available', 'error');
        return;
      }

      const result = await purchaseService.purchasePackage(selectedPackage);
      if (result) {
        hapticSuccess();
        showToast('Welcome to Premium!', 'success');
        router.back();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      hapticError();
      showToast('Purchase failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlan, showToast]);

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    try {
      const customerInfo = await purchaseService.restorePurchases();
      const isPremium = !!customerInfo.entitlements.active['premium'];

      if (isPremium) {
        hapticSuccess();
        showToast('Purchases restored!', 'success');
        router.back();
      } else {
        showToast('No purchases to restore', 'info');
      }
    } catch (error) {
      console.error('Restore error:', error);
      hapticError();
      showToast('Restore failed. Please try again.', 'error');
    } finally {
      setIsRestoring(false);
    }
  }, [showToast]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Gradient */}
      <LinearGradient
        colors={Gradients.premium}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Feather name="x" size={24} color="white" />
        </TouchableOpacity>

        <Animated.View entering={FadeInUp.duration(400)} style={styles.headerContent}>
          <View style={styles.premiumIcon}>
            <Text style={styles.premiumEmoji}>⭐</Text>
          </View>
          <Text style={styles.headerTitle}>RecipePilot Premium</Text>
          <Text style={styles.headerSubtitle}>
            Unlock the full cooking experience
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Features */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Premium Features
          </Text>
          {FEATURES.map((feature, index) => (
            <GlassView
              key={index}
              intensity="strong"
              style={styles.featureCard}
              animated
              animationType="slideUp"
              animationDelay={150 + index * 50}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                <Feather name={feature.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.muted }]}>
                  {feature.description}
                </Text>
              </View>
              <View style={[styles.premiumBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            </GlassView>
          ))}
        </Animated.View>

        {/* Pricing */}
        <Animated.View entering={FadeInDown.delay(400).duration(300)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Choose Your Plan
          </Text>

          <View style={styles.plans}>
            {/* Yearly Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'yearly' && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
                { backgroundColor: colors.glassBackgroundStrong },
              ]}
              onPress={() => setSelectedPlan('yearly')}
            >
              {selectedPlan === 'yearly' && (
                <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.popularText}>Best Value</Text>
                </View>
              )}
              <Text style={[styles.planName, { color: colors.foreground }]}>Yearly</Text>
              <Text style={[styles.planPrice, { color: colors.primary }]}>$29.99</Text>
              <Text style={[styles.planPeriod, { color: colors.muted }]}>/year</Text>
              <Text style={[styles.planSaving, { color: colors.success }]}>
                Save 50%
              </Text>
            </TouchableOpacity>

            {/* Monthly Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
                { backgroundColor: colors.glassBackgroundStrong },
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <Text style={[styles.planName, { color: colors.foreground }]}>Monthly</Text>
              <Text style={[styles.planPrice, { color: colors.primary }]}>$4.99</Text>
              <Text style={[styles.planPeriod, { color: colors.muted }]}>/month</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* CTA Buttons */}
        <Animated.View entering={FadeInDown.delay(500).duration(300)} style={styles.ctaContainer}>
          <GradientButton
            title={isLoading ? 'Processing...' : 'Start Free Trial'}
            onPress={handlePurchase}
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            variant="premium"
            size="lg"
          />
          <Text style={[styles.trialText, { color: colors.muted }]}>
            7-day free trial, then {selectedPlan === 'yearly' ? '$29.99/year' : '$4.99/month'}
          </Text>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={[styles.restoreText, { color: colors.primary }]}>
                Restore Purchases
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Terms */}
        <Text style={[styles.termsText, { color: colors.muted }]}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Subscriptions automatically renew unless cancelled.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 40,
  },
  premiumIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  premiumEmoji: {
    fontSize: 36,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 14,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
  },
  premiumBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  premiumBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  plans: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  popularText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  planPeriod: {
    fontSize: 14,
    marginTop: 2,
  },
  planSaving: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  ctaContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  trialText: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  restoreButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  restoreText: {
    fontSize: 15,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});
