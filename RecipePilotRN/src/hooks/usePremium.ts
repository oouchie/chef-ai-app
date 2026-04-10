import { useState, useEffect, useCallback } from 'react';
import { purchaseService } from '@/lib/purchases';

interface UsePremiumReturn {
  isPremium: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to check and track premium subscription status.
 * Uses RevenueCat to verify entitlements.
 */
export function usePremium(): UsePremiumReturn {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPremium = useCallback(async () => {
    try {
      const status = await purchaseService.getSubscriptionStatus();
      console.log('[usePremium] Status:', status);
      setIsPremium(status.isPremium);
    } catch (error) {
      console.warn('[usePremium] Failed to check premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPremium();

    // Listen for subscription changes
    const handleUpdate = (info: any) => {
      const hasPremium = !!info?.entitlements?.active?.['premium'];
      console.log('[usePremium] Subscription updated, isPremium:', hasPremium);
      setIsPremium(hasPremium);
    };

    purchaseService.addCustomerInfoUpdateListener(handleUpdate);

    return () => {
      purchaseService.removeCustomerInfoUpdateListener(handleUpdate);
    };
  }, [checkPremium]);

  return { isPremium, isLoading, refresh: checkPremium };
}

export type { UsePremiumReturn };
