import '../../shared/models/models.dart';

// --- Recipe Scaling ---

Recipe scaleRecipe(Recipe recipe, int newServings) {
  if (recipe.servings == newServings) return recipe;

  final factor = newServings / recipe.servings;

  final scaledIngredients = recipe.ingredients.map((ing) {
    final parsed = double.tryParse(ing.amount);
    if (parsed == null) return ing;

    final scaled = parsed * factor;
    final formatted = scaled < 1
        ? _toFraction(scaled)
        : scaled == scaled.roundToDouble()
            ? scaled.toInt().toString()
            : scaled.toStringAsFixed(1);

    return ing.copyWith(amount: formatted);
  }).toList();

  return recipe.copyWith(
    servings: newServings,
    ingredients: scaledIngredients,
  );
}

String _toFraction(double val) {
  if ((val - 0.25).abs() < 0.05) return '1/4';
  if ((val - 0.33).abs() < 0.05) return '1/3';
  if ((val - 0.5).abs() < 0.05) return '1/2';
  if ((val - 0.67).abs() < 0.05) return '2/3';
  if ((val - 0.75).abs() < 0.05) return '3/4';
  return val.toStringAsFixed(2);
}

// --- Ingredient Substitutions ---

class Substitution {
  final String name;
  final String ratio;
  final String notes;

  const Substitution({
    required this.name,
    required this.ratio,
    required this.notes,
  });
}

const ingredientSubstitutions = <String, List<Substitution>>{
  'butter': [
    Substitution(name: 'Coconut Oil', ratio: '1:1', notes: 'Same amount, solid form'),
    Substitution(name: 'Olive Oil', ratio: '3/4 cup per 1 cup', notes: 'Best for savory'),
    Substitution(name: 'Applesauce', ratio: '1:1', notes: 'For baking, reduces fat'),
    Substitution(name: 'Greek Yogurt', ratio: '1:1', notes: 'Adds moisture and tang'),
  ],
  'egg': [
    Substitution(name: 'Flax Egg', ratio: '1 tbsp ground flax + 3 tbsp water', notes: 'Let sit 5 min'),
    Substitution(name: 'Chia Egg', ratio: '1 tbsp chia + 3 tbsp water', notes: 'Let sit 5 min'),
    Substitution(name: 'Mashed Banana', ratio: '1/4 cup per egg', notes: 'Adds sweetness'),
    Substitution(name: 'Applesauce', ratio: '1/4 cup per egg', notes: 'Neutral flavor'),
  ],
  'milk': [
    Substitution(name: 'Oat Milk', ratio: '1:1', notes: 'Creamy, neutral'),
    Substitution(name: 'Almond Milk', ratio: '1:1', notes: 'Lighter, nutty'),
    Substitution(name: 'Coconut Milk', ratio: '1:1', notes: 'Rich, sweet'),
    Substitution(name: 'Soy Milk', ratio: '1:1', notes: 'High protein'),
  ],
  'heavy cream': [
    Substitution(name: 'Coconut Cream', ratio: '1:1', notes: 'Thick and rich'),
    Substitution(name: 'Cashew Cream', ratio: '1:1', notes: 'Blend soaked cashews'),
    Substitution(name: 'Evaporated Milk', ratio: '1:1', notes: 'Lower fat'),
  ],
  'flour': [
    Substitution(name: 'Almond Flour', ratio: '1:1', notes: 'Gluten-free, nutty'),
    Substitution(name: 'Oat Flour', ratio: '1:1', notes: 'Blend rolled oats'),
    Substitution(name: 'Coconut Flour', ratio: '1/4 cup per 1 cup', notes: 'Very absorbent'),
  ],
  'sugar': [
    Substitution(name: 'Honey', ratio: '3/4 cup per 1 cup', notes: 'Reduce other liquids'),
    Substitution(name: 'Maple Syrup', ratio: '3/4 cup per 1 cup', notes: 'Distinct flavor'),
    Substitution(name: 'Coconut Sugar', ratio: '1:1', notes: 'Lower glycemic'),
    Substitution(name: 'Stevia', ratio: '1 tsp per 1 cup', notes: 'Very concentrated'),
  ],
  'soy sauce': [
    Substitution(name: 'Coconut Aminos', ratio: '1:1', notes: 'Soy-free, sweeter'),
    Substitution(name: 'Tamari', ratio: '1:1', notes: 'Gluten-free soy sauce'),
    Substitution(name: 'Worcestershire', ratio: '1:1', notes: 'Different flavor profile'),
  ],
  'chicken broth': [
    Substitution(name: 'Vegetable Broth', ratio: '1:1', notes: 'Vegetarian option'),
    Substitution(name: 'Mushroom Broth', ratio: '1:1', notes: 'Rich umami'),
    Substitution(name: 'Bouillon + Water', ratio: '1 cube per cup', notes: 'Quick option'),
  ],
  'lemon juice': [
    Substitution(name: 'Lime Juice', ratio: '1:1', notes: 'Similar acidity'),
    Substitution(name: 'White Wine Vinegar', ratio: '1/2 amount', notes: 'Stronger acid'),
    Substitution(name: 'Apple Cider Vinegar', ratio: '1/2 amount', notes: 'Fruity tang'),
  ],
  'garlic': [
    Substitution(name: 'Garlic Powder', ratio: '1/4 tsp per clove', notes: 'Less pungent'),
    Substitution(name: 'Shallots', ratio: '1 shallot per 3 cloves', notes: 'Milder'),
    Substitution(name: 'Garlic-infused Oil', ratio: '1/2 tsp per clove', notes: 'Low-FODMAP'),
  ],
};

