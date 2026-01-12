import { Ingredient, Recipe } from '@/types';

// Scale recipe ingredients based on new serving size
export function scaleRecipe(recipe: Recipe, newServings: number): Ingredient[] {
  const ratio = newServings / recipe.servings;

  return recipe.ingredients.map((ing) => {
    const originalAmount = parseFloat(ing.amount) || 0;
    const scaledAmount = originalAmount * ratio;

    // Format nicely (avoid ugly decimals)
    let formattedAmount: string;
    if (scaledAmount === Math.floor(scaledAmount)) {
      formattedAmount = scaledAmount.toString();
    } else if (scaledAmount < 1) {
      // Convert to fractions for small amounts
      formattedAmount = toFraction(scaledAmount);
    } else {
      formattedAmount = scaledAmount.toFixed(1).replace(/\.0$/, '');
    }

    return {
      ...ing,
      amount: formattedAmount,
    };
  });
}

// Convert decimal to fraction string
function toFraction(decimal: number): string {
  const fractions: [number, string][] = [
    [0.125, '1/8'],
    [0.25, '1/4'],
    [0.333, '1/3'],
    [0.375, '3/8'],
    [0.5, '1/2'],
    [0.625, '5/8'],
    [0.666, '2/3'],
    [0.75, '3/4'],
    [0.875, '7/8'],
  ];

  for (const [value, fraction] of fractions) {
    if (Math.abs(decimal - value) < 0.05) {
      return fraction;
    }
  }

  return decimal.toFixed(2);
}

// Common ingredient substitutions
export const INGREDIENT_SUBSTITUTIONS: Record<string, { substitute: string; ratio: string; notes: string }[]> = {
  'butter': [
    { substitute: 'coconut oil', ratio: '1:1', notes: 'Use refined for neutral flavor' },
    { substitute: 'olive oil', ratio: '3/4 cup per 1 cup butter', notes: 'Best for savory dishes' },
    { substitute: 'applesauce', ratio: '1:1', notes: 'For baking, reduces fat' },
    { substitute: 'greek yogurt', ratio: '1/2 cup per 1 cup butter', notes: 'Adds moisture and protein' },
  ],
  'egg': [
    { substitute: 'flax egg (1 tbsp ground flax + 3 tbsp water)', ratio: '1:1', notes: 'Let sit 5 mins to gel' },
    { substitute: 'chia egg (1 tbsp chia + 3 tbsp water)', ratio: '1:1', notes: 'Works great in brownies' },
    { substitute: 'mashed banana', ratio: '1/4 cup per egg', notes: 'Adds sweetness' },
    { substitute: 'applesauce', ratio: '1/4 cup per egg', notes: 'Good for moist baked goods' },
  ],
  'milk': [
    { substitute: 'oat milk', ratio: '1:1', notes: 'Creamy, great for baking' },
    { substitute: 'almond milk', ratio: '1:1', notes: 'Light, slightly nutty' },
    { substitute: 'coconut milk', ratio: '1:1', notes: 'Rich, adds tropical flavor' },
    { substitute: 'soy milk', ratio: '1:1', notes: 'Most similar to dairy milk' },
  ],
  'heavy cream': [
    { substitute: 'coconut cream', ratio: '1:1', notes: 'Rich and creamy' },
    { substitute: 'cashew cream', ratio: '1:1', notes: 'Blend soaked cashews with water' },
    { substitute: 'evaporated milk', ratio: '1:1', notes: 'Less rich but works well' },
  ],
  'flour': [
    { substitute: 'almond flour', ratio: '1:1', notes: 'Gluten-free, adds nuttiness' },
    { substitute: 'oat flour', ratio: '1:1', notes: 'Make by blending oats' },
    { substitute: 'coconut flour', ratio: '1/4 cup per 1 cup flour', notes: 'Very absorbent, add more liquid' },
  ],
  'sugar': [
    { substitute: 'honey', ratio: '3/4 cup per 1 cup sugar', notes: 'Reduce liquid in recipe slightly' },
    { substitute: 'maple syrup', ratio: '3/4 cup per 1 cup sugar', notes: 'Reduce liquid, adds flavor' },
    { substitute: 'coconut sugar', ratio: '1:1', notes: 'Lower glycemic index' },
    { substitute: 'stevia', ratio: '1 tsp per 1 cup sugar', notes: 'Very concentrated' },
  ],
  'soy sauce': [
    { substitute: 'coconut aminos', ratio: '1:1', notes: 'Slightly sweeter, soy-free' },
    { substitute: 'tamari', ratio: '1:1', notes: 'Gluten-free soy sauce' },
    { substitute: 'worcestershire sauce', ratio: '1:1', notes: 'Different flavor profile' },
  ],
  'chicken broth': [
    { substitute: 'vegetable broth', ratio: '1:1', notes: 'Vegetarian option' },
    { substitute: 'mushroom broth', ratio: '1:1', notes: 'Rich umami flavor' },
    { substitute: 'water + bouillon', ratio: '1 cup water + 1 tsp bouillon', notes: 'Quick substitute' },
  ],
  'lemon juice': [
    { substitute: 'lime juice', ratio: '1:1', notes: 'Slightly different citrus flavor' },
    { substitute: 'white wine vinegar', ratio: '1/2 the amount', notes: 'More acidic' },
    { substitute: 'apple cider vinegar', ratio: '1/2 the amount', notes: 'Adds fruity acidity' },
  ],
  'garlic': [
    { substitute: 'garlic powder', ratio: '1/8 tsp per clove', notes: 'Less pungent' },
    { substitute: 'shallots', ratio: '1/2 shallot per clove', notes: 'Milder, sweeter' },
    { substitute: 'garlic-infused oil', ratio: '1/2 tsp per clove', notes: 'For garlic flavor without pieces' },
  ],
};

