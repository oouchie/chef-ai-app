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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="recipe-card bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{regionInfo?.flag || '🍽️'}</span>
              <span className="text-xs text-muted">{recipe.cuisine}</span>
            </div>
            <h3 className="font-bold text-lg leading-tight">{recipe.name}</h3>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
        </div>

        <p className="text-sm text-muted mt-2 line-clamp-2">{recipe.description}</p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>Prep: {recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🍳</span>
            <span>Cook: {recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>Serves: {recipe.servings}</span>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {recipe.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-background rounded-full text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <button
          onClick={() => onSave(recipe)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            isSaved
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-background'
          }`}
        >
          <span>{isSaved ? '❤️' : '🤍'}</span>
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          onClick={() => onAddToShoppingList(recipe)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium hover:bg-background transition-colors border-l border-border"
        >
          <span>🛒</span>
          <span>Shopping List</span>
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium hover:bg-background transition-colors border-l border-border"
        >
          <span>{expanded ? '📖' : '📕'}</span>
          <span>{expanded ? 'Collapse' : 'View Recipe'}</span>
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border animate-fade-in">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'ingredients'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Ingredients ({recipe.ingredients.length})
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'instructions'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Steps ({recipe.instructions.length})
            </button>
            {recipe.tips && recipe.tips.length > 0 && (
              <button
                onClick={() => setActiveTab('tips')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'tips'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Tips ({recipe.tips.length})
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="p-4 max-h-80 overflow-y-auto">
            {activeTab === 'ingredients' && (
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      <strong>{ing.amount} {ing.unit}</strong> {ing.name}
                      {ing.notes && (
                        <span className="text-muted"> ({ing.notes})</span>
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
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            )}

            {activeTab === 'tips' && recipe.tips && (
              <ul className="space-y-3">
                {recipe.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-accent">💡</span>
                    <span>{tip}</span>
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
