import 'package:flutter/material.dart';
import 'package:recipe_pilot/core/theme/app_colors.dart';
import 'package:recipe_pilot/shared/models/models.dart';
import 'package:recipe_pilot/shared/widgets/gradient_button.dart';

class RecipeCard extends StatelessWidget {
  const RecipeCard({
    super.key,
    required this.recipe,
    required this.isSaved,
    required this.onSave,
    required this.onAddToShoppingList,
  });

  final Recipe recipe;
  final bool isSaved;
  final VoidCallback onSave;
  final VoidCallback onAddToShoppingList;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      elevation: 3,
      shadowColor: Colors.black.withOpacity(0.12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      color: isDark ? AppColors.darkSurface : AppColors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _RecipeCardHeader(recipe: recipe, isDark: isDark),
          _RecipeMetaRow(recipe: recipe, isDark: isDark),
          const SizedBox(height: 4),
          _RecipeTabs(recipe: recipe, isDark: isDark),
          _RecipeCardFooter(
            isSaved: isSaved,
            onSave: onSave,
            onAddToShoppingList: onAddToShoppingList,
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

class _RecipeCardHeader extends StatelessWidget {
  const _RecipeCardHeader({required this.recipe, required this.isDark});

  final Recipe recipe;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(
              recipe.name,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
              ),
            ),
          ),
          const SizedBox(width: 8),
          _DifficultyBadge(difficulty: recipe.difficulty),
        ],
      ),
    );
  }
}

class _DifficultyBadge extends StatelessWidget {
  const _DifficultyBadge({required this.difficulty});

  final String difficulty;

  Color get _color {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return const Color(0xFF10B981);
      case 'medium':
        return const Color(0xFFF59E0B);
      case 'hard':
        return const Color(0xFFEF4444);
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _color.withOpacity(0.4), width: 1),
      ),
      child: Text(
        difficulty,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: _color,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Metadata row
// ---------------------------------------------------------------------------

class _RecipeMetaRow extends StatelessWidget {
  const _RecipeMetaRow({required this.recipe, required this.isDark});

  final Recipe recipe;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final color = isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Wrap(
        spacing: 16,
        runSpacing: 6,
        children: [
          _MetaChip(icon: '🕐', label: recipe.prepTime, color: color),
          _MetaChip(icon: '🔥', label: recipe.cookTime, color: color),
          _MetaChip(
              icon: '🍽️', label: '${recipe.servings} servings', color: color),
          _MetaChip(icon: '🌍', label: recipe.region, color: color),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  final String icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(icon, style: const TextStyle(fontSize: 13)),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(fontSize: 13, color: color),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Tabbed content
// ---------------------------------------------------------------------------

class _RecipeTabs extends StatelessWidget {
  const _RecipeTabs({required this.recipe, required this.isDark});

  final Recipe recipe;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final labelColor =
        isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;

    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          TabBar(
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textSecondary,
            indicatorColor: AppColors.primary,
            indicatorWeight: 2,
            labelStyle: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
            tabs: const [
              Tab(text: 'Ingredients'),
              Tab(text: 'Instructions'),
              Tab(text: 'Tips'),
            ],
          ),
          SizedBox(
            height: 220,
            child: TabBarView(
              children: [
                _IngredientsTab(
                    ingredients: recipe.ingredients, labelColor: labelColor),
                _InstructionsTab(
                    steps: recipe.instructions, labelColor: labelColor),
                _TipsTab(tips: recipe.tips, labelColor: labelColor),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _IngredientsTab extends StatelessWidget {
  const _IngredientsTab(
      {required this.ingredients, required this.labelColor});

  final List<Ingredient> ingredients;
  final Color labelColor;

  @override
  Widget build(BuildContext context) {
    if (ingredients.isEmpty) {
      return _EmptyTabMessage(
          message: 'No ingredients listed.', color: labelColor);
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: ingredients.length,
      separatorBuilder: (_, __) => const Divider(height: 1, thickness: 0.5),
      itemBuilder: (context, index) {
        final ing = ingredients[index];
        final amountUnit =
            [ing.amount, ing.unit].where((s) => s.isNotEmpty).join(' ');
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 7),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 22,
                child: Text(
                  '${index + 1}.',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: TextStyle(fontSize: 13, color: labelColor),
                    children: [
                      TextSpan(
                        text: ing.name,
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                      if (amountUnit.isNotEmpty)
                        TextSpan(
                          text: ' — $amountUnit',
                          style: TextStyle(
                              color: AppColors.textSecondary, fontSize: 12),
                        ),
                      if (ing.notes != null && ing.notes!.isNotEmpty)
                        TextSpan(
                          text: ' (${ing.notes})',
                          style: TextStyle(
                              color: AppColors.textSecondary,
                              fontStyle: FontStyle.italic,
                              fontSize: 12),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _InstructionsTab extends StatelessWidget {
  const _InstructionsTab({required this.steps, required this.labelColor});

  final List<String> steps;
  final Color labelColor;

  @override
  Widget build(BuildContext context) {
    if (steps.isEmpty) {
      return _EmptyTabMessage(message: 'No instructions listed.', color: labelColor);
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: steps.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    '${index + 1}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  steps[index],
                  style: TextStyle(fontSize: 13, color: labelColor, height: 1.4),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _TipsTab extends StatelessWidget {
  const _TipsTab({required this.tips, required this.labelColor});

  final List<String> tips;
  final Color labelColor;

  @override
  Widget build(BuildContext context) {
    if (tips.isEmpty) {
      return _EmptyTabMessage(message: 'No tips available.', color: labelColor);
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: tips.length,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '•',
                style: TextStyle(
                  fontSize: 16,
                  color: AppColors.secondary,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  tips[index],
                  style: TextStyle(fontSize: 13, color: labelColor, height: 1.4),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _EmptyTabMessage extends StatelessWidget {
  const _EmptyTabMessage({required this.message, required this.color});

  final String message;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        message,
        style: TextStyle(color: color, fontSize: 13),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

class _RecipeCardFooter extends StatelessWidget {
  const _RecipeCardFooter({
    required this.isSaved,
    required this.onSave,
    required this.onAddToShoppingList,
  });

  final bool isSaved;
  final VoidCallback onSave;
  final VoidCallback onAddToShoppingList;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
      child: Row(
        children: [
          // Heart / save button
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onSave,
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 200),
                  transitionBuilder: (child, animation) => ScaleTransition(
                    scale: animation,
                    child: child,
                  ),
                  child: Icon(
                    isSaved ? Icons.favorite : Icons.favorite_border,
                    key: ValueKey(isSaved),
                    color: isSaved ? AppColors.error : AppColors.textSecondary,
                    size: 22,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Add to shopping list
          Expanded(
            child: GradientButton(
              onPressed: onAddToShoppingList,
              variant: GradientButtonVariant.secondary,
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: const Text(
                'Add to List',
                style: TextStyle(fontSize: 13),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
