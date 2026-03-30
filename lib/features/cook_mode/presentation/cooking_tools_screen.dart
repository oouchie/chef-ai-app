import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/cooking_helpers.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/models/models.dart';
import '../../../features/saved_recipes/domain/saved_recipes_provider.dart';

class CookingToolsScreen extends ConsumerWidget {
  const CookingToolsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Cooking Tools'),
          centerTitle: false,
          elevation: 0,
          bottom: const TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            tabs: [
              Tab(text: 'Timer'),
              Tab(text: 'Scale'),
              Tab(text: 'Substitutions'),
              Tab(text: 'Nutrition'),
              Tab(text: 'Converter'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _TimerTab(),
            _ScaleTab(),
            _SubstitutionsTab(),
            _NutritionTab(),
            _ConverterTab(),
          ],
        ),
      ),
    );
  }
}

// ===========================================================================
// Tab 1 - Timer
// ===========================================================================

class _ActiveTimer {
  final String id;
  final String name;
  int remainingSeconds;
  bool paused;
  Timer? ticker;

  _ActiveTimer({
    required this.id,
    required this.name,
    required this.remainingSeconds,
    this.paused = false,
  });

  String get display {
    final m = remainingSeconds ~/ 60;
    final s = remainingSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }
}

class _TimerTab extends StatefulWidget {
  const _TimerTab();

  @override
  State<_TimerTab> createState() => _TimerTabState();
}

class _TimerTabState extends State<_TimerTab> {
  final List<_ActiveTimer> _activeTimers = [];
  double _customMinutes = 5;
  int _customTimerCount = 0;

  @override
  void dispose() {
    for (final t in _activeTimers) {
      t.ticker?.cancel();
    }
    super.dispose();
  }

  void _startTimer(String name, int minutes) {
    final id = 'timer_${DateTime.now().millisecondsSinceEpoch}_${_customTimerCount++}';
    final timer = _ActiveTimer(
      id: id,
      name: name,
      remainingSeconds: minutes * 60,
    );

    timer.ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        if (timer.paused) return;
        if (timer.remainingSeconds > 0) {
          timer.remainingSeconds--;
        } else {
          timer.ticker?.cancel();
          _onTimerFinished(timer);
        }
      });
    });

    setState(() => _activeTimers.add(timer));
  }

  void _onTimerFinished(_ActiveTimer timer) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${timer.name} is done!'),
        backgroundColor: AppColors.success,
        duration: const Duration(seconds: 4),
      ),
    );
  }

  void _cancelTimer(_ActiveTimer timer) {
    timer.ticker?.cancel();
    setState(() => _activeTimers.remove(timer));
  }

  void _togglePause(_ActiveTimer timer) {
    setState(() => timer.paused = !timer.paused);
  }

  @override
  Widget build(BuildContext context) {
    // Group presets by category
    final grouped = <String, List<TimerPreset>>{};
    for (final p in timerPresets) {
      grouped.putIfAbsent(p.category, () => []).add(p);
    }

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      children: [
        // Active timers
        if (_activeTimers.isNotEmpty) ...[
          Text(
            'Active Timers',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 8),
          ..._activeTimers.map((t) => _ActiveTimerCard(
                timer: t,
                onCancel: () => _cancelTimer(t),
                onTogglePause: () => _togglePause(t),
              )),
          const Divider(height: 24),
        ],

        // Custom timer
        _SectionLabel(label: 'Custom Timer'),
        const SizedBox(height: 8),
        Card(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Duration'),
                    Text(
                      '${_customMinutes.round()} min',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                Slider(
                  value: _customMinutes,
                  min: 1,
                  max: 180,
                  divisions: 179,
                  label: '${_customMinutes.round()} min',
                  onChanged: (v) => setState(() => _customMinutes = v),
                  activeColor: AppColors.primary,
                ),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: () =>
                        _startTimer('Custom Timer', _customMinutes.round()),
                    icon: const Icon(Icons.timer_outlined, size: 16),
                    label: const Text('Start Timer'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        // Preset groups
        for (final entry in grouped.entries) ...[
          _SectionLabel(label: entry.key),
          const SizedBox(height: 8),
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: entry.value.map((p) {
              return InkWell(
                onTap: () => _startTimer(p.name, p.minutes),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.07),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: AppColors.primary.withOpacity(0.2),
                    ),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        p.name,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${p.minutes} min',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
        ],
      ],
    );
  }
}

class _ActiveTimerCard extends StatelessWidget {
  const _ActiveTimerCard({
    required this.timer,
    required this.onCancel,
    required this.onTogglePause,
  });

  final _ActiveTimer timer;
  final VoidCallback onCancel;
  final VoidCallback onTogglePause;

  @override
  Widget build(BuildContext context) {
    final isDone = timer.remainingSeconds == 0;
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: isDone
          ? AppColors.success.withOpacity(0.1)
          : AppColors.primary.withOpacity(0.06),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isDone ? AppColors.success : AppColors.primary,
          radius: 20,
          child: Icon(
            isDone ? Icons.check : Icons.timer,
            color: Colors.white,
            size: 18,
          ),
        ),
        title: Text(timer.name,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        subtitle: Text(
          isDone ? 'Done!' : timer.display,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: isDone ? AppColors.success : AppColors.primary,
          ),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!isDone)
              IconButton(
                icon: Icon(
                  timer.paused ? Icons.play_arrow : Icons.pause,
                  size: 20,
                ),
                onPressed: onTogglePause,
                color: AppColors.primary,
              ),
            IconButton(
              icon: const Icon(Icons.close, size: 18),
              onPressed: onCancel,
              color: AppColors.textSecondary,
            ),
          ],
        ),
      ),
    );
  }
}

