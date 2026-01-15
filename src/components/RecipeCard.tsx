'use client';

import { useState } from 'react';
import { Recipe, WORLD_REGIONS } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onSave: (recipe: Recipe) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
  isSaved: boolean;
  showFullDetails?: boolean;
}

export default function RecipeCard({
  recipe,
  onSave,
  onAddToShoppingList,
  isSaved,
  showFullDetails = false,
}: RecipeCardProps) {
  const [expanded, setExpanded] = useState(showFullDetails);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'tips'>('ingredients');

  const regionInfo = WORLD_REGIONS.find((r) => r.id === recipe.region);

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'badge-easy';
      case 'Medium':
        return 'badge-medium';
      case 'Hard':
        return 'badge-hard';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="recipe-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-lg shadow-sm">
                {regionInfo?.flag || '🍽️'}
              </span>
              <span className="text-xs text-muted font-medium px-2 py-0.5 rounded-full bg-background/50">{recipe.cuisine}</span>
            </div>
            <h3 className="font-bold text-lg leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{recipe.name}</h3>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${getDifficultyClass(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
        </div>

        <p className="text-sm text-muted mt-3 line-clamp-2 leading-relaxed">{recipe.description}</p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/60 text-xs font-medium">
            <span>⏱️</span>
            <span>Prep: {recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/60 text-xs font-medium">
            <span>🍳</span>
            <span>Cook: {recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/60 text-xs font-medium">
            <span>👥</span>
            <span>Serves: {recipe.servings}</span>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {recipe.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full text-muted font-medium border border-primary/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex border-t border-white/10 bg-gradient-to-r from-transparent via-background/30 to-transparent">
        <button
          onClick={() => onSave(recipe)}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all ${
            isSaved
              ? 'bg-gradient-to-r from-rose-500/10 to-pink-500/10 text-rose-500'
              : 'hover:bg-rose-500/5 text-muted hover:text-rose-500'
          }`}
        >
          <span className="text-base">{isSaved ? '❤️' : '🤍'}</span>
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          onClick={() => onAddToShoppingList(recipe)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium hover:bg-secondary/5 text-muted hover:text-secondary transition-all border-l border-white/10"
        >
          <span className="text-base">🛒</span>
          <span>Shopping List</span>
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium hover:bg-primary/5 text-muted hover:text-primary transition-all border-l border-white/10"
        >
          <span className="text-base">{expanded ? '📖' : '📕'}</span>
          <span>{expanded ? 'Collapse' : 'View Recipe'}</span>
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/10 animate-slide-up">
          {/* Tabs */}
          <div className="flex bg-gradient-to-r from-background/50 via-transparent to-background/50">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                activeTab === 'ingredients'
                  ? 'text-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Ingredients ({recipe.ingredients.length})
              {activeTab === 'ingredients' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full shadow-glow-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                activeTab === 'instructions'
                  ? 'text-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Steps ({recipe.instructions.length})
              {activeTab === 'instructions' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full shadow-glow-primary" />
              )}
            </button>
            {recipe.tips && recipe.tips.length > 0 && (
              <button
                onClick={() => setActiveTab('tips')}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                  activeTab === 'tips'
                    ? 'text-accent'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Tips ({recipe.tips.length})
                {activeTab === 'tips' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-accent to-secondary rounded-full" />
                )}
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="p-4 max-h-80 overflow-y-auto">
            {activeTab === 'ingredients' && (
              <ul className="space-y-2.5">
                {recipe.ingredients.map((ing, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm glass-card p-3 rounded-xl"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-secondary to-teal-500 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">
                      <strong className="text-foreground">{ing.amount} {ing.unit}</strong>{' '}
                      <span className="text-muted">{ing.name}</span>
                      {ing.notes && (
                        <span className="text-muted/70 italic"> ({ing.notes})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'instructions' && (
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-sm"
                  >
                    <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-primary to-accent text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-md shadow-primary/20">
                      {index + 1}
                    </span>
                    <span className="pt-1 leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            )}

            {activeTab === 'tips' && recipe.tips && (
              <ul className="space-y-3">
                {recipe.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm glass-card p-3 rounded-xl border-l-3 border-accent"
                  >
                    <span className="w-6 h-6 bg-gradient-to-br from-accent/20 to-yellow-500/20 rounded-lg flex items-center justify-center">💡</span>
                    <span className="pt-0.5 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
