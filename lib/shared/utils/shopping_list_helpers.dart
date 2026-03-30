import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/route_names.dart';
import '../../features/pantry/domain/todos_provider.dart';
import '../models/models.dart';
import '../widgets/ingredients_selection_sheet.dart';

Future<void> showAddToShoppingList({
  required BuildContext context,
  required WidgetRef ref,
  required Recipe recipe,
}) async {
  final selected = await showIngredientsSelectionSheet(context, recipe);
  if (selected == null || selected.isEmpty) return;

  await ref
      .read(todosProvider.notifier)
      .addIngredientsFromRecipe(recipe, selected);

  if (context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '${selected.length} item${selected.length == 1 ? '' : 's'} added to shopping list',
        ),
        duration: const Duration(seconds: 3),
        action: SnackBarAction(
          label: 'View List',
          onPressed: () => context.go(RouteNames.shoppingList),
        ),
      ),
    );
  }
}
