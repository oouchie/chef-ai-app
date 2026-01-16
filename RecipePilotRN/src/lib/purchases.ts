import Purchases, {
  CustomerInfo,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// Product IDs
const PRODUCT_IDS = {
  monthly: 'recipepilot_premium_monthly',
  yearly: 'recipepilot_premium_yearly',
};

// Entitlement ID
const ENTITLEMENT_ID = 'premium';

// RevenueCat API Keys (replace with actual keys)
const REVENUECAT_API_KEY_IOS = 'appl_xxx';
const REVENUECAT_API_KEY_ANDROID = 'goog_xxx';

class PurchaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      const apiKey = Platform.OS === 'ios'
        ? REVENUECAT_API_KEY_IOS
        : REVENUECAT_API_KEY_ANDROID;

      await Purchases.configure({ apiKey });
      this.initialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return [];
    }
  }

  async purchasePackage(pack: PurchasesPackage): Promise<CustomerInfo | null> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled purchase');
        return null;
      }
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(): Promise<{
    isPremium: boolean;
    expirationDate: string | null;
    willRenew: boolean;
  }> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

      return {
        isPremium: !!entitlement,
        expirationDate: entitlement?.expirationDate || null,
        willRenew: entitlement?.willRenew || false,
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return {
        isPremium: false,
        expirationDate: null,
        willRenew: false,
      };
    }
  }

  async loginUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
    } catch (error) {
      console.error('Failed to log in user:', error);
    }
  }

  async logoutUser(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('Failed to log out user:', error);
    }
  }

  // Add listener for customer info updates
  addCustomerInfoUpdateListener(callback: (info: CustomerInfo) => void): void {
    Purchases.addCustomerInfoUpdateListener(callback);
  }

  removeCustomerInfoUpdateListener(callback: (info: CustomerInfo) => void): void {
    Purchases.removeCustomerInfoUpdateListener(callback);
  }
}

export const purchaseService = new PurchaseService();
export { PRODUCT_IDS, ENTITLEMENT_ID };