// Find substitutions for an ingredient
export function findSubstitutions(ingredient: string): { substitute: string; ratio: string; notes: string }[] {
  const lowerIngredient = ingredient.toLowerCase();

  for (const [key, subs] of Object.entries(INGREDIENT_SUBSTITUTIONS)) {
    if (lowerIngredient.includes(key)) {
      return subs;
    }
  }

  return [];
}

// Estimate nutritional info (rough estimates per serving)
export interface NutritionEstimate {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
}

// Very rough estimates based on common ingredients
const INGREDIENT_NUTRITION: Record<string, Partial<NutritionEstimate>> = {
  'chicken': { calories: 165, protein: 31, fat: 3.6 },
  'beef': { calories: 250, protein: 26, fat: 15 },
  'salmon': { calories: 208, protein: 20, fat: 13 },
  'rice': { calories: 130, carbs: 28, fiber: 0.4 },
  'pasta': { calories: 131, carbs: 25, protein: 5 },
  'potato': { calories: 77, carbs: 17, fiber: 2.2 },
  'egg': { calories: 78, protein: 6, fat: 5 },
  'butter': { calories: 102, fat: 12 },
  'oil': { calories: 120, fat: 14 },
  'cheese': { calories: 113, protein: 7, fat: 9 },
  'bread': { calories: 79, carbs: 15, protein: 3 },
  'vegetable': { calories: 25, carbs: 5, fiber: 2 },
  'fruit': { calories: 60, carbs: 15, fiber: 2 },
  'bean': { calories: 120, protein: 8, carbs: 21, fiber: 7 },
  'lentil': { calories: 115, protein: 9, carbs: 20, fiber: 8 },
  'tofu': { calories: 80, protein: 8, fat: 4 },
  'milk': { calories: 103, protein: 8, carbs: 12, fat: 2 },
  'cream': { calories: 340, fat: 36 },
  'sugar': { calories: 49, carbs: 13 },
  'flour': { calories: 110, carbs: 23, protein: 3 },
};

export function estimateNutrition(recipe: Recipe): NutritionEstimate {
  let total: NutritionEstimate = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };

  recipe.ingredients.forEach((ing) => {
    const ingLower = ing.name.toLowerCase();

    for (const [key, nutrition] of Object.entries(INGREDIENT_NUTRITION)) {
      if (ingLower.includes(key)) {
        const amount = parseFloat(ing.amount) || 1;
        const multiplier = amount * (ing.unit.includes('cup') ? 1 : 0.5);

        total.calories += (nutrition.calories || 0) * multiplier;
        total.protein += (nutrition.protein || 0) * multiplier;
        total.carbs += (nutrition.carbs || 0) * multiplier;
        total.fat += (nutrition.fat || 0) * multiplier;
        total.fiber += (nutrition.fiber || 0) * multiplier;
        break;
      }
    }
  });

  // Divide by servings
  const servings = recipe.servings || 1;
  return {
    calories: Math.round(total.calories / servings),
    protein: Math.round(total.protein / servings),
    carbs: Math.round(total.carbs / servings),
    fat: Math.round(total.fat / servings),
    fiber: Math.round(total.fiber / servings),
  };
}

// Cooking timer presets
export interface TimerPreset {
  name: string;
  duration: number; // seconds
  icon: string;
  category: string;
}

