import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/meal_plan_provider.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../core/theme/app_colors.dart';
import '../../../features/saved_recipes/domain/saved_recipes_provider.dart';
import '../../../features/profile/domain/profile_provider.dart';
import '../../../features/pantry/domain/todos_provider.dart';

class MealPlannerScreen extends ConsumerWidget {
  const MealPlannerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileProvider);

    if (!profileState.isPremium) {
      return const _PaywallPrompt();
    }

    return const _MealPlannerContent();
  }
}

// ---------------------------------------------------------------------------
// Paywall prompt (non-premium)
// ---------------------------------------------------------------------------

class _PaywallPrompt extends StatelessWidget {
  const _PaywallPrompt();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Meal Planner'), centerTitle: false),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.calendar_month_outlined,
                  size: 72, color: AppColors.primary),
              const SizedBox(height: 16),
              const Text(
                'Meal Planning is Premium',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Plan your entire week, track nutrition goals, and auto-generate your shopping list with a Premium subscription.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
              ),
              const SizedBox(height: 24),
              GradientButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => const _PaywallScreenRoute(),
                    ),
                  );
                },
                child: const Text('Unlock Premium — \$4.99/mo'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Thin wrapper so we don't introduce a circular import with paywall_screen.dart
class _PaywallScreenRoute extends StatelessWidget {
  const _PaywallScreenRoute();

  @override
  Widget build(BuildContext context) {
    // Defer to the real paywall screen built in subscription/
    return Scaffold(
      appBar:
          AppBar(title: const Text('Go Premium'), centerTitle: false),
      body: const Center(child: Text('Loading paywall...')),
    );
  }
}

// ---------------------------------------------------------------------------
// Main planner content
// ---------------------------------------------------------------------------

class _MealPlannerContent extends ConsumerStatefulWidget {
  const _MealPlannerContent();

  @override
  ConsumerState<_MealPlannerContent> createState() =>
      _MealPlannerContentState();
}

class _MealPlannerContentState
    extends ConsumerState<_MealPlannerContent> {
  int _selectedDayIndex = 0;

  static const _goalLabels = {
    HealthGoal.weightLoss: ('Weight Loss', '1500 kcal/day', '🏃'),
    HealthGoal.muscleBuilding: ('Muscle Building', '2500 kcal/day', '💪'),
    HealthGoal.balanced: ('Balanced', '2000 kcal/day', '⚖️'),
    HealthGoal.lowCarb: ('Low Carb', '1800 kcal/day', '🥗'),
    HealthGoal.heartHealthy: ('Heart Healthy', '1800 kcal/day', '❤️'),
  };

  @override
  Widget build(BuildContext context) {
    final plan = ref.watch(mealPlanProvider);
    final notifier = ref.read(mealPlanProvider.notifier);
    final targetCal = ref.watch(mealPlanCalorieGoalProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meal Planner'),
        centerTitle: false,
        elevation: 0,
        actions: [
          TextButton.icon(
            onPressed: () {
              showDialog(
                context: context,
                builder: (_) => AlertDialog(
                  title: const Text('Reset Week?'),
                  content: const Text(
                      'This will clear all meal slots for the week.'),
                  actions: [
                    TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel')),
                    TextButton(
                      onPressed: () {
                        notifier.resetWeek();
                        Navigator.pop(context);
                      },
                      child: const Text('Reset'),
                    ),
                  ],
                ),
              );
            },
            icon: const Icon(Icons.refresh, size: 16),
            label: const Text('Reset'),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _generateShoppingList(context, ref, notifier),
        icon: const Icon(Icons.shopping_cart_outlined),
        label: const Text('Shopping List'),
        backgroundColor: AppColors.primary,
      ),
      body: ListView(
        children: [
          // Health goal selector
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Health Goal',
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 44,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: HealthGoal.values.map((g) {
                      final info = _goalLabels[g]!;
                      final isSelected = plan.goal == g;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(
                            '${info.$3} ${info.$1}',
                            style: const TextStyle(fontSize: 12),
                          ),
                          selected: isSelected,
                          onSelected: (_) => notifier.setGoal(g),
                          materialTapTargetSize:
                              MaterialTapTargetSize.shrinkWrap,
                          visualDensity: VisualDensity.compact,
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Target: $targetCal kcal/day',
                  style: const TextStyle(
                      fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          const Divider(height: 20),

          // Day selector (horizontal)
          Padding(
            padding: const EdgeInsets.only(left: 16, bottom: 4),
            child: const Text(
              'This Week',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary),
            ),
          ),
          SizedBox(
            height: 64,
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: plan.days.length,
              itemBuilder: (_, i) {
                final day = plan.days[i];
                final filledCount =
                    day.meals.where((s) => s.recipe != null).length;
                final isSelected = i == _selectedDayIndex;
                return GestureDetector(
                  onTap: () => setState(() => _selectedDayIndex = i),
                  child: Container(
                    width: 64,
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.primary.withOpacity(0.07),
                      borderRadius: BorderRadius.circular(12),
                      border: isSelected
                          ? null
                          : Border.all(
                              color: AppColors.primary.withOpacity(0.2)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          day.dayName.substring(0, 3),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isSelected
                                ? Colors.white
                                : AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${day.date.day}',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: isSelected
                                ? Colors.white
                                : AppColors.textPrimary,
                          ),
                        ),
                        if (filledCount > 0)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(
                              filledCount.clamp(0, 4),
                              (_) => Container(
                                width: 4,
                                height: 4,
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 1),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? Colors.white70
                                      : AppColors.primary,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),

          // Meal slots for selected day
          if (plan.days.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _DayMealSlots(
                day: plan.days[_selectedDayIndex],
                dayIndex: _selectedDayIndex,
                notifier: notifier,
                ref: ref,
              ),
            ),
          const Divider(height: 24),

          // Weekly nutrition summary
          _WeeklyNutritionSummary(plan: plan, targetCal: targetCal),
          const SizedBox(height: 16),

          // Meal prep tips
          const _MealPrepTips(),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  void _generateShoppingList(
    BuildContext context,
    WidgetRef ref,
    MealPlanNotifier notifier,
  ) {
    final ingredients = notifier.generateShoppingList();
    if (ingredients.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No meals planned yet. Add recipes to your week first.'),
        ),
      );
      return;
    }

    // Use a dummy recipe container to batch-add ingredients
    final dummyRecipe = Recipe(
      name: 'Meal Plan',
      region: '',
      cuisine: '',
      description: '',
      prepTime: '',
      cookTime: '',
      servings: 1,
      difficulty: '',
      ingredients: ingredients,
      instructions: [],
    );
    ref.read(todosProvider.notifier).addIngredientsFromRecipe(
          dummyRecipe,
          ingredients,
        );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            '${ingredients.length} ingredients added to your shopping list'),
        backgroundColor: AppColors.success,
        duration: const Duration(seconds: 3),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Day meal slots
// ---------------------------------------------------------------------------

class _DayMealSlots extends StatelessWidget {
  const _DayMealSlots({
    required this.day,
    required this.dayIndex,
    required this.notifier,
    required this.ref,
  });

  final MealDay day;
  final int dayIndex;
  final MealPlanNotifier notifier;
  final WidgetRef ref;

  static const _mealLabels = {
    MealType.breakfast: 'Breakfast',
    MealType.lunch: 'Lunch',
    MealType.dinner: 'Dinner',
    MealType.snack: 'Snack',
  };

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          day.dayName,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 12),
        ...day.meals.map((slot) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: _MealSlotTile(
              slot: slot,
              onTap: () => _pickRecipe(context, slot.type),
              onRemove: () => notifier.removeRecipe(dayIndex, slot.type),
            ),
          );
        }),
      ],
    );
  }

  void _pickRecipe(BuildContext context, MealType type) {
    final recipes = ref.read(savedRecipesProvider).recipes;

    if (recipes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Save some recipes first to add them to your meal plan.'),
        ),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        return Column(
          children: [
            const SizedBox(height: 12),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Pick a Recipe for ${_mealLabels[type]}',
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: recipes.length,
                itemBuilder: (_, i) {
                  final r = recipes[i];
                  return ListTile(
                    title: Text(r.name),
                    subtitle: Text('${r.cuisine} · ${r.difficulty}'),
                    onTap: () {
                      notifier.addRecipeToSlot(dayIndex, type, r);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

class _MealSlotTile extends StatelessWidget {
  const _MealSlotTile({
    required this.slot,
    required this.onTap,
    required this.onRemove,
  });

  final MealSlot slot;
  final VoidCallback onTap;
  final VoidCallback onRemove;

  static const _mealIcons = {
    MealType.breakfast: '🌅',
    MealType.lunch: '☀️',
    MealType.dinner: '🌙',
    MealType.snack: '🍎',
  };

  static const _mealLabels = {
    MealType.breakfast: 'Breakfast',
    MealType.lunch: 'Lunch',
    MealType.dinner: 'Dinner',
    MealType.snack: 'Snack',
  };

  @override
  Widget build(BuildContext context) {
    final hasRecipe = slot.recipe != null;

    return GestureDetector(
      onTap: hasRecipe ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: hasRecipe
              ? AppColors.primary.withOpacity(0.08)
              : Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: hasRecipe
                ? AppColors.primary.withOpacity(0.3)
                : Colors.transparent,
          ),
        ),
        child: Row(
          children: [
            Text(
              _mealIcons[slot.type] ?? '🍽️',
              style: const TextStyle(fontSize: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _mealLabels[slot.type] ?? slot.type.name,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    hasRecipe ? slot.recipe!.name : 'Tap to add a recipe',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight:
                          hasRecipe ? FontWeight.w600 : FontWeight.w400,
                      color: hasRecipe
                          ? null
                          : AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (hasRecipe)
              IconButton(
                icon: const Icon(Icons.close, size: 18),
                color: AppColors.textSecondary,
                onPressed: onRemove,
                splashRadius: 18,
              )
            else
              Icon(Icons.add_circle_outline,
                  color: AppColors.primary, size: 22),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Weekly nutrition summary
// ---------------------------------------------------------------------------

class _WeeklyNutritionSummary extends StatelessWidget {
  const _WeeklyNutritionSummary({
    required this.plan,
    required this.targetCal,
  });

  final MealPlan plan;
  final int targetCal;

  @override
  Widget build(BuildContext context) {
    // Count filled slots and estimate total calories
    int totalFilled = 0;
    int totalSlots = 0;
    for (final day in plan.days) {
      totalSlots += day.meals.length;
      for (final slot in day.meals) {
        if (slot.recipe != null) totalFilled++;
      }
    }
    final fillPct = totalSlots == 0 ? 0.0 : totalFilled / totalSlots;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Weekly Summary',
            style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.textSecondary),
          ),
          const SizedBox(height: 12),
          Card(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Meal slots filled',
                          style: TextStyle(fontSize: 13)),
                      Text(
                        '$totalFilled / $totalSlots',
                        style: const TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: fillPct,
                      minHeight: 8,
                      backgroundColor: AppColors.primary.withOpacity(0.12),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                          AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _SummaryStatBox(
                          label: 'Calorie Goal',
                          value: '$targetCal kcal',
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _SummaryStatBox(
                          label: 'Days Planned',
                          value: '${plan.days.where((d) => d.meals.any((s) => s.recipe != null)).length}/7',
                          color: AppColors.secondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryStatBox extends StatelessWidget {
  const _SummaryStatBox({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          const SizedBox(height: 2),
          Text(value,
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: color)),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Meal prep tips (expandable)
// ---------------------------------------------------------------------------

class _MealPrepTips extends StatelessWidget {
  const _MealPrepTips();

  static const _tips = [
    'Batch cook grains (rice, quinoa) on Sunday for the whole week.',
    'Pre-chop vegetables and store in airtight containers.',
    'Marinate proteins the night before to save morning prep time.',
    'Keep hard-boiled eggs on hand for quick protein additions.',
    'Freeze individual meal portions to avoid waste.',
    'Plan meals around similar ingredients to reduce grocery spend.',
    'Prep sauces and dressings in bulk — they last all week.',
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ExpansionTile(
        tilePadding: EdgeInsets.zero,
        title: const Text(
          'Meal Prep Tips',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700,
              color: AppColors.textSecondary),
        ),
        leading: const Icon(Icons.tips_and_updates_outlined,
            color: AppColors.primary),
        children: _tips.map((tip) {
          return ListTile(
            dense: true,
            contentPadding: const EdgeInsets.only(left: 8),
            leading: const Icon(Icons.check_circle_outline,
                color: AppColors.success, size: 18),
            title: Text(tip, style: const TextStyle(fontSize: 13)),
          );
        }).toList(),
      ),
    );
  }
}
