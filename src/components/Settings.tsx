'use client';

import { useState, useEffect } from 'react';
import { getStoredApiKey, setStoredApiKey, removeStoredApiKey } from '@/lib/chat';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = getStoredApiKey();
    if (stored) {
      setApiKey(stored);
      setHasKey(true);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      setStoredApiKey(apiKey.trim());
      setHasKey(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleRemove = () => {
    removeStoredApiKey();
    setApiKey('');
    setHasKey(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="font-bold text-lg">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* API Key Section */}
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <span>🔑</span>
              Anthropic API Key
            </h3>
            <p className="text-sm text-muted mb-3">
              Add your API key to enable AI-powered recipe recommendations. Without a key, the app runs in demo mode.
            </p>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg focus:border-primary focus:outline-none text-sm font-mono"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showKey ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim()}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors font-medium"
                >
                  {saved ? '✓ Saved!' : 'Save Key'}
                </button>
                {hasKey && (
                  <button
                    onClick={handleRemove}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {hasKey && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                <span>✓</span>
                <span>API key configured - AI mode active</span>
              </div>
            )}

            <div className="mt-4 p-3 bg-background rounded-lg">
              <p className="text-xs text-muted">
                <strong>Get an API key:</strong> Visit{' '}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  console.anthropic.com
                </a>
                {' '}to create an account and get your API key.
              </p>
              <p className="text-xs text-muted mt-2">
                Your key is stored locally on your device and never sent to our servers.
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="pt-4 border-t border-border">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <span>👨‍🍳</span>
              About Chef AI
            </h3>
            <p className="text-sm text-muted">
              Chef AI is your personal culinary assistant, helping you discover recipes from around the world. Save your favorites, create shopping lists, plan meals, and explore cuisines from 8 global regions.
            </p>
            <p className="text-xs text-muted mt-3">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
