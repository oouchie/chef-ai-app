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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-strong rounded-2xl overflow-hidden animate-scale-in shadow-premium">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <h2 className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 btn-glass rounded-xl hover:shadow-glow-primary transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* API Key Section */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent/20 to-yellow-500/20 flex items-center justify-center text-sm">🔑</span>
              Anthropic API Key
            </h3>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              Add your API key to enable AI-powered recipe recommendations. Without a key, the app runs in demo mode.
            </p>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-3.5 pr-12 glass border border-white/30 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-glow-primary text-sm font-mono transition-all"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-foreground transition-colors"
                >
                  {showKey ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim()}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    saved
                      ? 'btn-gradient-secondary shadow-glow-secondary'
                      : 'btn-gradient hover:shadow-glow-primary disabled:opacity-50'
                  }`}
                >
                  {saved ? '✓ Saved!' : 'Save Key'}
                </button>
                {hasKey && (
                  <button
                    onClick={handleRemove}
                    className="px-5 py-3 btn-gradient-rose rounded-xl font-semibold hover:shadow-glow-rose transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {hasKey && (
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-secondary px-4 py-2.5 rounded-xl bg-gradient-to-r from-secondary/10 to-teal-500/10 border border-secondary/20">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-secondary to-teal-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span>API key configured - AI mode active</span>
              </div>
            )}

            <div className="mt-4 p-4 glass-card rounded-xl">
              <p className="text-xs text-muted leading-relaxed">
                <strong className="text-foreground">Get an API key:</strong> Visit{' '}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  console.anthropic.com
                </a>
                {' '}to create an account and get your API key.
              </p>
              <p className="text-xs text-muted mt-2 flex items-center gap-1.5">
                <span>🔒</span>
                Your key is stored locally on your device and never sent to our servers.
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="pt-5 border-t border-white/10">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm">👨‍🍳</span>
              About RecipePilot
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              RecipePilot is your personal culinary assistant, helping you discover recipes from around the world. Save your favorites, create shopping lists, plan meals, and explore cuisines from 8 global regions.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20">
                Version 1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
