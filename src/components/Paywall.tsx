'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  remainingRequests?: number;
}

export default function Paywall({ isOpen, onClose, onSubscribe, remainingRequests }: PaywallProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await onSubscribe();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-md bg-gradient-to-b from-amber-50 to-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
              <div className="flex justify-center mb-3">
                <Image
                  src="/images/logo.png"
                  alt="RecipePilot"
                  width={64}
                  height={64}
                  className="rounded-xl"
                />
              </div>
              <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
              <p className="text-amber-100 mt-1">Unlock unlimited recipes</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Usage warning */}
              {remainingRequests !== undefined && remainingRequests <= 3 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-amber-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-medium">
                      {remainingRequests === 0
                        ? "You've reached your daily limit"
                        : `Only ${remainingRequests} free recipes left today`}
                    </span>
                  </div>
                </div>
              )}

              {/* Comparison */}
              <div className="space-y-4 mb-6">
                {/* Free tier */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-700">Free</span>
                    <span className="text-gray-500">$0/month</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> 10 recipes per day
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Basic meal planning
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">✗</span> <span className="text-gray-400">Unlimited recipes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">✗</span> <span className="text-gray-400">Priority responses</span>
                    </li>
                  </ul>
                </div>

                {/* Premium tier */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-400 relative">
                  <div className="absolute -top-3 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    BEST VALUE
                  </div>
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <span className="font-bold text-amber-800">Premium</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-amber-600">$4.99</span>
                      <span className="text-amber-700">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-amber-900">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span> Unlimited recipes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span> Advanced meal planning
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span> Save unlimited recipes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span> Priority AI responses
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600 font-bold">✓</span> Cooking tools & timers
                    </li>
                  </ul>
                </div>
              </div>

              {/* Subscribe button */}
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Start Premium - $4.99/month'
                )}
              </button>

              {/* Cancel text */}
              <p className="text-center text-gray-500 text-xs mt-4">
                Cancel anytime. Billed monthly through App Store.
              </p>

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
