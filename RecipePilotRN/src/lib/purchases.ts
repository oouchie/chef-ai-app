import { Platform } from 'react-native';

// Lazy import to prevent crash if native module fails to load
let Purchases: any = null;
let LOG_LEVEL: any = null;

// Try to import react-native-purchases
try {
  const purchasesModule = require('react-native-purchases');
  Purchases = purchasesModule.default;
  LOG_LEVEL = purchasesModule.LOG_LEVEL;
} catch (e) {
  console.warn('react-native-purchases not available:', e);
}

// Types (inline to avoid import issues)
type CustomerInfo = any;
type PurchasesPackage = any;

// Product IDs
const PRODUCT_IDS = {
  monthly: 'recipepilot_premium_monthly',
  yearly: 'recipepilot_premium_yearly',
};

// Entitlement ID
const ENTITLEMENT_ID = 'premium';

// RevenueCat API Keys
const REVENUECAT_API_KEY_IOS = 'appl_OQnKoMJWXJCotYpzyhQoBCpVZlU';
const REVENUECAT_API_KEY_ANDROID = 'goog_xxx'; // TODO: Add Android key when ready

class PurchaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (!Purchases) {
      console.warn('RevenueCat not available - purchases disabled');
      return;
    }

    try {
      Purchases.setLogLevel(LOG_LEVEL?.DEBUG || 4);

      const apiKey = Platform.OS === 'ios'
        ? REVENUECAT_API_KEY_IOS
        : REVENUECAT_API_KEY_ANDROID;

      // Don't initialize with placeholder keys
      if (apiKey.includes('_xxx')) {
        console.warn('RevenueCat API key not configured for this platform - purchases disabled');
        return;
      }

      await Purchases.configure({ apiKey });
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize RevenueCat:', error);
      // Don't throw - allow app to continue without purchases
    }
  }

  async getOfferings(): Promise<PurchasesPackage[]> {
    if (!Purchases || !this.initialized) return [];
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (error) {
      console.warn('Failed to get offerings:', error);
      return [];
    }
  }

  async purchasePackage(pack: PurchasesPackage): Promise<CustomerInfo | null> {
    if (!Purchases || !this.initialized) return null;
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        return null;
      }
      console.warn('Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo | null> {
    if (!Purchases || !this.initialized) return null;
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.warn('Failed to restore purchases:', error);
      return null;
    }
  }

  async getSubscriptionStatus(): Promise<{
    isPremium: boolean;
    expirationDate: string | null;
    willRenew: boolean;
  }> {
    if (!Purchases || !this.initialized) {
      return { isPremium: false, expirationDate: null, willRenew: false };
    }
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

      return {
        isPremium: !!entitlement,
        expirationDate: entitlement?.expirationDate || null,
        willRenew: entitlement?.willRenew || false,
      };
    } catch (error) {
      console.warn('Failed to get subscription status:', error);
      return {
        isPremium: false,
        expirationDate: null,
        willRenew: false,
      };
    }
  }

  async loginUser(userId: string): Promise<void> {
    if (!Purchases || !this.initialized) return;
    try {
      await Purchases.logIn(userId);
    } catch (error) {
      console.warn('Failed to log in user:', error);
    }
  }

  async logoutUser(): Promise<void> {
    if (!Purchases || !this.initialized) return;
    try {
      await Purchases.logOut();
    } catch (error) {
      console.warn('Failed to log out user:', error);
    }
  }

  addCustomerInfoUpdateListener(callback: (info: CustomerInfo) => void): void {
    if (!Purchases) return;
    Purchases.addCustomerInfoUpdateListener(callback);
  }

  removeCustomerInfoUpdateListener(callback: (info: CustomerInfo) => void): void {
    if (!Purchases) return;
    Purchases.removeCustomerInfoUpdateListener(callback);
  }
}

export const purchaseService = new PurchaseService();
export { PRODUCT_IDS, ENTITLEMENT_ID };