export const TIMER_PRESETS: TimerPreset[] = [
  // Eggs
  { name: 'Soft boiled egg', duration: 360, icon: '🥚', category: 'Eggs' },
  { name: 'Medium boiled egg', duration: 480, icon: '🥚', category: 'Eggs' },
  { name: 'Hard boiled egg', duration: 600, icon: '🥚', category: 'Eggs' },

  // Pasta
  { name: 'Al dente pasta', duration: 540, icon: '🍝', category: 'Pasta' },
  { name: 'Well-done pasta', duration: 660, icon: '🍝', category: 'Pasta' },

  // Rice
  { name: 'White rice', duration: 1080, icon: '🍚', category: 'Grains' },
  { name: 'Brown rice', duration: 2700, icon: '🍚', category: 'Grains' },

  // Proteins
  { name: 'Chicken breast (each side)', duration: 420, icon: '🍗', category: 'Protein' },
  { name: 'Steak medium-rare (each side)', duration: 240, icon: '🥩', category: 'Protein' },
  { name: 'Salmon fillet', duration: 480, icon: '🐟', category: 'Protein' },

  // Baking
  { name: 'Cookies', duration: 720, icon: '🍪', category: 'Baking' },
  { name: 'Brownies', duration: 1500, icon: '🍫', category: 'Baking' },
  { name: 'Cake', duration: 1800, icon: '🎂', category: 'Baking' },
  { name: 'Bread loaf', duration: 2400, icon: '🍞', category: 'Baking' },

  // Vegetables
  { name: 'Roasted vegetables', duration: 1800, icon: '🥕', category: 'Vegetables' },
  { name: 'Steamed broccoli', duration: 300, icon: '🥦', category: 'Vegetables' },
  { name: 'Baked potato', duration: 3600, icon: '🥔', category: 'Vegetables' },
];

// Convert unit helpers
export const UNIT_CONVERSIONS: Record<string, { to: string; factor: number }[]> = {
  'cup': [
    { to: 'ml', factor: 236.588 },
    { to: 'tbsp', factor: 16 },
    { to: 'tsp', factor: 48 },
  ],
  'tbsp': [
    { to: 'tsp', factor: 3 },
    { to: 'ml', factor: 14.787 },
    { to: 'cup', factor: 0.0625 },
  ],
  'tsp': [
    { to: 'ml', factor: 4.929 },
    { to: 'tbsp', factor: 0.333 },
  ],
  'oz': [
    { to: 'g', factor: 28.35 },
    { to: 'lb', factor: 0.0625 },
  ],
  'lb': [
    { to: 'g', factor: 453.592 },
    { to: 'kg', factor: 0.453592 },
    { to: 'oz', factor: 16 },
  ],
  'g': [
    { to: 'oz', factor: 0.035274 },
    { to: 'kg', factor: 0.001 },
  ],
};

export function convertUnit(amount: number, fromUnit: string, toUnit: string): number | null {
  const conversions = UNIT_CONVERSIONS[fromUnit.toLowerCase()];
  if (!conversions) return null;

  const conversion = conversions.find((c) => c.to === toUnit.toLowerCase());
  if (!conversion) return null;

  return amount * conversion.factor;
}

// Meal planning helper
export interface MealPlan {
  id: string;
  name: string;
  days: {
    day: string;
    meals: {
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      recipeId?: string;
      recipeName?: string;
      notes?: string;
    }[];
  }[];
  createdAt: number;
}

export function createMealPlan(name: string): MealPlan {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return {
    id: `plan-${Date.now()}`,
    name,
    days: days.map((day) => ({
      day,
      meals: [
        { type: 'breakfast' },
        { type: 'lunch' },
        { type: 'dinner' },
      ],
    })),
    createdAt: Date.now(),
  };
}

// Get shopping list from meal plan
export function getShoppingListFromMealPlan(mealPlan: MealPlan, recipes: Recipe[]): string[] {
  const ingredients = new Map<string, string>();

  mealPlan.days.forEach((day) => {
    day.meals.forEach((meal) => {
      if (meal.recipeId) {
        const recipe = recipes.find((r) => r.id === meal.recipeId);
        if (recipe) {
          recipe.ingredients.forEach((ing) => {
            const key = ing.name.toLowerCase();
            if (ingredients.has(key)) {
              // Try to combine amounts (simplified)
              const existing = ingredients.get(key)!;
              ingredients.set(key, `${existing} + ${ing.amount} ${ing.unit}`);
            } else {
              ingredients.set(key, `${ing.amount} ${ing.unit} ${ing.name}`);
            }
          });
        }
      }
    });
  });

  return Array.from(ingredients.values());
}
