'use client';

import Image from 'next/image';
import { WorldRegion, WORLD_REGIONS } from '@/types';

interface HeaderProps {
  selectedRegion: WorldRegion | 'all';
  onRegionChange: (region: WorldRegion | 'all') => void;
  savedRecipesCount: number;
  todosCount: number;
  onOpenSavedRecipes: () => void;
  onOpenTodos: () => void;
  onOpenTools: () => void;
  onOpenTimer: () => void;
  onOpenMealPlanner: () => void;
  onOpenRestaurantRecipes: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  hasActiveTimer?: boolean;
}

export default function Header({
  selectedRegion,
  onRegionChange,
  savedRecipesCount,
  todosCount,
  onOpenSavedRecipes,
  onOpenTodos,
  onOpenTools,
  onOpenTimer,
  onOpenMealPlanner,
  onOpenRestaurantRecipes,
  onOpenSettings,
  onNewChat,
  hasActiveTimer,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 glass-strong border-b border-white/20"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          {/* Logo & Title - Clickable to start new chat */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            title="Start New Chat"
          >
            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="RecipePilot"
                width={44}
                height={44}
                className="rounded-xl shadow-lg shadow-primary/20"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RecipePilot
              </h1>
              <p className="text-xs text-muted font-medium">Tap to start new chat</p>
            </div>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSavedRecipes}
              className="btn-glass flex items-center gap-2 px-3 py-2 rounded-xl"
              title="Saved Recipes"
            >
              <span className="text-lg">📖</span>
              <span className="hidden sm:inline text-sm font-medium">Saved</span>
              {savedRecipesCount > 0 && (
                <span className="bg-gradient-to-r from-primary to-accent text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
                  {savedRecipesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenTodos}
              className="btn-glass flex items-center gap-2 px-3 py-2 rounded-xl"
              title="Cooking Tasks"
            >
              <span className="text-lg">✅</span>
              <span className="hidden sm:inline text-sm font-medium">Tasks</span>
              {todosCount > 0 && (
                <span className="bg-gradient-to-r from-secondary to-teal-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
                  {todosCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenTimer}
              className={`btn-glass flex items-center gap-2 px-3 py-2 rounded-xl ${
                hasActiveTimer ? 'bg-gradient-to-r from-accent/20 to-primary/20 animate-pulse' : ''
              }`}
              title="Timer"
            >
              <span className="text-lg">⏱️</span>
              <span className="hidden sm:inline text-sm font-medium">Timer</span>
              {hasActiveTimer && (
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              )}
            </button>

            <button
              onClick={onOpenTools}
              className="btn-glass flex items-center gap-2 px-3 py-2 rounded-xl hidden sm:flex"
              title="Cooking Tools"
            >
              <span className="text-lg">🛠️</span>
              <span className="hidden sm:inline text-sm font-medium">Tools</span>
            </button>

            <button
              onClick={onOpenMealPlanner}
              className="btn-glass flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20"
              title="Meal Planner"
            >
              <span className="text-lg">📋</span>
              <span className="hidden sm:inline text-sm font-medium">Meal Prep</span>
            </button>

            <button
              onClick={onOpenRestaurantRecipes}
              className="btn-glass flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20"
              title="Restaurant Recipes (Premium)"
            >
              <span className="text-lg">🍽️</span>
              <span className="hidden sm:inline text-sm font-medium">Restaurants</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="btn-glass p-2.5 rounded-xl"
              title="Settings"
            >
              <span className="text-lg">⚙️</span>
            </button>
          </div>
        </div>

        {/* Region selector */}
        <div className="relative">
          {/* Scroll fade indicators */}
          <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none" />
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
          <button
            onClick={() => onRegionChange('all')}
            className={`region-chip flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold ${
              selectedRegion === 'all'
                ? 'active'
                : ''
            }`}
          >
            🌍 All Cuisines
          </button>

          {WORLD_REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => onRegionChange(region.id)}
              className={`region-chip flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold ${
                selectedRegion === region.id
                  ? 'active'
                  : ''
              }`}
              title={region.description}
            >
              {region.flag} {region.name}
            </button>
          ))}
        </div>
        </div>
      </div>
    </header>
  );
}
