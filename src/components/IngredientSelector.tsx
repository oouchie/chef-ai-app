'use client';

import { useState, useEffect } from 'react';
import { Recipe, Ingredient } from '@/types';

interface IngredientSelectorProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  onAddSelected: (ingredients: Ingredient[]) => void;
}

export default function IngredientSelector({
  recipe,
  isOpen,
  onClose,
  onAddSelected,
}: IngredientSelectorProps) {
  // All ingredients start as selected (need to buy)
  const [selected, setSelected] = useState<Set<number>>(
    new Set(recipe.ingredients?.map((_, i) => i) || [])
  );

  // Reset selection when recipe changes or modal opens
  useEffect(() => {
    if (isOpen && recipe.ingredients) {
      setSelected(new Set(recipe.ingredients.map((_, i) => i)));
    }
  }, [recipe.id, isOpen]);

  const toggleIngredient = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(recipe.ingredients?.map((_, i) => i) || []));
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const handleAdd = () => {
    const selectedIngredients = recipe.ingredients?.filter((_, i) => selected.has(i)) || [];
    onAddSelected(selectedIngredients);
    onClose();
  };

  if (!isOpen || !recipe.ingredients) return null;

  const selectedCount = selected.size;
  const totalCount = recipe.ingredients.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[85vh] glass-strong rounded-2xl overflow-hidden flex flex-col animate-scale-in shadow-premium">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-secondary/5 to-teal-500/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-teal-500 flex items-center justify-center shadow-md shadow-secondary/20 text-lg">
                🛒
              </span>
              <div>
                <h2 className="font-bold text-lg">Add to Shopping List</h2>
                <p className="text-xs text-muted">{recipe.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 btn-glass rounded-xl hover:shadow-glow-secondary transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted">
            Uncheck items you already have at home
          </p>
        </div>

        {/* Select All / None */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-background/30">
          <span className="text-sm font-medium">
            {selectedCount} of {totalCount} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-xs font-medium btn-glass rounded-lg hover:shadow-sm transition-all"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 text-xs font-medium btn-glass rounded-lg hover:shadow-sm transition-all"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Ingredients list */}
        <div className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, index) => (
              <li key={index}>
                <button
                  onClick={() => toggleIngredient(index)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                    selected.has(index)
                      ? 'glass-card border border-secondary/30'
                      : 'bg-background/30 border border-transparent opacity-60'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                      selected.has(index)
                        ? 'bg-gradient-to-br from-secondary to-teal-500 border-transparent shadow-md shadow-secondary/20'
                        : 'border-border'
                    }`}
                  >
                    {selected.has(index) && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>

                  {/* Ingredient text */}
                  <div className="flex-1 text-left">
                    <span className={`text-sm font-medium ${!selected.has(index) ? 'line-through text-muted' : ''}`}>
                      {ing.amount} {ing.unit} {ing.name}
                    </span>
                    {ing.notes && (
                      <span className="text-xs text-muted ml-2">({ing.notes})</span>
                    )}
                  </div>

                  {/* Status indicator */}
                  {!selected.has(index) && (
                    <span className="text-xs text-muted font-medium px-2 py-1 rounded-lg bg-background/50">
                      Have it
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-r from-background/50 via-transparent to-background/50">
          <button
            onClick={handleAdd}
            disabled={selectedCount === 0}
            className="w-full py-3.5 btn-gradient-secondary rounded-xl font-semibold disabled:opacity-50 hover:shadow-glow-secondary transition-all"
          >
            {selectedCount === 0
              ? 'No items selected'
              : `Add ${selectedCount} item${selectedCount !== 1 ? 's' : ''} to list`}
          </button>
        </div>
      </div>
    </div>
  );
}