List<Substitution> findSubstitutions(String ingredient) {
  final lower = ingredient.toLowerCase();
  for (final entry in ingredientSubstitutions.entries) {
    if (lower.contains(entry.key)) return entry.value;
  }
  return [];
}

// --- Nutrition Estimation ---

const _nutritionPerUnit = <String, NutritionEstimate>{
  'chicken': NutritionEstimate(calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0),
  'beef': NutritionEstimate(calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0),
  'rice': NutritionEstimate(calories: 206, protein: 4, carbs: 45, fat: 0, fiber: 1),
  'pasta': NutritionEstimate(calories: 220, protein: 8, carbs: 43, fat: 1, fiber: 3),
  'egg': NutritionEstimate(calories: 72, protein: 6, carbs: 0, fat: 5, fiber: 0),
  'butter': NutritionEstimate(calories: 102, protein: 0, carbs: 0, fat: 12, fiber: 0),
  'oil': NutritionEstimate(calories: 120, protein: 0, carbs: 0, fat: 14, fiber: 0),
  'cheese': NutritionEstimate(calories: 113, protein: 7, carbs: 0, fat: 9, fiber: 0),
  'milk': NutritionEstimate(calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0),
  'cream': NutritionEstimate(calories: 340, protein: 3, carbs: 3, fat: 36, fiber: 0),
  'vegetable': NutritionEstimate(calories: 50, protein: 2, carbs: 10, fat: 0, fiber: 3),
  'fruit': NutritionEstimate(calories: 60, protein: 1, carbs: 15, fat: 0, fiber: 2),
  'bean': NutritionEstimate(calories: 120, protein: 8, carbs: 22, fat: 0, fiber: 6),
  'bread': NutritionEstimate(calories: 79, protein: 3, carbs: 15, fat: 1, fiber: 1),
};

NutritionEstimate estimateNutrition(Recipe recipe) {
  int totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0, totalFib = 0;

  for (final ing in recipe.ingredients) {
    final lower = ing.name.toLowerCase();
    for (final entry in _nutritionPerUnit.entries) {
      if (lower.contains(entry.key)) {
        final multiplier = _unitMultiplier(ing.unit);
        totalCal += (entry.value.calories * multiplier).round();
        totalPro += (entry.value.protein * multiplier).round();
        totalCarb += (entry.value.carbs * multiplier).round();
        totalFat += (entry.value.fat * multiplier).round();
        totalFib += (entry.value.fiber * multiplier).round();
        break;
      }
    }
  }

  final servings = recipe.servings > 0 ? recipe.servings : 1;
  return NutritionEstimate(
    calories: totalCal ~/ servings,
    protein: totalPro ~/ servings,
    carbs: totalCarb ~/ servings,
    fat: totalFat ~/ servings,
    fiber: totalFib ~/ servings,
  );
}

double _unitMultiplier(String unit) {
  final lower = unit.toLowerCase();
  if (lower.contains('cup')) return 1.0;
  if (lower.contains('tbsp')) return 0.25;
  if (lower.contains('tsp')) return 0.1;
  return 0.5;
}

// --- Timer Presets ---

