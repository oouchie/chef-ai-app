import 'package:flutter/material.dart';
import 'package:recipe_pilot/core/theme/app_colors.dart';

enum GradientButtonVariant { primary, secondary }

class GradientButton extends StatelessWidget {
  const GradientButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.gradient,
    this.isLoading = false,
    this.variant = GradientButtonVariant.primary,
    this.borderRadius,
    this.padding,
    this.width,
    this.height,
  });

  final VoidCallback? onPressed;
  final Widget child;
  final Gradient? gradient;
  final bool isLoading;
  final GradientButtonVariant variant;
  final double? borderRadius;
  final EdgeInsetsGeometry? padding;
  final double? width;
  final double? height;

  static const _primaryGradient = LinearGradient(
    colors: [Color(0xFFFF6B35), Color(0xFFF7931E)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const _secondaryGradient = LinearGradient(
    colors: [Color(0xFF2EC4B6), Color(0xFF4ECDC4)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  Gradient get _resolvedGradient {
    if (gradient != null) return gradient!;
    return variant == GradientButtonVariant.secondary
        ? _secondaryGradient
        : _primaryGradient;
  }

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? 12.0;
    final isDisabled = onPressed == null || isLoading;

    return AnimatedOpacity(
      duration: const Duration(milliseconds: 200),
      opacity: isDisabled ? 0.6 : 1.0,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          gradient: _resolvedGradient,
          borderRadius: BorderRadius.circular(radius),
          boxShadow: isDisabled
              ? null
              : [
                  BoxShadow(
                    color: (variant == GradientButtonVariant.secondary
                            ? AppColors.secondary
                            : AppColors.primary)
                        .withOpacity(0.35),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(radius),
          child: InkWell(
            onTap: isDisabled ? null : onPressed,
            borderRadius: BorderRadius.circular(radius),
            splashColor: Colors.white.withOpacity(0.2),
            highlightColor: Colors.white.withOpacity(0.1),
            child: Padding(
              padding: padding ??
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Center(
                child: isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : DefaultTextStyle(
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.3,
                        ),
                        child: child,
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
