import 'package:flutter/material.dart';
import 'package:recipe_pilot/core/theme/app_colors.dart';

class QuickPromptChip extends StatelessWidget {
  const QuickPromptChip({
    super.key,
    required this.text,
    required this.onTap,
    this.icon,
    this.isSelected = false,
  });

  final String text;
  final VoidCallback onTap;
  final String? icon;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final borderColor = isSelected
        ? AppColors.primary
        : (isDark
            ? AppColors.darkTextSecondary.withOpacity(0.35)
            : AppColors.textSecondary.withOpacity(0.3));

    final bgColor = isSelected
        ? AppColors.primary.withOpacity(0.1)
        : Colors.transparent;

    final labelColor = isSelected
        ? AppColors.primary
        : (isDark ? AppColors.darkTextPrimary : AppColors.textPrimary);

    final label = icon != null ? '$icon  $text' : text;

    return ActionChip(
      label: Text(
        label,
        style: TextStyle(
          fontSize: 13,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
          color: labelColor,
        ),
      ),
      onPressed: onTap,
      backgroundColor: bgColor,
      side: BorderSide(color: borderColor, width: 1.2),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
      visualDensity: VisualDensity.compact,
      elevation: 0,
      pressElevation: 1,
    );
  }
}

/// A horizontal scrollable row of [QuickPromptChip] widgets.
///
/// Convenience wrapper for displaying a set of quick prompt chips in a
/// single row without managing the scroll controller externally.
class QuickPromptChipRow extends StatelessWidget {
  const QuickPromptChipRow({
    super.key,
    required this.prompts,
    required this.onTap,
    this.selectedIndex,
    this.padding,
  });

  final List<String> prompts;
  final void Function(int index, String text) onTap;
  final int? selectedIndex;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: padding ??
          const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Row(
        children: [
          for (int i = 0; i < prompts.length; i++) ...[
            QuickPromptChip(
              text: prompts[i],
              onTap: () => onTap(i, prompts[i]),
              isSelected: selectedIndex == i,
            ),
            if (i < prompts.length - 1) const SizedBox(width: 8),
          ],
        ],
      ),
    );
  }
}