class TimerPreset {
  final String name;
  final String category;
  final int minutes;

  const TimerPreset({
    required this.name,
    required this.category,
    required this.minutes,
  });
}

const timerPresets = <TimerPreset>[
  // Eggs
  TimerPreset(name: 'Soft Boiled Egg', category: 'Eggs', minutes: 6),
  TimerPreset(name: 'Medium Boiled Egg', category: 'Eggs', minutes: 8),
  TimerPreset(name: 'Hard Boiled Egg', category: 'Eggs', minutes: 10),
  // Pasta
  TimerPreset(name: 'Pasta Al Dente', category: 'Pasta', minutes: 9),
  TimerPreset(name: 'Pasta Well Done', category: 'Pasta', minutes: 11),
  // Grains
  TimerPreset(name: 'White Rice', category: 'Grains', minutes: 18),
  TimerPreset(name: 'Brown Rice', category: 'Grains', minutes: 45),
  // Proteins
  TimerPreset(name: 'Chicken Breast', category: 'Proteins', minutes: 8),
  TimerPreset(name: 'Steak (Medium)', category: 'Proteins', minutes: 4),
  TimerPreset(name: 'Salmon Fillet', category: 'Proteins', minutes: 5),
  // Baking
  TimerPreset(name: 'Cookies', category: 'Baking', minutes: 12),
  TimerPreset(name: 'Brownies', category: 'Baking', minutes: 25),
  TimerPreset(name: 'Cake', category: 'Baking', minutes: 30),
  TimerPreset(name: 'Bread', category: 'Baking', minutes: 40),
  // Vegetables
  TimerPreset(name: 'Roasted Vegetables', category: 'Vegetables', minutes: 25),
  TimerPreset(name: 'Steamed Vegetables', category: 'Vegetables', minutes: 5),
];

// --- Unit Conversions ---

class UnitConversion {
  final String from;
  final String to;
  final double factor;

  const UnitConversion({
    required this.from,
    required this.to,
    required this.factor,
  });
}

const unitConversions = <UnitConversion>[
  UnitConversion(from: 'cup', to: 'ml', factor: 236.588),
  UnitConversion(from: 'cup', to: 'tbsp', factor: 16),
  UnitConversion(from: 'cup', to: 'tsp', factor: 48),
  UnitConversion(from: 'tbsp', to: 'tsp', factor: 3),
  UnitConversion(from: 'tbsp', to: 'ml', factor: 14.787),
  UnitConversion(from: 'tsp', to: 'ml', factor: 4.929),
  UnitConversion(from: 'oz', to: 'g', factor: 28.3495),
  UnitConversion(from: 'lb', to: 'g', factor: 453.592),
  UnitConversion(from: 'lb', to: 'kg', factor: 0.4536),
  UnitConversion(from: 'oz', to: 'ml', factor: 29.5735),
];

double? convertUnit(double value, String from, String to) {
  if (from == to) return value;

  for (final c in unitConversions) {
    if (c.from == from && c.to == to) return value * c.factor;
    if (c.from == to && c.to == from) return value / c.factor;
  }
  return null;
}

// --- Meal Plan Helpers ---

MealPlan createEmptyMealPlan() {
  final now = DateTime.now();
  final monday = now.subtract(Duration(days: now.weekday - 1));

  final days = List.generate(7, (i) {
    final date = monday.add(Duration(days: i));
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return MealDay(
      dayName: dayNames[i],
      date: date,
      meals: [
        const MealSlot(type: MealType.breakfast),
        const MealSlot(type: MealType.lunch),
        const MealSlot(type: MealType.dinner),
        const MealSlot(type: MealType.snack),
      ],
    );
  });

  return MealPlan(days: days);
}

List<Ingredient> getShoppingListFromMealPlan(MealPlan plan) {
  final ingredients = <Ingredient>[];
  for (final day in plan.days) {
    for (final slot in day.meals) {
      if (slot.recipe != null) {
        ingredients.addAll(slot.recipe!.ingredients);
      }
    }
  }
  return ingredients;
}

// Health goal daily calorie targets
const healthGoalCalories = <HealthGoal, int>{
  HealthGoal.weightLoss: 1500,
  HealthGoal.muscleBuilding: 2500,
  HealthGoal.balanced: 2000,
  HealthGoal.lowCarb: 1800,
  HealthGoal.heartHealthy: 1800,
};
