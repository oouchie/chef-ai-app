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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl h-full glass-strong border-l border-white/20 overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-primary/5 to-accent/5"
          style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-md shadow-rose-500/20 text-lg">
              📖
            </span>
            <div>
              <h2 className="font-bold text-lg">Saved Recipes</h2>
              <p className="text-xs text-muted">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved</p>
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

        {/* Search and filters */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-10 pr-4 py-3 glass border border-white/30 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-glow-primary text-sm transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value as WorldRegion | 'all')}
              className="flex-shrink-0 px-4 py-2.5 text-sm font-medium glass border border-white/30 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
              className="flex-shrink-0 px-4 py-2.5 text-sm font-medium glass border border-white/30 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
            <div className="text-center py-16 px-4">
              {recipes.length === 0 ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 flex items-center justify-center">
                    <span className="text-4xl">📚</span>
                  </div>
                  <p className="font-semibold text-lg">No saved recipes yet</p>
                  <p className="text-sm text-muted mt-2 max-w-xs mx-auto">Save recipes from the chat to access them here anytime</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <p className="font-semibold text-lg">No recipes match your filters</p>
                  <p className="text-sm text-muted mt-2">Try adjusting your search or filters</p>
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
                    <div key={region} className="animate-fade-in">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl shadow-sm">
                          {regionInfo?.flag || '🌍'}
                        </span>
                        <div>
                          <h3 className="font-bold">{regionInfo?.name || region}</h3>
                          <p className="text-xs text-muted">{regionRecipes.length} recipe{regionRecipes.length !== 1 ? 's' : ''}</p>
                        </div>
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
