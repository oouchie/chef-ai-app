'use client';

import { useState } from 'react';

interface RestaurantRecipesProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchRecipe: (query: string) => void;
  isPremium: boolean;
  hasUsedTrial: boolean;
  onTrialUsed: () => void;
  onShowPaywall: () => void;
}

interface Restaurant {
  name: string;
  emoji: string;
  category: string;
  popularDishes: string[];
  color: string;
}

const POPULAR_RESTAURANTS: Restaurant[] = [
  {
    name: 'Olive Garden',
    emoji: '🍝',
    category: 'Italian',
    popularDishes: ['Breadsticks', 'Chicken Alfredo', 'Zuppa Toscana', 'Chicken Parm'],
    color: 'from-green-500 to-emerald-600',
  },
  {
    name: 'Chipotle',
    emoji: '🌯',
    category: 'Mexican',
    popularDishes: ['Burrito Bowl', 'Carnitas', 'Chicken Burrito', 'Guacamole'],
    color: 'from-red-500 to-orange-500',
  },
  {
    name: 'Cheesecake Factory',
    emoji: '🍰',
    category: 'American',
    popularDishes: ['Cheesecake', 'Avocado Egg Rolls', 'Louisiana Chicken Pasta', 'Bang Bang Chicken'],
    color: 'from-amber-500 to-yellow-500',
  },
  {
    name: 'Chick-fil-A',
    emoji: '🐔',
    category: 'Fast Food',
    popularDishes: ['Chicken Sandwich', 'Nuggets', 'Waffle Fries', 'Chick-fil-A Sauce'],
    color: 'from-red-600 to-red-500',
  },
  {
    name: 'Panda Express',
    emoji: '🥡',
    category: 'Chinese-American',
    popularDishes: ['Orange Chicken', 'Beijing Beef', 'Honey Walnut Shrimp', 'Chow Mein'],
    color: 'from-red-500 to-rose-500',
  },
  {
    name: 'Texas Roadhouse',
    emoji: '🥩',
    category: 'Steakhouse',
    popularDishes: ['Ribeye Steak', 'Rolls with Cinnamon Butter', 'Loaded Baked Potato', 'Rattlesnake Bites'],
    color: 'from-amber-600 to-orange-600',
  },
  {
    name: 'Red Lobster',
    emoji: '🦞',
    category: 'Seafood',
    popularDishes: ['Cheddar Bay Biscuits', 'Lobster Tail', 'Shrimp Scampi', 'Admiral\'s Feast'],
    color: 'from-red-600 to-red-700',
  },
  {
    name: 'Cracker Barrel',
    emoji: '🥞',
    category: 'Southern',
    popularDishes: ['Chicken & Dumplings', 'Hashbrown Casserole', 'Biscuits & Gravy', 'Country Fried Steak'],
    color: 'from-amber-500 to-amber-600',
  },
  {
    name: 'P.F. Chang\'s',
    emoji: '🥢',
    category: 'Asian',
    popularDishes: ['Lettuce Wraps', 'Dynamite Shrimp', 'Mongolian Beef', 'Chang\'s Spicy Chicken'],
    color: 'from-slate-600 to-slate-700',
  },
  {
    name: 'In-N-Out',
    emoji: '🍔',
    category: 'Fast Food',
    popularDishes: ['Double-Double', 'Animal Style Fries', 'Protein Style Burger', 'Neapolitan Shake'],
    color: 'from-red-500 to-yellow-500',
  },
  {
    name: 'Popeyes',
    emoji: '🍗',
    category: 'Fast Food',
    popularDishes: ['Chicken Sandwich', 'Spicy Chicken', 'Red Beans & Rice', 'Cajun Fries'],
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Outback Steakhouse',
    emoji: '🦘',
    category: 'Steakhouse',
    popularDishes: ['Bloomin\' Onion', 'Alice Springs Chicken', 'Outback Special', 'Chocolate Thunder'],
    color: 'from-amber-700 to-orange-700',
  },
];

