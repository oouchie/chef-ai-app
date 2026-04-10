import { Platform } from 'react-native';

// Lazy import to prevent crash if native module fails to load
let Purchases: any = null;
let LOG_LEVEL: any = null;
let moduleLoadError: string | null = null;

// Try to import react-native-purchases
try {
  console.log('[RevenueCat] Attempting to load native module...');
  const purchasesModule = require('react-native-purchases');
  Purchases = purchasesModule.default || purchasesModule.Purchases || purchasesModule;
  LOG_LEVEL = purchasesModule.LOG_LEVEL;
  console.log('[RevenueCat] Native module loaded:', !!Purchases);
  console.log('[RevenueCat] Module keys:', Object.keys(purchasesModule || {}).join(', '));
} catch (e: any) {
  moduleLoadError = e?.message || String(e);
  console.error('[RevenueCat] Failed to load native module:', moduleLoadError);
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
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    // Return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.initialized) return;

    if (!Purchases) {
      console.warn('[RevenueCat] Native module not available - purchases disabled');
      return;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      console.log('[RevenueCat] Starting initialization...');
      console.log('[RevenueCat] Platform:', Platform.OS);

      Purchases.setLogLevel(LOG_LEVEL?.DEBUG || 4);

      const apiKey = Platform.OS === 'ios'
        ? REVENUECAT_API_KEY_IOS
        : REVENUECAT_API_KEY_ANDROID;

      console.log('[RevenueCat] API Key prefix:', apiKey.substring(0, 10) + '...');

      // Don't initialize with placeholder keys
      if (apiKey.includes('_xxx')) {
        console.warn('[RevenueCat] API key not configured for this platform - purchases disabled');
        return;
      }

      await Purchases.configure({ apiKey });
      this.initialized = true;
      console.log('[RevenueCat] Initialization successful!');

      // Log app user ID for debugging
      try {
        const appUserID = await Purchases.getAppUserID();
        console.log('[RevenueCat] App User ID:', appUserID);
      } catch (e) {
        console.log('[RevenueCat] Could not get App User ID');
      }
    } catch (error: any) {
      console.error('[RevenueCat] Initialization failed:', error?.message || error);
      // Don't throw - allow app to continue without purchases
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getModuleStatus(): { loaded: boolean; error: string | null; initialized: boolean } {
    return {
      loaded: !!Purchases,
      error: moduleLoadError,
      initialized: this.initialized,
    };
  }

  async getOfferings(retryCount = 0): Promise<PurchasesPackage[]> {
    const MAX_RETRIES = 2;

    if (!Purchases) {
      console.warn('[RevenueCat] Native module not loaded');
      return [];
    }

    // Ensure initialization is complete
    if (!this.initialized) {
      console.log('[RevenueCat] Waiting for initialization before getOfferings...');
      await this.initialize();

      // If still not initialized after waiting, return empty
      if (!this.initialized) {
        console.warn('[RevenueCat] Still not initialized after init attempt');
        return [];
      }
    }

    try {
      console.log('[RevenueCat] Fetching offerings...');
      const offerings = await Purchases.getOfferings();

      // Debug: Log FULL offerings object to see everything
      console.log('[RevenueCat] FULL offerings object:', JSON.stringify(offerings, null, 2));

      // Debug: Log parsed info
      console.log('[RevenueCat] Offerings response:', JSON.stringify({
        hasCurrent: !!offerings.current,
        currentIdentifier: offerings.current?.identifier || 'none',
        packagesCount: offerings.current?.availablePackages?.length || 0,
        packageIds: offerings.current?.availablePackages?.map((p: any) => p.identifier) || [],
        allOfferingKeys: Object.keys(offerings.all || {}),
        allOfferings: Object.entries(offerings.all || {}).map(([key, val]: [string, any]) => ({
          key,
          identifier: val?.identifier,
          packagesCount: val?.availablePackages?.length || 0
        }))
      }, null, 2));

      // Check current offering
      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        console.log('[RevenueCat] Found', offerings.current.availablePackages.length, 'packages in current offering');
        return offerings.current.availablePackages;
      }

      // Try to get any offering if no current
      const allOfferingKeys = Object.keys(offerings.all || {});
      if (allOfferingKeys.length > 0) {
        const firstOffering = offerings.all[allOfferingKeys[0]];
        if (firstOffering?.availablePackages?.length > 0) {
          console.log('[RevenueCat] Using first available offering:', allOfferingKeys[0]);
          return firstOffering.availablePackages;
        }
      }

      // No packages found - retry once after a short delay
      if (retryCount < MAX_RETRIES) {
        console.log('[RevenueCat] No packages found, retrying in 1 second... (attempt', retryCount + 1, ')');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.getOfferings(retryCount + 1);
      }

      console.warn('[RevenueCat] No offerings or packages available after retries');
      return [];
    } catch (error: any) {
      console.error('[RevenueCat] Failed to get offerings:', error?.message || error);

      // Retry on error
      if (retryCount < MAX_RETRIES) {
        console.log('[RevenueCat] Retrying after error... (attempt', retryCount + 1, ')');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.getOfferings(retryCount + 1);
      }

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