// ===========================================================================
// Tab 2 - Scale Recipe
// ===========================================================================

class _ScaleTab extends ConsumerStatefulWidget {
  const _ScaleTab();

  @override
  ConsumerState<_ScaleTab> createState() => _ScaleTabState();
}

class _ScaleTabState extends ConsumerState<_ScaleTab> {
  Recipe? _selectedRecipe;
  late int _targetServings;

  @override
  void initState() {
    super.initState();
    _targetServings = 2;
  }

  @override
  Widget build(BuildContext context) {
    final savedState = ref.watch(savedRecipesProvider);
    final recipes = savedState.recipes;

    final scaled = _selectedRecipe != null
        ? scaleRecipe(_selectedRecipe!, _targetServings)
        : null;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const _SectionLabel(label: 'Select a Recipe'),
        const SizedBox(height: 8),
        DropdownButtonFormField<Recipe>(
          value: _selectedRecipe,
          hint: const Text('Choose from saved recipes'),
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            filled: true,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
          items: recipes.map((r) {
            return DropdownMenuItem(
              value: r,
              child: Text(r.name, overflow: TextOverflow.ellipsis),
            );
          }).toList(),
          onChanged: (r) => setState(() {
            _selectedRecipe = r;
            _targetServings = r?.servings ?? 2;
          }),
        ),
        if (_selectedRecipe != null) ...[
          const SizedBox(height: 20),
          Row(
            children: [
              _SectionLabel(label: 'Servings'),
              const Spacer(),
              Text(
                'Original: ${_selectedRecipe!.servings}',
                style: const TextStyle(
                    fontSize: 12, color: AppColors.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _StepperButton(
                icon: Icons.remove,
                onTap: _targetServings > 1
                    ? () => setState(() => _targetServings--)
                    : null,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Text(
                  '$_targetServings',
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
              _StepperButton(
                icon: Icons.add,
                onTap: () => setState(() => _targetServings++),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const _SectionLabel(label: 'Scaled Ingredients'),
          const SizedBox(height: 8),
          if (scaled != null)
            ...scaled.ingredients.map((ing) {
              final amt = [ing.amount, ing.unit]
                  .where((s) => s.isNotEmpty)
                  .join(' ');
              return ListTile(
                dense: true,
                leading: const Icon(Icons.fiber_manual_record,
                    size: 8, color: AppColors.primary),
                title: Text(ing.name,
                    style: const TextStyle(fontSize: 14,
                        fontWeight: FontWeight.w500)),
                trailing: Text(
                  amt,
                  style: const TextStyle(
                      fontSize: 13, color: AppColors.textSecondary),
                ),
              );
            }),
        ] else ...[
          const SizedBox(height: 60),
          Center(
            child: Column(
              children: [
                Icon(Icons.scale_outlined,
                    size: 56,
                    color: Theme.of(context).colorScheme.onSurfaceVariant),
                const SizedBox(height: 12),
                const Text('Select a recipe to scale its ingredients'),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _StepperButton extends StatelessWidget {
  const _StepperButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: onTap == null
          ? AppColors.primary.withOpacity(0.1)
          : AppColors.primary,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Icon(icon,
              color: onTap == null ? AppColors.textSecondary : Colors.white,
              size: 22),
        ),
      ),
    );
  }
}

// ===========================================================================
// Tab 3 - Substitutions
// ===========================================================================

class _SubstitutionsTab extends StatefulWidget {
  const _SubstitutionsTab();

  @override
  State<_SubstitutionsTab> createState() => _SubstitutionsTabState();
}

class _SubstitutionsTabState extends State<_SubstitutionsTab> {
  final _controller = TextEditingController();
  List<Substitution> _results = [];
  String _query = '';

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _search(String q) {
    setState(() {
      _query = q;
      _results = q.trim().isEmpty ? [] : findSubstitutions(q.trim());
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            controller: _controller,
            onChanged: _search,
            decoration: InputDecoration(
              hintText: 'Search ingredient (e.g. butter, egg, milk)...',
              prefixIcon: const Icon(Icons.search, size: 20),
              suffixIcon: _controller.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () {
                        _controller.clear();
                        _search('');
                      },
                    )
                  : null,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              filled: true,
            ),
          ),
        ),
        Expanded(
          child: _query.isEmpty
              ? _SubstitutionHints()
              : _results.isEmpty
                  ? const Center(
                      child: Text('No substitutions found for that ingredient.'),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      itemCount: _results.length,
                      separatorBuilder: (_, __) =>
                          const Divider(height: 1, thickness: 0.5),
                      itemBuilder: (_, i) {
                        final s = _results[i];
                        return ListTile(
                          contentPadding:
                              const EdgeInsets.symmetric(vertical: 6),
                          title: Text(s.name,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600, fontSize: 14)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 2),
                              Text('Ratio: ${s.ratio}',
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: AppColors.primary)),
                              if (s.notes.isNotEmpty)
                                Text(s.notes,
                                    style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textSecondary)),
                            ],
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }
}

class _SubstitutionHints extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const hints = [
      'butter', 'egg', 'milk', 'flour', 'sugar',
      'soy sauce', 'heavy cream', 'chicken broth', 'garlic', 'lemon juice',
    ];
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Try searching for:',
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: hints.map((h) {
              return Chip(
                label: Text(h, style: const TextStyle(fontSize: 12)),
                visualDensity: VisualDensity.compact,
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

// ===========================================================================
// Tab 4 - Nutrition
// ===========================================================================

class _NutritionTab extends ConsumerStatefulWidget {
  const _NutritionTab();

  @override
  ConsumerState<_NutritionTab> createState() => _NutritionTabState();
}

class _NutritionTabState extends ConsumerState<_NutritionTab> {
  Recipe? _selectedRecipe;

  @override
  Widget build(BuildContext context) {
    final recipes = ref.watch(savedRecipesProvider).recipes;
    final estimate =
        _selectedRecipe != null ? estimateNutrition(_selectedRecipe!) : null;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const _SectionLabel(label: 'Select a Recipe'),
        const SizedBox(height: 8),
        DropdownButtonFormField<Recipe>(
          value: _selectedRecipe,
          hint: const Text('Choose from saved recipes'),
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            filled: true,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
          items: recipes.map((r) {
            return DropdownMenuItem(
              value: r,
              child: Text(r.name, overflow: TextOverflow.ellipsis),
            );
          }).toList(),
          onChanged: (r) => setState(() => _selectedRecipe = r),
        ),
        if (estimate != null) ...[
          const SizedBox(height: 24),
          Text(
            'Estimated per serving (${_selectedRecipe!.servings} servings)',
            style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary),
          ),
          const SizedBox(height: 12),
          _NutritionCard(
              icon: Icons.local_fire_department,
              label: 'Calories',
              value: '${estimate.calories} kcal',
              color: AppColors.primary),
          _NutritionCard(
              icon: Icons.fitness_center,
              label: 'Protein',
              value: '${estimate.protein}g',
              color: AppColors.secondary),
          _NutritionCard(
              icon: Icons.grain,
              label: 'Carbohydrates',
              value: '${estimate.carbs}g',
              color: AppColors.warning),
          _NutritionCard(
              icon: Icons.water_drop_outlined,
              label: 'Fat',
              value: '${estimate.fat}g',
              color: AppColors.info),
          _NutritionCard(
              icon: Icons.eco_outlined,
              label: 'Fiber',
              value: '${estimate.fiber}g',
              color: AppColors.success),
          const SizedBox(height: 12),
          Text(
            'Note: Values are rough estimates based on ingredient keywords. For precise nutrition, use a dedicated tracker.',
            style: TextStyle(
                fontSize: 11,
                fontStyle: FontStyle.italic,
                color: AppColors.textSecondary),
          ),
        ] else ...[
          const SizedBox(height: 60),
          Center(
            child: Column(
              children: [
                Icon(Icons.monitor_heart_outlined,
                    size: 56,
                    color:
                        Theme.of(context).colorScheme.onSurfaceVariant),
                const SizedBox(height: 12),
                const Text('Select a recipe to see estimated nutrition'),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class _NutritionCard extends StatelessWidget {
  const _NutritionCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.12),
          radius: 20,
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(label,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        trailing: Text(
          value,
          style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: color),
        ),
      ),
    );
  }
}

// ===========================================================================
// Tab 5 - Unit Converter
// ===========================================================================

class _ConverterTab extends StatefulWidget {
  const _ConverterTab();

  @override
  State<_ConverterTab> createState() => _ConverterTabState();
}

class _ConverterTabState extends State<_ConverterTab> {
  static const _units = ['cup', 'tbsp', 'tsp', 'oz', 'g', 'lb', 'ml', 'kg'];

  final _controller = TextEditingController();
  String _fromUnit = 'cup';
  String _toUnit = 'ml';
  double? _result;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _convert() {
    final val = double.tryParse(_controller.text);
    if (val == null) {
      setState(() => _result = null);
      return;
    }
    setState(() => _result = convertUnit(val, _fromUnit, _toUnit));
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const SizedBox(height: 8),
        const _SectionLabel(label: 'Unit Converter'),
        const SizedBox(height: 16),
        // From
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                onChanged: (_) => _convert(),
                decoration: InputDecoration(
                  labelText: 'Amount',
                  hintText: '1.0',
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                ),
              ),
            ),
            const SizedBox(width: 12),
            _UnitDropdown(
              value: _fromUnit,
              units: _units,
              onChanged: (u) {
                setState(() => _fromUnit = u!);
                _convert();
              },
            ),
          ],
        ),
        const SizedBox(height: 12),
        Center(
          child: Icon(Icons.swap_vert_rounded,
              color: AppColors.primary, size: 28),
        ),
        const SizedBox(height: 12),
        // To
        Row(
          children: [
            Expanded(
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: AppColors.primary.withOpacity(0.25)),
                ),
                child: Text(
                  _result != null
                      ? _result! == _result!.roundToDouble()
                          ? _result!.toStringAsFixed(0)
                          : _result!.toStringAsFixed(3)
                      : '—',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            _UnitDropdown(
              value: _toUnit,
              units: _units,
              onChanged: (u) {
                setState(() => _toUnit = u!);
                _convert();
              },
            ),
          ],
        ),
        if (_result == null && _controller.text.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text(
            'No direct conversion available between $_fromUnit and $_toUnit.',
            style: const TextStyle(
                fontSize: 12, color: AppColors.textSecondary),
          ),
        ],
        const SizedBox(height: 32),
        // Quick reference table
        const _SectionLabel(label: 'Quick Reference'),
        const SizedBox(height: 8),
        _ConversionReferenceTable(),
      ],
    );
  }
}

class _UnitDropdown extends StatelessWidget {
  const _UnitDropdown({
    required this.value,
    required this.units,
    required this.onChanged,
  });

  final String value;
  final List<String> units;
  final ValueChanged<String?> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          items: units.map((u) {
            return DropdownMenuItem(
              value: u,
              child: Text(u, style: const TextStyle(fontSize: 14)),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}

class _ConversionReferenceTable extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const rows = [
      ('1 cup', '= 16 tbsp = 48 tsp = 236.6 ml'),
      ('1 tbsp', '= 3 tsp = 14.8 ml'),
      ('1 oz', '= 28.35 g'),
      ('1 lb', '= 16 oz = 453.6 g'),
      ('1 kg', '= 2.205 lb = 1000 g'),
    ];
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          children: rows.map((row) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 5),
              child: Row(
                children: [
                  SizedBox(
                    width: 60,
                    child: Text(row.$1,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 13)),
                  ),
                  Expanded(
                    child: Text(row.$2,
                        style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary)),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w700,
        color: AppColors.textSecondary,
        letterSpacing: 0.3,
      ),
    );
  }
}
