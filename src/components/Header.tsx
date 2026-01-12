'use client';

import { WorldRegion, WORLD_REGIONS } from '@/types';

interface HeaderProps {
  selectedRegion: WorldRegion | 'all';
  onRegionChange: (region: WorldRegion | 'all') => void;
  savedRecipesCount: number;
  todosCount: number;
  onOpenSavedRecipes: () => void;
  onOpenTodos: () => void;
  onOpenTools: () => void;
  onOpenMealPlanner: () => void;
  onOpenSettings: () => void;
}

export default function Header({
  selectedRegion,
  onRegionChange,
  savedRecipesCount,
  todosCount,
  onOpenSavedRecipes,
  onOpenTodos,
  onOpenTools,
  onOpenMealPlanner,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👨‍🍳</span>
            <div>
              <h1 className="text-xl font-bold text-foreground">Chef AI</h1>
              <p className="text-xs text-muted">Your Personal Recipe Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSavedRecipes}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-primary/10 transition-colors"
              title="Saved Recipes"
            >
              <span>📖</span>
              <span className="hidden sm:inline text-sm">Saved</span>
              {savedRecipesCount > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  {savedRecipesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenTodos}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-secondary/10 transition-colors"
              title="Cooking Tasks"
            >
              <span>✅</span>
              <span className="hidden sm:inline text-sm">Tasks</span>
              {todosCount > 0 && (
                <span className="bg-secondary text-white text-xs px-2 py-0.5 rounded-full">
                  {todosCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenTools}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background hover:bg-accent/10 transition-colors"
              title="Cooking Tools"
            >
              <span>🛠️</span>
              <span className="hidden sm:inline text-sm">Tools</span>
            </button>

            <button
              onClick={onOpenMealPlanner}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 transition-colors"
              title="Meal Planner"
            >
              <span>📋</span>
              <span className="hidden sm:inline text-sm">Meal Prep</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-background hover:bg-muted/20 transition-colors"
              title="Settings"
            >
              <span>⚙️</span>
            </button>
          </div>
        </div>

        {/* Region selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
          <button
            onClick={() => onRegionChange('all')}
            className={`region-chip flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${
              selectedRegion === 'all'
                ? 'active border-transparent'
                : 'bg-background border-border hover:border-primary/50'
            }`}
          >
            🌍 All Cuisines
          </button>

          {WORLD_REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => onRegionChange(region.id)}
              className={`region-chip flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border ${
                selectedRegion === region.id
                  ? 'active border-transparent'
                  : 'bg-background border-border hover:border-primary/50'
              }`}
              title={region.description}
            >
              {region.flag} {region.name}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
