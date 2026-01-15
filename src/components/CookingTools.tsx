'use client';

import { useState, useEffect, useCallback } from 'react';
import { Recipe } from '@/types';
import {
  scaleRecipe,
  findSubstitutions,
  estimateNutrition,
  TIMER_PRESETS,
  TimerPreset,
  UNIT_CONVERSIONS,
  convertUnit,
} from '@/lib/cooking-helpers';

interface CookingToolsProps {
  recipe?: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onTimerStateChange?: (hasActiveTimer: boolean) => void;
}

type ToolTab = 'scale' | 'substitute' | 'timer' | 'nutrition' | 'convert';

export default function CookingTools({ recipe, isOpen, onClose, onTimerStateChange }: CookingToolsProps) {
  const [activeTab, setActiveTab] = useState<ToolTab>('timer');
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [searchIngredient, setSearchIngredient] = useState('');
  const [activeTimer, setActiveTimer] = useState<{
    preset: TimerPreset;
    remaining: number;
    isRunning: boolean;
  } | null>(null);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [convertFrom, setConvertFrom] = useState({ amount: 1, unit: 'cup' });
  const [convertTo, setConvertTo] = useState('ml');

  // Notify parent of timer state changes
  useEffect(() => {
    onTimerStateChange?.(activeTimer !== null && activeTimer.isRunning);
  }, [activeTimer?.isRunning, activeTimer !== null, onTimerStateChange]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeTimer?.isRunning && activeTimer.remaining > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) =>
          prev
            ? { ...prev, remaining: prev.remaining - 1 }
            : null
        );
      }, 1000);
    } else if (activeTimer?.remaining === 0 && activeTimer.isRunning) {
      // Timer finished - play sound and show notification
      playAlarm();
      setActiveTimer((prev) => (prev ? { ...prev, isRunning: false } : null));
    }

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning, activeTimer?.remaining]);

  const playAlarm = useCallback(() => {
    // Create a simple beep using Web Audio API
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gain.gain.value = 0.3;

      oscillator.start();

      // Beep pattern
      setTimeout(() => gain.gain.value = 0, 200);
      setTimeout(() => gain.gain.value = 0.3, 400);
      setTimeout(() => gain.gain.value = 0, 600);
      setTimeout(() => gain.gain.value = 0.3, 800);
      setTimeout(() => {
        oscillator.stop();
        ctx.close();
      }, 1000);
    }

    // Also try to show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: activeTimer?.preset.name || 'Your timer is done!',
        icon: activeTimer?.preset.icon || '⏰',
      });
    }
  }, [activeTimer?.preset]);

  const startTimer = (preset: TimerPreset) => {
    setActiveTimer({
      preset,
      remaining: preset.duration,
      isRunning: true,
    });
  };

  const startCustomTimer = () => {
    const customPreset: TimerPreset = {
      name: `${customMinutes} minute timer`,
      duration: customMinutes * 60,
      icon: '⏱️',
      category: 'Custom',
    };
    startTimer(customPreset);
  };

  const toggleTimer = () => {
    setActiveTimer((prev) =>
      prev ? { ...prev, isRunning: !prev.isRunning } : null
    );
  };

  const resetTimer = () => {
    setActiveTimer(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get substitutions
  const substitutions = searchIngredient ? findSubstitutions(searchIngredient) : [];

  // Get scaled ingredients
  const scaledIngredients = recipe ? scaleRecipe(recipe, servings) : [];

  // Get nutrition estimate
  const nutrition = recipe ? estimateNutrition(recipe) : null;

  // Get conversion result
  const conversionResult = convertUnit(convertFrom.amount, convertFrom.unit, convertTo);

  // Group timer presets by category
  const timerCategories = TIMER_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, TimerPreset[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] glass-strong rounded-2xl overflow-hidden flex flex-col animate-scale-in shadow-premium">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-accent/5 to-primary/5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-yellow-500 flex items-center justify-center shadow-md shadow-accent/20 text-lg">
              🛠️
            </span>
            <div>
              <h2 className="font-bold text-lg">Cooking Tools</h2>
              <p className="text-xs text-muted">Timers, converters & more</p>
            </div>
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

        {/* Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto scrollbar-hide bg-gradient-to-r from-background/50 via-transparent to-background/50">
          {[
            { id: 'timer', label: 'Timer', icon: '⏱️' },
            { id: 'scale', label: 'Scale Recipe', icon: '⚖️' },
            { id: 'substitute', label: 'Substitutes', icon: '🔄' },
            { id: 'nutrition', label: 'Nutrition', icon: '📊' },
            { id: 'convert', label: 'Convert', icon: '📐' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ToolTab)}
              className={`flex-shrink-0 px-4 py-4 text-sm font-semibold transition-all relative ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Timer Tab */}
          {activeTab === 'timer' && (
            <div className="space-y-6">
              {/* Active timer */}
              {activeTimer && (
                <div className="glass-card rounded-2xl p-8 text-center bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-3xl">{activeTimer.preset.icon}</span>
                  </div>
                  <div className="text-sm font-medium text-muted mb-3">{activeTimer.preset.name}</div>
                  <div className={`text-6xl font-bold mb-6 font-mono tracking-tight ${
                    activeTimer.remaining <= 10 && activeTimer.isRunning
                      ? 'bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent animate-pulse'
                      : 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'
                  }`}>
                    {formatTime(activeTimer.remaining)}
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={toggleTimer}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                        activeTimer.isRunning
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/20 hover:shadow-lg'
                          : 'btn-gradient-secondary shadow-glow-secondary'
                      }`}
                    >
                      {activeTimer.isRunning ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={resetTimer}
                      className="px-8 py-3 btn-glass rounded-xl font-semibold hover:shadow-sm transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Custom timer */}
              <div className="glass-card rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-sm">⏱️</span>
                  Custom Timer
                </h3>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
                    className="flex-1 px-4 py-3 glass border border-white/30 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center text-lg font-semibold"
                  />
                  <span className="flex items-center text-muted font-medium">minutes</span>
                  <button
                    onClick={startCustomTimer}
                    disabled={!!activeTimer?.isRunning}
                    className="px-6 py-3 btn-gradient rounded-xl font-semibold disabled:opacity-50 hover:shadow-glow-primary transition-all"
                  >
                    Start
                  </button>
                </div>
              </div>

              {/* Preset timers */}
              <div className="space-y-5">
                {Object.entries(timerCategories).map(([category, presets]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-sm text-muted mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {presets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => startTimer(preset)}
                          disabled={!!activeTimer?.isRunning}
                          className="flex items-center gap-3 p-4 glass-card rounded-xl hover:shadow-glow-primary disabled:opacity-50 transition-all text-left"
                        >
                          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl">{preset.icon}</span>
                          <div>
                            <div className="text-sm font-semibold">{preset.name}</div>
                            <div className="text-xs text-muted font-medium">{formatTime(preset.duration)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scale Recipe Tab */}
          {activeTab === 'scale' && (
            <div className="space-y-4">
              {recipe ? (
                <>
                  <div className="bg-background rounded-xl p-4">
                    <h3 className="font-medium mb-3">Adjust Servings</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-muted">Original: {recipe.servings} servings</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setServings(Math.max(1, servings - 1))}
                          className="w-8 h-8 bg-card border border-border rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={servings}
                          onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 text-center bg-card border border-border rounded-lg focus:border-primary focus:outline-none"
                        />
                        <button
                          onClick={() => setServings(servings + 1)}
                          className="w-8 h-8 bg-card border border-border rounded-lg hover:bg-primary/10 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-background rounded-xl p-4">
                    <h3 className="font-medium mb-3">Scaled Ingredients ({servings} servings)</h3>
                    <ul className="space-y-2">
                      {scaledIngredients.map((ing, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary">•</span>
                          <span>
                            <strong>{ing.amount} {ing.unit}</strong> {ing.name}
                            {ing.notes && <span className="text-muted"> ({ing.notes})</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted">
                  <span className="text-4xl mb-4 block">⚖️</span>
                  <p>Select a recipe to scale ingredients</p>
                </div>
              )}
            </div>
          )}

          {/* Substitute Tab */}
          {activeTab === 'substitute' && (
            <div className="space-y-4">
              <div className="bg-background rounded-xl p-4">
                <h3 className="font-medium mb-3">Find Ingredient Substitutes</h3>
                <input
                  type="text"
                  value={searchIngredient}
                  onChange={(e) => setSearchIngredient(e.target.value)}
                  placeholder="Type an ingredient (e.g., butter, egg, milk)..."
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              {searchIngredient && substitutions.length > 0 && (
                <div className="bg-background rounded-xl p-4">
                  <h3 className="font-medium mb-3">Substitutes for "{searchIngredient}"</h3>
                  <ul className="space-y-3">
                    {substitutions.map((sub, index) => (
                      <li key={index} className="p-3 bg-card rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium">{sub.substitute}</div>
                            <div className="text-sm text-muted mt-1">{sub.notes}</div>
                          </div>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {sub.ratio}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {searchIngredient && substitutions.length === 0 && (
                <div className="text-center py-8 text-muted">
                  <span className="text-4xl mb-4 block">🤔</span>
                  <p>No substitutes found for "{searchIngredient}"</p>
                  <p className="text-sm mt-1">Try a common ingredient like butter, egg, or milk</p>
                </div>
              )}

              {!searchIngredient && (
                <div className="text-center py-8 text-muted">
                  <span className="text-4xl mb-4 block">🔄</span>
                  <p>Search for an ingredient to find substitutes</p>
                  <p className="text-sm mt-1">Great for dietary restrictions or missing ingredients</p>
                </div>
              )}
            </div>
          )}

          {/* Nutrition Tab */}
          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              {recipe && nutrition ? (
                <>
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4">
                    <h3 className="font-medium mb-1">{recipe.name}</h3>
                    <p className="text-sm text-muted">Estimated nutrition per serving</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: 'Calories', value: nutrition.calories, unit: 'kcal', color: 'bg-red-500' },
                      { label: 'Protein', value: nutrition.protein, unit: 'g', color: 'bg-blue-500' },
                      { label: 'Carbs', value: nutrition.carbs, unit: 'g', color: 'bg-yellow-500' },
                      { label: 'Fat', value: nutrition.fat, unit: 'g', color: 'bg-purple-500' },
                      { label: 'Fiber', value: nutrition.fiber, unit: 'g', color: 'bg-green-500' },
                    ].map((item) => (
                      <div key={item.label} className="bg-background rounded-xl p-4 text-center">
                        <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-2`} />
                        <div className="text-2xl font-bold">{item.value}</div>
                        <div className="text-xs text-muted">{item.unit}</div>
                        <div className="text-sm font-medium mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-background rounded-xl p-4">
                    <p className="text-xs text-muted">
                      * These are rough estimates based on typical ingredient amounts. Actual nutrition may vary based on specific brands, preparation methods, and portion sizes.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted">
                  <span className="text-4xl mb-4 block">📊</span>
                  <p>Select a recipe to see nutrition estimates</p>
                </div>
              )}
            </div>
          )}

          {/* Convert Tab */}
          {activeTab === 'convert' && (
            <div className="space-y-4">
              <div className="bg-background rounded-xl p-4">
                <h3 className="font-medium mb-4">Unit Converter</h3>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex gap-2 flex-1 w-full">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={convertFrom.amount}
                      onChange={(e) => setConvertFrom({ ...convertFrom, amount: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-3 py-2 bg-card border border-border rounded-lg focus:border-primary focus:outline-none"
                    />
                    <select
                      value={convertFrom.unit}
                      onChange={(e) => setConvertFrom({ ...convertFrom, unit: e.target.value })}
                      className="px-3 py-2 bg-card border border-border rounded-lg focus:border-primary focus:outline-none"
                    >
                      {Object.keys(UNIT_CONVERSIONS).map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  <span className="text-2xl">→</span>

                  <div className="flex gap-2 flex-1 w-full">
                    <div className="flex-1 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg font-bold text-center">
                      {conversionResult !== null ? conversionResult.toFixed(2) : '—'}
                    </div>
                    <select
                      value={convertTo}
                      onChange={(e) => setConvertTo(e.target.value)}
                      className="px-3 py-2 bg-card border border-border rounded-lg focus:border-primary focus:outline-none"
                    >
                      {(UNIT_CONVERSIONS[convertFrom.unit] || []).map((conv) => (
                        <option key={conv.to} value={conv.to}>{conv.to}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-xl p-4">
                <h3 className="font-medium mb-3">Quick Reference</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-muted mb-2">Volume</h4>
                    <ul className="space-y-1">
                      <li>1 cup = 16 tbsp = 236 ml</li>
                      <li>1 tbsp = 3 tsp = 15 ml</li>
                      <li>1 tsp = 5 ml</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-muted mb-2">Weight</h4>
                    <ul className="space-y-1">
                      <li>1 lb = 16 oz = 454 g</li>
                      <li>1 oz = 28 g</li>
                      <li>1 kg = 2.2 lb</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
