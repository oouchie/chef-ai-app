import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../shared/models/models.dart';

class StorageService {
  static const _sessionsKey = 'recipe_pilot_sessions';
  static const _savedRecipesKey = 'recipe_pilot_saved_recipes';
  static const _todosKey = 'recipe_pilot_todos';
  static const _apiKeyKey = 'chef-ai-api-key';
  static const _dailyUsageKey = 'recipepilot_daily_usage';
  static const _restaurantTrialKey = 'recipepilot_restaurant_trial_used';
  static const _selectedRegionKey = 'recipe_pilot_region';

  static SharedPreferences? _prefs;

  static Future<SharedPreferences> get prefs async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  // Sessions
  static Future<List<ChatSession>> getSessions() async {
    final p = await prefs;
    final json = p.getString(_sessionsKey);
    if (json == null) return [];
    final list = jsonDecode(json) as List;
    return list.map((e) => ChatSession.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<void> saveSessions(List<ChatSession> sessions) async {
    final p = await prefs;
    await p.setString(_sessionsKey, jsonEncode(sessions.map((s) => s.toJson()).toList()));
  }

  // Saved Recipes
  static Future<List<Recipe>> getSavedRecipes() async {
    final p = await prefs;
    final json = p.getString(_savedRecipesKey);
    if (json == null) return [];
    final list = jsonDecode(json) as List;
    return list.map((e) => Recipe.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<void> saveSavedRecipes(List<Recipe> recipes) async {
    final p = await prefs;
    await p.setString(_savedRecipesKey, jsonEncode(recipes.map((r) => r.toJson()).toList()));
  }

  // Todos
  static Future<List<TodoItem>> getTodos() async {
    final p = await prefs;
    final json = p.getString(_todosKey);
    if (json == null) return [];
    final list = jsonDecode(json) as List;
    return list.map((e) => TodoItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  static Future<void> saveTodos(List<TodoItem> todos) async {
    final p = await prefs;
    await p.setString(_todosKey, jsonEncode(todos.map((t) => t.toJson()).toList()));
  }

  // API Key
  static Future<String?> getApiKey() async {
    final p = await prefs;
    return p.getString(_apiKeyKey);
  }

  static Future<void> setApiKey(String key) async {
    final p = await prefs;
    await p.setString(_apiKeyKey, key);
  }

  static Future<void> removeApiKey() async {
    final p = await prefs;
    await p.remove(_apiKeyKey);
  }

  // Daily Usage (free tier tracking)
  static Future<({int count, DateTime date})> getDailyUsage() async {
    final p = await prefs;
    final json = p.getString(_dailyUsageKey);
    if (json == null) return (count: 0, date: DateTime.now());

    final data = jsonDecode(json) as Map<String, dynamic>;
    return (
      count: data['count'] as int? ?? 0,
      date: DateTime.parse(data['date'] as String),
    );
  }

  static Future<void> incrementDailyUsage() async {
    final p = await prefs;
    final current = await getDailyUsage();
    final today = DateTime.now();

    final isSameDay = current.date.year == today.year &&
        current.date.month == today.month &&
        current.date.day == today.day;

    final newCount = isSameDay ? current.count + 1 : 1;

    await p.setString(_dailyUsageKey, jsonEncode({
      'count': newCount,
      'date': today.toIso8601String(),
    }));
  }

  // Restaurant trial
  static Future<bool> isRestaurantTrialUsed() async {
    final p = await prefs;
    return p.getBool(_restaurantTrialKey) ?? false;
  }

  static Future<void> markRestaurantTrialUsed() async {
    final p = await prefs;
    await p.setBool(_restaurantTrialKey, true);
  }

  // Selected region
  static Future<String?> getSelectedRegion() async {
    final p = await prefs;
    return p.getString(_selectedRegionKey);
  }

  static Future<void> setSelectedRegion(String? region) async {
    final p = await prefs;
    if (region == null) {
      await p.remove(_selectedRegionKey);
    } else {
      await p.setString(_selectedRegionKey, region);
    }
  }
}