export default function RestaurantRecipes({
  isOpen,
  onClose,
  onSearchRecipe,
  isPremium,
  hasUsedTrial,
  onTrialUsed,
  onShowPaywall,
}: RestaurantRecipesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    // Check access
    if (!isPremium && hasUsedTrial) {
      onShowPaywall();
      return;
    }
    setSelectedRestaurant(restaurant);
  };

  const handleDishClick = (restaurant: Restaurant, dish: string) => {
    // Check access
    if (!isPremium && hasUsedTrial) {
      onShowPaywall();
      return;
    }

    // Mark trial as used if not premium
    if (!isPremium && !hasUsedTrial) {
      onTrialUsed();
    }

    // Send the query to chat
    const query = `Make me a homemade version of ${restaurant.name}'s ${dish}. Give me a recipe that tastes just like the restaurant!`;
    onSearchRecipe(query);
    onClose();
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Check access
    if (!isPremium && hasUsedTrial) {
      onShowPaywall();
      return;
    }

    // Mark trial as used if not premium
    if (!isPremium && !hasUsedTrial) {
      onTrialUsed();
    }

    const query = `Make me a homemade recipe inspired by ${searchTerm}. I want something that tastes like I'm eating at the restaurant!`;
    onSearchRecipe(query);
    onClose();
  };

  const filteredRestaurants = searchTerm
    ? POPULAR_RESTAURANTS.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : POPULAR_RESTAURANTS;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={() => {
          setSelectedRestaurant(null);
          onClose();
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] glass-strong rounded-2xl overflow-hidden flex flex-col animate-scale-in shadow-premium">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/20 text-lg">
                🍽️
              </span>
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  Restaurant Recipes
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                    PREMIUM
                  </span>
                </h2>
                <p className="text-xs text-muted">Get recipes inspired by your favorite restaurants</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedRestaurant(null);
                onClose();
              }}
              className="p-2.5 btn-glass rounded-xl hover:shadow-glow-rose transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Trial indicator for free users */}
          {!isPremium && (
            <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${hasUsedTrial ? 'bg-rose-500/10 text-rose-500' : 'bg-purple-500/10 text-purple-600'}`}>
              {hasUsedTrial
                ? '🔒 Free trial used. Upgrade to Premium for unlimited restaurant recipes!'
                : '✨ You have 1 free restaurant recipe to try!'}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <form onSubmit={handleCustomSearch} className="flex gap-2">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search any restaurant..."
                className="w-full pl-10 pr-4 py-3 glass border border-white/30 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!searchTerm.trim()}
              className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 hover:shadow-glow-rose transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedRestaurant ? (
            // Dish selection view
            <div className="animate-fade-in">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="flex items-center gap-2 text-sm text-muted hover:text-foreground mb-4 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back to restaurants
              </button>

              <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedRestaurant.color} text-white mb-6`}>
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{selectedRestaurant.emoji}</span>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedRestaurant.name}</h3>
                    <p className="text-white/80">{selectedRestaurant.category}</p>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold mb-3">Popular Dishes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedRestaurant.popularDishes.map((dish) => (
                  <button
                    key={dish}
                    onClick={() => handleDishClick(selectedRestaurant, dish)}
                    className="p-4 glass-card rounded-xl text-left hover:shadow-glow-primary transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{dish}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-muted group-hover:text-primary transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                    <p className="text-xs text-muted mt-1">Get homemade recipe</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 glass rounded-xl">
                <p className="text-sm text-muted">
                  💡 <strong>Tip:</strong> You can also ask for any dish from {selectedRestaurant.name} by searching above!
                </p>
              </div>
            </div>
          ) : (
            // Restaurant grid view
            <>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
                Popular Restaurants
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredRestaurants.map((restaurant) => (
                  <button
                    key={restaurant.name}
                    onClick={() => handleRestaurantClick(restaurant)}
                    className="p-4 glass-card rounded-xl hover:shadow-glow-primary transition-all text-left group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${restaurant.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                      {restaurant.emoji}
                    </div>
                    <h4 className="font-semibold text-sm">{restaurant.name}</h4>
                    <p className="text-xs text-muted">{restaurant.category}</p>
                  </button>
                ))}
              </div>

              {filteredRestaurants.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted">No restaurants found. Try searching for "{searchTerm}"!</p>
                  <button
                    onClick={handleCustomSearch}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium"
                  >
                    Search for {searchTerm}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
