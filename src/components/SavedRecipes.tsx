'use client';

import { useState } from 'react';
import { Recipe, WorldRegion, WORLD_REGIONS } from '@/types';
import RecipeCard from './RecipeCard';

interface SavedRecipesProps {
  recipes: Recipe[];
  onUnsave: (recipeId: string) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function SavedRecipes({
  recipes,
  onUnsave,
  onAddToShoppingList,
  isOpen,
  onClose,
}: SavedRecipesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<WorldRegion | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRegion = filterRegion === 'all' || recipe.region === filterRegion;
    const matchesDifficulty = filterDifficulty === 'all' || recipe.difficulty === filterDifficulty;

    return matchesSearch && matchesRegion && matchesDifficulty;
  });

  // Group by region
  const groupedByRegion = filteredRecipes.reduce((acc, recipe) => {
    if (!acc[recipe.region]) {
      acc[recipe.region] = [];
    }
    acc[recipe.region].push(recipe);
    return acc;
  }, {} as Record<WorldRegion, Recipe[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl h-full bg-card border-l border-border overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <h2 className="font-bold text-lg">Saved Recipes</h2>
            <span className="text-sm text-muted">({recipes.length})</span>
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

        {/* Search and filters */}
        <div className="p-4 border-b border-border space-y-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipes..."
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none text-sm"
          />

          <div className="flex gap-2 overflow-x-auto">
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value as WorldRegion | 'all')}
              className="flex-shrink-0 px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:border-primary focus:outline-none"
            >
              <option value="all">All Regions</option>
              {WORLD_REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.flag} {region.name}
                </option>
              ))}
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="flex-shrink-0 px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:border-primary focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12 text-muted">
              {recipes.length === 0 ? (
                <>
                  <span className="text-5xl mb-4 block">📚</span>
                  <p className="font-medium">No saved recipes yet</p>
                  <p className="text-sm mt-1">Save recipes from the chat to access them here</p>
                </>
              ) : (
                <>
                  <span className="text-5xl mb-4 block">🔍</span>
                  <p className="font-medium">No recipes match your filters</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filterRegion === 'all' ? (
                // Show grouped by region
                Object.entries(groupedByRegion).map(([region, regionRecipes]) => {
                  const regionInfo = WORLD_REGIONS.find((r) => r.id === region);
                  return (
                    <div key={region}>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                        <span className="text-xl">{regionInfo?.flag || '🌍'}</span>
                        <h3 className="font-semibold">{regionInfo?.name || region}</h3>
                        <span className="text-sm text-muted">({regionRecipes.length})</span>
                      </div>
                      <div className="space-y-4">
                        {regionRecipes.map((recipe) => (
                          <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onSave={() => onUnsave(recipe.id)}
                            onAddToShoppingList={onAddToShoppingList}
                            isSaved={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Show flat list
                <div className="space-y-4">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onSave={() => onUnsave(recipe.id)}
                      onAddToShoppingList={onAddToShoppingList}
                      isSaved={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
