import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/chat_provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/models.dart';
import '../../../shared/utils/shopping_list_helpers.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../features/saved_recipes/domain/saved_recipes_provider.dart';

class RecipeResultsScreen extends ConsumerWidget {
  const RecipeResultsScreen({super.key, this.recipe});

  final Recipe? recipe;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final savedState = ref.watch(savedRecipesProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Resolve recipe: constructor param > latest from chat
    final resolvedRecipe = recipe ?? _latestRecipeFromChat(ref);

    if (resolvedRecipe == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Recipe')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.restaurant_outlined,
                size: 64,
                color: isDark
                    ? AppColors.darkTextSecondary
                    : AppColors.textSecondary,
              ),
              const SizedBox(height: 16),
              Text(
                'No recipe to display',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Go back and generate a recipe first.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          resolvedRecipe.name,
          style: const TextStyle(fontWeight: FontWeight.w600),
          overflow: TextOverflow.ellipsis,
        ),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        child: RecipeCard(
          recipe: resolvedRecipe,
          isSaved: savedState.isSaved(resolvedRecipe),
          onSave: () {
            ref.read(savedRecipesProvider.notifier).toggleSave(resolvedRecipe);
          },
          onAddToShoppingList: () {
            showAddToShoppingList(
              context: context,
              ref: ref,
              recipe: resolvedRecipe,
            );
          },
        ),
      ),
    );
  }

  Recipe? _latestRecipeFromChat(WidgetRef ref) {
    final chatState = ref.read(chatProvider);
    final messages = chatState.currentSession?.messages ?? [];
    for (int i = messages.length - 1; i >= 0; i--) {
      if (messages[i].recipe != null) return messages[i].recipe;
    }
    return null;
  }
}
