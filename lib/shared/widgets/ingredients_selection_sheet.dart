import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../models/models.dart';
import 'gradient_button.dart';

Future<List<Ingredient>?> showIngredientsSelectionSheet(
  BuildContext context,
  Recipe recipe,
) {
  return showModalBottomSheet<List<Ingredient>>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _IngredientsSelectionSheet(recipe: recipe),
  );
}

class _IngredientsSelectionSheet extends StatefulWidget {
  const _IngredientsSelectionSheet({required this.recipe});

  final Recipe recipe;

  @override
  State<_IngredientsSelectionSheet> createState() =>
      _IngredientsSelectionSheetState();
}

class _IngredientsSelectionSheetState
    extends State<_IngredientsSelectionSheet> {
  late final Set<int> _selected;

  @override
  void initState() {
    super.initState();
    _selected = Set.from(
      List.generate(widget.recipe.ingredients.length, (i) => i),
    );
  }

  void _selectAll() {
    setState(() {
      _selected.addAll(
        List.generate(widget.recipe.ingredients.length, (i) => i),
      );
    });
  }

  void _clearAll() {
    setState(() => _selected.clear());
  }

  void _confirm() {
    final sorted = _selected.toList()..sort();
    Navigator.pop(
      context,
      sorted.map((i) => widget.recipe.ingredients[i]).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final ingredients = widget.recipe.ingredients;
    final total = ingredients.length;
    final selectedCount = _selected.length;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.75,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.darkTextSecondary.withOpacity(0.4)
                    : AppColors.textSecondary.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.recipe.name,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: isDark
                        ? AppColors.darkTextPrimary
                        : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '$selectedCount / $total selected',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                    Row(
                      children: [
                        TextButton(
                          onPressed: _selectAll,
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: const Text(
                            'Select All',
                            style: TextStyle(fontSize: 12),
                          ),
                        ),
                        const SizedBox(width: 4),
                        TextButton(
                          onPressed: _clearAll,
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: const Text(
                            'Clear All',
                            style: TextStyle(fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Ingredient list
          Flexible(
            child: ListView.builder(
              shrinkWrap: true,
              padding: const EdgeInsets.symmetric(vertical: 4),
              itemCount: total,
              itemBuilder: (context, index) {
                final ing = ingredients[index];
                final isChecked = _selected.contains(index);
                final amountUnit = [ing.amount, ing.unit]
                    .where((s) => s.isNotEmpty)
                    .join(' ');

                return CheckboxListTile(
                  value: isChecked,
                  onChanged: (val) {
                    setState(() {
                      if (val == true) {
                        _selected.add(index);
                      } else {
                        _selected.remove(index);
                      }
                    });
                  },
                  activeColor: AppColors.secondary,
                  controlAffinity: ListTileControlAffinity.leading,
                  dense: true,
                  title: Text(
                    ing.name,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: isDark
                          ? AppColors.darkTextPrimary
                          : AppColors.textPrimary,
                    ),
                  ),
                  subtitle: amountUnit.isNotEmpty || (ing.notes?.isNotEmpty ?? false)
                      ? Text(
                          [
                            if (amountUnit.isNotEmpty) amountUnit,
                            if (ing.notes?.isNotEmpty ?? false) ing.notes!,
                          ].join(' - '),
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark
                                ? AppColors.darkTextSecondary
                                : AppColors.textSecondary,
                          ),
                        )
                      : null,
                );
              },
            ),
          ),

          // Confirm button
          Padding(
            padding: EdgeInsets.fromLTRB(
              20,
              12,
              20,
              12 + MediaQuery.of(context).viewPadding.bottom,
            ),
            child: SizedBox(
              width: double.infinity,
              child: GradientButton(
                onPressed: selectedCount > 0 ? _confirm : null,
                variant: GradientButtonVariant.secondary,
                child: Text(
                  selectedCount > 0
                      ? 'Add $selectedCount Item${selectedCount == 1 ? '' : 's'} to Shopping List'
                      : 'Select Items to Add',
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
