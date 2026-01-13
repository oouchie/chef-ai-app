// RevenueCat integration for in-app purchases
// Note: Install RevenueCat SDK: npm install react-native-purchases

// For web/testing, we'll use a mock. Real implementation needs RevenueCat SDK.

export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  expiresAt?: string;
  error?: string;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  expiresAt?: string;
  willRenew: boolean;
}

// RevenueCat API key (public key is safe to expose)
const REVENUECAT_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || '';

// Product IDs (set these up in App Store Connect & RevenueCat)
export const PRODUCTS = {
  PREMIUM_MONTHLY: 'recipepilot_premium_monthly',
} as const;

class PurchaseService {
  private isInitialized = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private Purchases: any = null;

  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    // Only initialize on native platforms with Capacitor
    if (typeof window !== 'undefined' && 'Capacitor' in window) {
      try {
        // Dynamic import for native environment only
        const purchasesModule = await import('@revenuecat/purchases-capacitor');
        this.Purchases = purchasesModule.Purchases;

        await this.Purchases.configure({
          apiKey: REVENUECAT_API_KEY,
          appUserID: userId,
        });

        this.isInitialized = true;
        console.log('RevenueCat initialized');
      } catch (error) {
        console.log('RevenueCat not available (web environment)', error);
      }
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (!this.Purchases) {
      // Web fallback - check local storage or return free tier
      const stored = localStorage.getItem('recipepilot_premium');
      if (stored) {
        const data = JSON.parse(stored);
        return {
          isPremium: data.isPremium && new Date(data.expiresAt) > new Date(),
          expiresAt: data.expiresAt,
          willRenew: false,
        };
      }
      return { isPremium: false, willRenew: false };
    }

    try {
      const customerInfo = await this.Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active['premium'];

      return {
        isPremium: !!entitlement,
        expiresAt: entitlement?.expirationDate || undefined,
        willRenew: entitlement?.willRenew || false,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { isPremium: false, willRenew: false };
    }
  }

  async purchasePremium(): Promise<PurchaseResult> {
    if (!this.Purchases) {
      // Web fallback - open App Store or show message
      alert('Please download the mobile app to subscribe!');
      return { success: false, isPremium: false, error: 'Not available on web' };
    }

    try {
      const offerings = await this.Purchases.getOfferings();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const monthlyPackage = offerings.current?.availablePackages.find(
        (p: any) => p.product.identifier === PRODUCTS.PREMIUM_MONTHLY
      );

      if (!monthlyPackage) {
        throw new Error('Premium package not found');
      }

      const { customerInfo } = await this.Purchases.purchasePackage(monthlyPackage);
      const entitlement = customerInfo.entitlements.active['premium'];

      return {
        success: true,
        isPremium: !!entitlement,
        expiresAt: entitlement?.expirationDate,
      };
    } catch (error: unknown) {
      const err = error as { userCancelled?: boolean; message?: string };
      if (err.userCancelled) {
        return { success: false, isPremium: false, error: 'cancelled' };
      }
      console.error('Purchase error:', error);
      return { success: false, isPremium: false, error: err.message || 'Purchase failed' };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    if (!this.Purchases) {
      return { success: false, isPremium: false, error: 'Not available on web' };
    }

    try {
      const customerInfo = await this.Purchases.restorePurchases();
      const entitlement = customerInfo.entitlements.active['premium'];

      return {
        success: true,
        isPremium: !!entitlement,
        expiresAt: entitlement?.expirationDate,
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Restore error:', error);
      return { success: false, isPremium: false, error: err.message || 'Restore failed' };
    }
  }
}

export const purchaseService = new PurchaseService();
