'use client';

import { useState } from 'react';
import { Recipe, WORLD_REGIONS } from '@/types';
import { estimateNutrition, NutritionEstimate } from '@/lib/cooking-helpers';

interface MealPlannerProps {
  savedRecipes: Recipe[];
  isOpen: boolean;
  onClose: () => void;
  onAddToShoppingList: (recipes: Recipe[]) => void;
}

interface DayPlan {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
  snack: Recipe | null;
}

interface WeekPlan {
  [key: string]: DayPlan;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

// Health goals
interface HealthGoal {
  id: string;
  name: string;
  icon: string;
  description: string;
  dailyTargets: Partial<NutritionEstimate>;
}

const HEALTH_GOALS: HealthGoal[] = [
  {
    id: 'weight-loss',
    name: 'Weight Loss',
    icon: '🏃',
    description: 'Lower calories, high protein',
    dailyTargets: { calories: 1500, protein: 100, carbs: 150, fat: 50, fiber: 30 },
  },
  {
    id: 'muscle-gain',
    name: 'Muscle Building',
    icon: '💪',
    description: 'High protein, moderate carbs',
    dailyTargets: { calories: 2500, protein: 150, carbs: 300, fat: 80, fiber: 35 },
  },
  {
    id: 'balanced',
    name: 'Balanced Diet',
    icon: '⚖️',
    description: 'Well-rounded nutrition',
    dailyTargets: { calories: 2000, protein: 75, carbs: 250, fat: 65, fiber: 28 },
  },
  {
    id: 'low-carb',
    name: 'Low Carb',
    icon: '🥑',
    description: 'Keto-friendly, high fat',
    dailyTargets: { calories: 1800, protein: 100, carbs: 50, fat: 140, fiber: 20 },
  },
  {
    id: 'heart-healthy',
    name: 'Heart Healthy',
    icon: '❤️',
    description: 'Low fat, high fiber',
    dailyTargets: { calories: 1800, protein: 80, carbs: 250, fat: 45, fiber: 35 },
  },
];

// Meal prep tips
const MEAL_PREP_TIPS = [
  {
    icon: '📅',
    title: 'Plan Ahead',
    tip: 'Set aside 2-3 hours on Sunday for meal prep. Plan your menu and grocery list in advance.',
  },
  {
    icon: '🥡',
    title: 'Batch Cook Proteins',
    tip: 'Cook large batches of chicken, beef, or tofu that can be used in multiple meals throughout the week.',
  },
  {
    icon: '🥗',
    title: 'Prep Vegetables',
    tip: 'Wash, chop, and store vegetables in containers. They\'ll last 4-5 days in the fridge.',
  },
  {
    icon: '🍚',
    title: 'Cook Grains in Bulk',
    tip: 'Rice, quinoa, and pasta can be cooked ahead and reheated easily.',
  },
  {
    icon: '❄️',
    title: 'Freeze Smartly',
    tip: 'Many meals freeze well for 2-3 months. Label with date and contents.',
  },
  {
    icon: '🧊',
    title: 'Use Proper Containers',
    tip: 'Glass containers are microwave-safe and don\'t absorb odors.',
  },
];

export default function MealPlanner({
  savedRecipes,
  isOpen,
  onClose,
  onAddToShoppingList,
}: MealPlannerProps) {
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(() => {
    const initial: WeekPlan = {};
    DAYS.forEach((day) => {
      initial[day] = { breakfast: null, lunch: null, dinner: null, snack: null };
    });
    return initial;
  });
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal>(HEALTH_GOALS[2]);
  const [activeTab, setActiveTab] = useState<'plan' | 'nutrition' | 'tips'>('plan');
  const [selectingFor, setSelectingFor] = useState<{ day: string; meal: typeof MEAL_TYPES[number] } | null>(null);

  // Calculate daily nutrition for a day
  const getDayNutrition = (day: string): NutritionEstimate => {
    const dayPlan = weekPlan[day];
    const totals: NutritionEstimate = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    MEAL_TYPES.forEach((mealType) => {
      const recipe = dayPlan[mealType];
      if (recipe) {
        const nutrition = estimateNutrition(recipe);
        totals.calories += nutrition.calories;
        totals.protein += nutrition.protein;
        totals.carbs += nutrition.carbs;
        totals.fat += nutrition.fat;
        totals.fiber += nutrition.fiber;
      }
    });

    return totals;
  };

  // Calculate week totals
  const getWeekNutrition = (): NutritionEstimate => {
    const totals: NutritionEstimate = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    DAYS.forEach((day) => {
      const dayNutrition = getDayNutrition(day);
      totals.calories += dayNutrition.calories;
      totals.protein += dayNutrition.protein;
      totals.carbs += dayNutrition.carbs;
      totals.fat += dayNutrition.fat;
      totals.fiber += dayNutrition.fiber;
    });

    return totals;
  };

  // Get progress percentage
  const getProgress = (current: number, target: number): number => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  // Add recipe to meal plan
  const assignRecipe = (recipe: Recipe) => {
    if (!selectingFor) return;

    setWeekPlan((prev) => ({
      ...prev,
      [selectingFor.day]: {
        ...prev[selectingFor.day],
        [selectingFor.meal]: recipe,
      },
    }));
    setSelectingFor(null);
  };

  // Remove recipe from meal plan
  const removeRecipe = (day: string, meal: typeof MEAL_TYPES[number]) => {
    setWeekPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: null,
      },
    }));
  };

  // Generate shopping list from all planned recipes
  const generateShoppingList = () => {
    const recipes: Recipe[] = [];
    DAYS.forEach((day) => {
      MEAL_TYPES.forEach((mealType) => {
        const recipe = weekPlan[day][mealType];
        if (recipe && !recipes.some((r) => r.id === recipe.id)) {
          recipes.push(recipe);
        }
      });
    });
    if (recipes.length > 0) {
      onAddToShoppingList(recipes);
    }
  };

  // Clear all meals
  const clearPlan = () => {
    const initial: WeekPlan = {};
    DAYS.forEach((day) => {
      initial[day] = { breakfast: null, lunch: null, dinner: null, snack: null };
    });
    setWeekPlan(initial);
  };

  // Get meal icon
  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-card rounded-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="font-bold text-lg">Meal Planner & Prep</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateShoppingList}
              className="px-3 py-1.5 text-sm bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors"
            >
              🛒 Generate List
            </button>
            <button
              onClick={clearPlan}
              className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-primary/10 transition-colors"
            >
              Clear Plan
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Health Goal Selector */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-muted flex-shrink-0">Health Goal:</span>
            {HEALTH_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  selectedGoal.id === goal.id
                    ? 'bg-primary text-white'
                    : 'bg-background hover:bg-primary/10'
                }`}
              >
                <span>{goal.icon}</span>
                <span className="text-sm font-medium">{goal.name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            {selectedGoal.icon} {selectedGoal.description} - Target: {selectedGoal.dailyTargets.calories} cal/day
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'plan', label: 'Weekly Plan', icon: '📅' },
            { id: 'nutrition', label: 'Nutrition Overview', icon: '📊' },
            { id: 'tips', label: 'Meal Prep Tips', icon: '💡' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Weekly Plan Tab */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              {selectingFor ? (
                // Recipe selection mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      Select recipe for {selectingFor.day} - {selectingFor.meal}
                    </h3>
                    <button
                      onClick={() => setSelectingFor(null)}
                      className="text-sm text-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>

                  {savedRecipes.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                      <span className="text-4xl mb-4 block">📚</span>
                      <p>No saved recipes yet</p>
                      <p className="text-sm mt-1">Save recipes from the chat to add them here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {savedRecipes.map((recipe) => {
                        const regionInfo = WORLD_REGIONS.find((r) => r.id === recipe.region);
                        return (
                          <button
                            key={recipe.id}
                            onClick={() => assignRecipe(recipe)}
                            className="p-3 bg-background rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span>{regionInfo?.flag || '🍽️'}</span>
                              <span className="text-xs text-muted">{recipe.cuisine}</span>
                            </div>
                            <h4 className="font-medium text-sm">{recipe.name}</h4>
                            <div className="flex gap-2 mt-2 text-xs text-muted">
                              <span>⏱️ {recipe.prepTime}</span>
                              <span>•</span>
                              <span>{estimateNutrition(recipe).calories} cal</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                // Week overview
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-8 gap-2 text-sm">
                      {/* Header */}
                      <div className="font-medium text-muted p-2">Meal</div>
                      {DAYS.map((day) => (
                        <div key={day} className="font-medium text-center p-2">
                          {day.slice(0, 3)}
                        </div>
                      ))}

                      {/* Meal rows */}
                      {MEAL_TYPES.map((meal) => (
                        <>
                          <div key={`${meal}-label`} className="flex items-center gap-1 p-2 text-muted capitalize">
                            <span>{getMealIcon(meal)}</span>
                            <span>{meal}</span>
                          </div>
                          {DAYS.map((day) => {
                            const recipe = weekPlan[day][meal];
                            return (
                              <div
                                key={`${day}-${meal}`}
                                className="p-1"
                              >
                                {recipe ? (
                                  <div className="group relative p-2 bg-primary/10 rounded-lg text-xs">
                                    <p className="font-medium truncate">{recipe.name}</p>
                                    <p className="text-muted">{estimateNutrition(recipe).calories} cal</p>
                                    <button
                                      onClick={() => removeRecipe(day, meal)}
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded transition-opacity"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setSelectingFor({ day, meal })}
                                    className="w-full h-full min-h-[60px] border border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center"
                                  >
                                    <span className="text-muted text-xs">+ Add</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </>
                      ))}

                      {/* Daily totals */}
                      <div className="font-medium text-muted p-2 border-t border-border">Total</div>
                      {DAYS.map((day) => {
                        const nutrition = getDayNutrition(day);
                        const calorieProgress = getProgress(nutrition.calories, selectedGoal.dailyTargets.calories || 2000);
                        return (
                          <div key={`${day}-total`} className="p-2 text-center border-t border-border">
                            <div className={`font-bold ${
                              calorieProgress > 100 ? 'text-red-500' :
                              calorieProgress > 80 ? 'text-green-500' :
                              'text-muted'
                            }`}>
                              {nutrition.calories} cal
                            </div>
                            <div className="w-full h-1 bg-background rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  calorieProgress > 100 ? 'bg-red-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, calorieProgress)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nutrition Overview Tab */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6">
              {/* Weekly summary */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-4">Weekly Nutrition Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[
                    { label: 'Avg Calories', value: Math.round(getWeekNutrition().calories / 7), target: selectedGoal.dailyTargets.calories, unit: 'kcal', color: 'bg-red-500' },
                    { label: 'Avg Protein', value: Math.round(getWeekNutrition().protein / 7), target: selectedGoal.dailyTargets.protein, unit: 'g', color: 'bg-blue-500' },
                    { label: 'Avg Carbs', value: Math.round(getWeekNutrition().carbs / 7), target: selectedGoal.dailyTargets.carbs, unit: 'g', color: 'bg-yellow-500' },
                    { label: 'Avg Fat', value: Math.round(getWeekNutrition().fat / 7), target: selectedGoal.dailyTargets.fat, unit: 'g', color: 'bg-purple-500' },
                    { label: 'Avg Fiber', value: Math.round(getWeekNutrition().fiber / 7), target: selectedGoal.dailyTargets.fiber, unit: 'g', color: 'bg-green-500' },
                  ].map((item) => {
                    const progress = getProgress(item.value, item.target || 100);
                    return (
                      <div key={item.label} className="bg-card rounded-xl p-4">
                        <div className={`w-3 h-3 ${item.color} rounded-full mb-2`} />
                        <div className="text-2xl font-bold">{item.value}</div>
                        <div className="text-xs text-muted">{item.unit} / {item.target}</div>
                        <div className="text-sm font-medium mt-1">{item.label}</div>
                        <div className="w-full h-2 bg-background rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full ${item.color} transition-all`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted mt-1">{progress}% of goal</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily breakdown */}
              <div className="space-y-3">
                <h3 className="font-medium">Daily Breakdown</h3>
                {DAYS.map((day) => {
                  const nutrition = getDayNutrition(day);
                  const calorieProgress = getProgress(nutrition.calories, selectedGoal.dailyTargets.calories || 2000);
                  const hasPlannedMeals = MEAL_TYPES.some((m) => weekPlan[day][m] !== null);

                  return (
                    <div key={day} className="flex items-center gap-4 p-3 bg-background rounded-lg">
                      <div className="w-20 font-medium">{day}</div>
                      {hasPlannedMeals ? (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm mb-1">
                              <span className="font-medium">{nutrition.calories} cal</span>
                              <span className="text-muted">•</span>
                              <span>{nutrition.protein}g protein</span>
                              <span className="text-muted">•</span>
                              <span>{nutrition.carbs}g carbs</span>
                              <span className="text-muted">•</span>
                              <span>{nutrition.fat}g fat</span>
                            </div>
                            <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  calorieProgress > 100 ? 'bg-red-500' :
                                  calorieProgress > 80 ? 'bg-green-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ width: `${Math.min(100, calorieProgress)}%` }}
                              />
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${
                            calorieProgress > 100 ? 'text-red-500' :
                            calorieProgress > 80 ? 'text-green-500' :
                            'text-yellow-500'
                          }`}>
                            {calorieProgress}%
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 text-muted text-sm">No meals planned</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meal Prep Tips Tab */}
          {activeTab === 'tips' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MEAL_PREP_TIPS.map((tip, index) => (
                  <div key={index} className="p-4 bg-background rounded-xl">
                    <div className="text-3xl mb-3">{tip.icon}</div>
                    <h4 className="font-bold mb-2">{tip.title}</h4>
                    <p className="text-sm text-muted">{tip.tip}</p>
                  </div>
                ))}
              </div>

              {/* Storage guide */}
              <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl p-6">
                <h3 className="font-bold mb-4">📦 Food Storage Guide</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">🥶 Refrigerator (3-5 days)</h4>
                    <ul className="space-y-1 text-muted">
                      <li>• Cooked proteins</li>
                      <li>• Cooked grains</li>
                      <li>• Cut vegetables</li>
                      <li>• Salad dressings</li>
                      <li>• Soups and stews</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">❄️ Freezer (2-3 months)</h4>
                    <ul className="space-y-1 text-muted">
                      <li>• Marinated raw meats</li>
                      <li>• Cooked casseroles</li>
                      <li>• Smoothie packs</li>
                      <li>• Bread and baked goods</li>
                      <li>• Sauces and stocks</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">🚫 Don't Freeze</h4>
                    <ul className="space-y-1 text-muted">
                      <li>• Mayonnaise-based salads</li>
                      <li>• Cream-based sauces</li>
                      <li>• Fried foods (get soggy)</li>
                      <li>• Cucumber/lettuce</li>
                      <li>• Cooked pasta (alone)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Prep schedule */}
              <div className="bg-background rounded-xl p-6">
                <h3 className="font-bold mb-4">⏰ Sample Prep Schedule</h3>
                <div className="space-y-3">
                  {[
                    { time: '0:00 - 0:15', task: 'Preheat oven, gather containers and ingredients' },
                    { time: '0:15 - 0:45', task: 'Start cooking proteins (chicken, beef, tofu)' },
                    { time: '0:15 - 0:30', task: 'Cook grains (rice, quinoa) while protein cooks' },
                    { time: '0:30 - 1:00', task: 'Wash and chop all vegetables' },
                    { time: '1:00 - 1:30', task: 'Roast vegetables, prep sauces/dressings' },
                    { time: '1:30 - 2:00', task: 'Let food cool, portion into containers' },
                    { time: '2:00 - 2:15', task: 'Label containers, clean up' },
                  ].map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-24 text-sm font-medium text-primary">{step.time}</div>
                      <div className="flex-1 text-sm">{step.task}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
