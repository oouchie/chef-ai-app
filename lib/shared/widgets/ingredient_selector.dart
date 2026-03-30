import 'package:flutter/material.dart';
import 'package:recipe_pilot/core/theme/app_colors.dart';
import 'package:recipe_pilot/shared/models/models.dart';
import 'package:recipe_pilot/shared/widgets/gradient_button.dart';

/// Modal bottom sheet content for selecting ingredients.
///
/// Usage:
/// ```dart
/// showModalBottomSheet(
///   context: context,
///   isScrollControlled: true,
///   builder: (_) => IngredientSelector(
///     ingredients: recipe.ingredients,
///     onAdd: (selected) { ... },
///   ),
/// );
/// ```
class IngredientSelector extends StatefulWidget {
  const IngredientSelector({
    super.key,
    required this.ingredients,
    required this.onAdd,
    this.title = 'Select Ingredients',
  });

  final List<Ingredient> ingredients;
  final void Function(List<Ingredient> selected) onAdd;
  final String title;

  @override
  State<IngredientSelector> createState() => _IngredientSelectorState();
}

class _IngredientSelectorState extends State<IngredientSelector> {
  late final Set<int> _selected;

  @override
  void initState() {
    super.initState();
    // Start with all items selected for convenience
    _selected = Set.from(
      List.generate(widget.ingredients.length, (i) => i),
    );
  }

  bool get _allSelected => _selected.length == widget.ingredients.length;

  void _selectAll() {
    setState(() {
      _selected.addAll(
        List.generate(widget.ingredients.length, (i) => i),
      );
    });
  }

  void _clearAll() {
    setState(() => _selected.clear());
  }

  void _toggle(int index) {
    setState(() {
      if (_selected.contains(index)) {
        _selected.remove(index);
      } else {
        _selected.add(index);
      }
    });
  }

  void _handleAdd() {
    final selected = _selected
        .map((i) => widget.ingredients[i])
        .toList();
    widget.onAdd(selected);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimary =
        isDark ? AppColors.darkTextPrimary : AppColors.textPrimary;
    final textSecondary =
        isDark ? AppColors.darkTextSecondary : AppColors.textSecondary;
    final bgColor =
        isDark ? AppColors.darkSurface : AppColors.surface;

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Drag handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 10, bottom: 4),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: textSecondary.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Title row
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  children: [
                    Text(
                      widget.title,
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: textPrimary,
                      ),
                    ),
                    const Spacer(),
                    // Select All / Clear All
                    TextButton(
                      onPressed: _allSelected ? _clearAll : _selectAll,
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        _allSelected ? 'Clear All' : 'Select All',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const Divider(height: 1, thickness: 0.5),

              // Ingredient list
              Expanded(
                child: widget.ingredients.isEmpty
                    ? Center(
                        child: Text(
                          'No ingredients available.',
                          style: TextStyle(color: textSecondary),
                        ),
                      )
                    : ListView.separated(
                        controller: scrollController,
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        itemCount: widget.ingredients.length,
                        separatorBuilder: (_, __) =>
                            const Divider(height: 1, thickness: 0.4,
                                indent: 56),
                        itemBuilder: (context, index) {
                          final ing = widget.ingredients[index];
                          final isChecked = _selected.contains(index);
                          final amountUnit = [ing.amount, ing.unit]
                              .where((s) => s.isNotEmpty)
                              .join(' ');
                          final label = amountUnit.isNotEmpty
                              ? '$amountUnit ${ing.name}'
                              : ing.name;

                          return CheckboxListTile(
                            value: isChecked,
                            onChanged: (_) => _toggle(index),
                            activeColor: AppColors.primary,
                            checkColor: Colors.white,
                            title: Text(
                              label,
                              style: TextStyle(
                                fontSize: 14,
                                color: textPrimary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            subtitle: ing.notes != null &&
                                    ing.notes!.isNotEmpty
                                ? Text(
                                    ing.notes!,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: textSecondary,
                                      fontStyle: FontStyle.italic,
                                    ),
                                  )
                                : null,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 2),
                            controlAffinity: ListTileControlAffinity.leading,
                            dense: true,
                          );
                        },
                      ),
              ),

              // Bottom action button
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                  child: GradientButton(
                    onPressed: _selected.isEmpty ? null : _handleAdd,
                    width: double.infinity,
                    child: Text(
                      _selected.isEmpty
                          ? 'Add Selected'
                          : 'Add Selected (${_selected.length})',
                    ),
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
