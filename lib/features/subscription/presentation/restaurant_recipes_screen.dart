import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/regions.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../features/profile/domain/profile_provider.dart';
import '../../../features/recipe_generation/domain/chat_provider.dart';

class RestaurantRecipesScreen extends ConsumerStatefulWidget {
  const RestaurantRecipesScreen({super.key});

  @override
  ConsumerState<RestaurantRecipesScreen> createState() =>
      _RestaurantRecipesScreenState();
}

class _RestaurantRecipesScreenState
    extends ConsumerState<RestaurantRecipesScreen> {
  final _searchController = TextEditingController();
  String _query = '';
  bool? _trialUsed;

  @override
  void initState() {
    super.initState();
    _loadTrialStatus();
  }

  Future<void> _loadTrialStatus() async {
    final used = await StorageService.isRestaurantTrialUsed();
    if (mounted) setState(() => _trialUsed = used);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _filteredList {
    if (_query.isEmpty) return restaurantList;
    final lower = _query.toLowerCase();
    return restaurantList
        .where((r) =>
            (r['name'] as String).toLowerCase().contains(lower) ||
            (r['dishes'] as List<String>)
                .any((d) => d.toLowerCase().contains(lower)))
        .toList();
  }

  Future<void> _handleCustomSearch(
    BuildContext context,
    String query,
    bool isPremium,
  ) async {
    if (!isPremium) {
      if (_trialUsed == true) {
        _showPaywall(context);
        return;
      }
      await StorageService.markRestaurantTrialUsed();
      setState(() => _trialUsed = true);
    }

    final prompt =
        'Give me a homemade copycat recipe from $query. Include the most popular signature dish.';

    ref.read(chatProvider.notifier).sendMessage(prompt);

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Searching $query...'),
          duration: const Duration(seconds: 2),
        ),
      );
      Navigator.of(context).pop();
    }
  }

  Future<void> _handleRestaurantTap(
    BuildContext context,
    Map<String, dynamic> restaurant,
    String dish,
    bool isPremium,
  ) async {
    if (!isPremium) {
      if (_trialUsed == true) {
        _showPaywall(context);
        return;
      }
      // Use trial
      await StorageService.markRestaurantTrialUsed();
      setState(() => _trialUsed = true);
    }

    final prompt =
        'Give me a homemade version of $dish from ${restaurant['name']}';

    ref.read(chatProvider.notifier).sendMessage(prompt);

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Asking about $dish...'),
          duration: const Duration(seconds: 2),
        ),
      );
      // Pop back to the home/chat tab so user sees the result
      Navigator.of(context).pop();
    }
  }

  void _showPaywall(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.restaurant_menu,
                size: 48, color: AppColors.primary),
            const SizedBox(height: 12),
            const Text(
              'Unlock Restaurant Recipes',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'You have used your 1 free trial. Upgrade to Premium for unlimited access to all restaurant copycat recipes.',
              textAlign: TextAlign.center,
              style:
                  TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            GradientButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Go Premium — \$4.99/mo'),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Not now'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isPremium = ref.watch(profileProvider).isPremium;
    final filtered = _filteredList;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Restaurant Recipes'),
        centerTitle: false,
        elevation: 0,
        actions: [
          if (!isPremium && _trialUsed == false)
            Container(
              margin: const EdgeInsets.only(right: 12),
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                '1 free trial',
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: (v) => setState(() => _query = v),
              textInputAction: TextInputAction.search,
              onSubmitted: (value) {
                if (value.trim().isNotEmpty) {
                  _handleCustomSearch(context, value.trim(), isPremium);
                }
              },
              decoration: InputDecoration(
                hintText: 'Search any restaurant or dish...',
                prefixIcon: const Icon(Icons.search, size: 20),
                suffixIcon: _searchController.text.isNotEmpty
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Search button — sends custom restaurant query
                          IconButton(
                            icon: const Icon(Icons.send, size: 18, color: AppColors.primary),
                            tooltip: 'Search this restaurant',
                            onPressed: () {
                              if (_searchController.text.trim().isNotEmpty) {
                                _handleCustomSearch(
                                  context,
                                  _searchController.text.trim(),
                                  isPremium,
                                );
                              }
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _query = '');
                            },
                          ),
                        ],
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
          // Hint: type any restaurant
          if (_query.isNotEmpty && _filteredList.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: GlassCard(
                padding: const EdgeInsets.all(14),
                child: InkWell(
                  onTap: () => _handleCustomSearch(context, _query, isPremium),
                  child: Row(
                    children: [
                      const Icon(Icons.restaurant, color: AppColors.primary, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Search "$_query"',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const Text(
                              'Get a homemade copycat recipe from any restaurant',
                              style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.primary),
                    ],
                  ),
                ),
              ),
            ),
          if (!isPremium)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: GlassCard(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                child: Row(
                  children: [
                    const Icon(Icons.star, color: AppColors.primary, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _trialUsed == true
                            ? 'Upgrade to Premium for unlimited copycat recipes.'
                            : 'Tap any dish to use your 1 free trial. Upgrade for unlimited.',
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          // Grid
          Expanded(
            child: filtered.isEmpty
                ? const Center(child: Text('No restaurants match your search.'))
                : GridView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.9,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: filtered.length,
                    itemBuilder: (_, i) {
                      final r = filtered[i];
                      return _RestaurantCard(
                        restaurant: r,
                        isPremium: isPremium,
                        trialUsed: _trialUsed ?? false,
                        onDishTap: (dish) =>
                            _handleRestaurantTap(context, r, dish, isPremium),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Restaurant card
// ---------------------------------------------------------------------------

class _RestaurantCard extends StatelessWidget {
  const _RestaurantCard({
    required this.restaurant,
    required this.isPremium,
    required this.trialUsed,
    required this.onDishTap,
  });

  final Map<String, dynamic> restaurant;
  final bool isPremium;
  final bool trialUsed;
  final ValueChanged<String> onDishTap;

  @override
  Widget build(BuildContext context) {
    final dishes = restaurant['dishes'] as List<String>;
    final isLocked = !isPremium && trialUsed;

    return GlassCard(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  restaurant['name'] as String,
                  style: const TextStyle(
                      fontSize: 14, fontWeight: FontWeight.w700),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (isLocked)
                const Icon(Icons.lock, size: 14, color: AppColors.textSecondary),
            ],
          ),
          const Divider(height: 12),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: dishes.map((dish) {
                return InkWell(
                  onTap: isLocked ? () => onDishTap(dish) : () => onDishTap(dish),
                  borderRadius: BorderRadius.circular(6),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            dish,
                            style: TextStyle(
                              fontSize: 12,
                              color: isLocked
                                  ? AppColors.textSecondary
                                  : null,
                            ),
                          ),
                        ),
                        Icon(
                          Icons.arrow_forward_ios,
                          size: 10,
                          color: AppColors.primary.withOpacity(0.6),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
