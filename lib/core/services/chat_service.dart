import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../shared/models/models.dart';
import '../constants/regions.dart';
import 'supabase_service.dart';
import 'storage_service.dart';

class ChatService {
  static final Dio _dio = Dio();

  static const String _systemPrompt = '''You are Chef AI, a friendly and knowledgeable culinary assistant who specializes in world recipes and cooking techniques. You help users discover and cook amazing dishes from around the globe.

When providing recipes:
- Include cultural context and history when relevant
- Provide ingredient substitutions for hard-to-find items
- Consider dietary restrictions when mentioned
- ALWAYS include a recipe JSON block in your response using the exact format below

CRITICAL: You MUST include a recipe block in your response formatted exactly like this:

```recipe
{
  "name": "Recipe Name",
  "region": "region-id",
  "cuisine": "Specific Cuisine",
  "description": "Brief description",
  "prepTime": "15 mins",
  "cookTime": "30 mins",
  "servings": 4,
  "difficulty": "Easy",
  "ingredients": [
    {"name": "ingredient", "amount": "1", "unit": "cup", "notes": "optional notes"}
  ],
  "instructions": [
    "Step 1...",
    "Step 2..."
  ],
  "tips": [
    "Helpful tip 1",
    "Helpful tip 2"
  ],
  "tags": ["tag1", "tag2"]
}
```

The ingredients array is REQUIRED and must contain at least 3-5 ingredients, each with name, amount, and unit fields.

Keep your conversational response brief (2-3 sentences max before the recipe).''';

  static String _buildSystemPrompt(String? regionId) {
    if (regionId == null || regionId == 'all') return _systemPrompt;

    final region = worldRegions.where((r) => r.id == regionId).firstOrNull;
    if (region == null) return _systemPrompt;

    return '$_systemPrompt\n\nThe user is currently exploring ${region.name} cuisine. '
        'Focus on authentic ${region.cuisines.join(", ")} recipes and techniques. '
        'Include regional context and traditional methods when possible.';
  }

  static const String _visionSystemPrompt = '''You are Chef AI, a friendly culinary assistant. The user has sent you a photo of food or ingredients.

Analyze the image carefully:
- If it's a prepared dish: identify it and provide a copycat recipe
- If it's ingredients: suggest what can be made with them
- If it's a restaurant menu item: recreate it as a home recipe

ALWAYS include a recipe JSON block in your response using the exact format:

```recipe
{
  "name": "Recipe Name",
  "region": "region-id",
  "cuisine": "Specific Cuisine",
  "description": "Brief description",
  "prepTime": "15 mins",
  "cookTime": "30 mins",
  "servings": 4,
  "difficulty": "Easy",
  "ingredients": [
    {"name": "ingredient", "amount": "1", "unit": "cup", "notes": "optional notes"}
  ],
  "instructions": ["Step 1...", "Step 2..."],
  "tips": ["Helpful tip 1"],
  "tags": ["tag1", "tag2"]
}
```

Keep your conversational response brief (2-3 sentences max before the recipe).''';

  /// Send message via Supabase Edge Function (preferred — keeps API key server-side)
  static Future<({String text, Recipe? recipe})> sendMessage({
    required String message,
    required List<Message> history,
    String? region,
    String? imageBase64,
  }) async {
    // Path 1: Try Supabase Edge Function (works with or without auth)
    try {
      debugPrint('[ChatService] Trying Supabase Edge Function... (hasImage: ${imageBase64 != null})');
      final historyMaps = history
          .take(10)
          .map((m) => {'role': m.role, 'content': m.content})
          .toList();

      // For images, skip history to reduce payload size
      final result = await SupabaseService.sendChatMessage(
        message: message,
        region: region,
        history: imageBase64 != null ? [] : historyMaps,
        imageBase64: imageBase64,
      );

      if (result.containsKey('error')) {
        throw Exception(result['error']);
      }

      final text = result['text'] as String? ?? '';
      final recipeData = result['recipe'] as Map<String, dynamic>?;
      final recipe = recipeData != null ? Recipe.fromJson(recipeData) : _parseRecipeFromText(text);

      debugPrint('[ChatService] Edge Function success. Recipe: ${recipe != null}');
      return (text: _cleanResponseText(text), recipe: recipe);
    } catch (e) {
      debugPrint('[ChatService] Edge Function failed: $e');
    }

    // Path 2: Direct API call if user has stored API key or built-in key
    final storedKey = await StorageService.getApiKey();
    const builtInKey = String.fromEnvironment(
      'ANTHROPIC_API_KEY',
      defaultValue: '',
    );
    final apiKey = (storedKey != null && storedKey.isNotEmpty)
        ? storedKey
        : builtInKey.isNotEmpty
            ? builtInKey
            : null;

    if (apiKey != null) {
      try {
        debugPrint('[ChatService] Trying direct API...');
        return await _sendDirectApiCall(
          message: message,
          history: history,
          region: region,
          apiKey: apiKey,
          imageBase64: imageBase64,
        );
      } catch (e) {
        debugPrint('[ChatService] Direct API failed: $e');
      }
    }

    // Path 3: Demo mode (no API key available)
    debugPrint('[ChatService] Falling back to demo mode');
    if (imageBase64 != null) {
      return _getImageDemoResponse();
    }
    return _getDemoResponse(message, region);
  }

  static Future<({String text, Recipe? recipe})> _sendDirectApiCall({
    required String message,
    required List<Message> history,
    String? region,
    required String apiKey,
    String? imageBase64,
  }) async {
    final bool hasImage = imageBase64 != null && imageBase64.isNotEmpty;

    // Build user content — text only or multimodal (image + text)
    final dynamic userContent;
    if (hasImage) {
      userContent = [
        {
          'type': 'image',
          'source': {
            'type': 'base64',
            'media_type': 'image/jpeg',
            'data': imageBase64,
          },
        },
        {
          'type': 'text',
          'text': message.isNotEmpty ? message : 'What is this? Give me a recipe.',
        },
      ];
    } else {
      userContent = message;
    }

    final messages = [
      ...history.take(10).map((m) => {
            'role': m.role,
            'content': m.content,
          }),
      {'role': 'user', 'content': userContent},
    ];

    final response = await _dio.post(
      'https://api.anthropic.com/v1/messages',
      options: Options(
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      ),
      data: {
        'model': 'claude-sonnet-4-20250514',
        'max_tokens': 2048,
        'system': hasImage ? _visionSystemPrompt : _buildSystemPrompt(region),
        'messages': messages,
      },
    );

    final content = response.data['content'] as List;
    final text = content.first['text'] as String;
    final recipe = _parseRecipeFromText(text);

    return (text: _cleanResponseText(text), recipe: recipe);
  }

  static Recipe? _parseRecipeFromText(String text) {
    final recipeRegex = RegExp(r'```recipe\s*([\s\S]*?)```');
    final match = recipeRegex.firstMatch(text);
    if (match == null) return null;

    try {
      final jsonStr = match.group(1)!.trim();
      final data = jsonDecode(jsonStr) as Map<String, dynamic>;

      // Handle ingredients that might be strings instead of objects
      if (data['ingredients'] is List) {
        data['ingredients'] = (data['ingredients'] as List).map((item) {
          if (item is String) {
            return {'name': item, 'amount': '', 'unit': ''};
          }
          return item;
        }).toList();
      }

      return Recipe.fromJson(data);
    } catch (_) {
      return null;
    }
  }

  static String _cleanResponseText(String text) {
    return text.replaceAll(RegExp(r'```recipe[\s\S]*?```'), '').trim();
  }

  // Demo response for image submissions when no API key is available
  static ({String text, Recipe? recipe}) _getImageDemoResponse() {
    return (
      text:
          "I can see your photo! To analyze images and generate recipes from them, "
          "please add your Claude API key in Profile → Settings. "
          "With an API key, I can identify ingredients, dishes, and create recipes from any photo.",
      recipe: null,
    );
  }

  // Demo mode responses
  static ({String text, Recipe? recipe}) _getDemoResponse(
      String message, String? region) {
    final lower = message.toLowerCase();

    if (lower.contains('chicken') && lower.contains('rice')) {
      return (text: _demoRecipes[0].$1, recipe: _demoRecipes[0].$2);
    }
    if (lower.contains('vegetarian') || lower.contains('vegan')) {
      return (text: _demoRecipes[1].$1, recipe: _demoRecipes[1].$2);
    }
    if (lower.contains('italian') || lower.contains('pasta')) {
      return (text: _demoRecipes[2].$1, recipe: _demoRecipes[2].$2);
    }

    return (text: _demoRecipes[3].$1, recipe: _demoRecipes[3].$2);
  }

  static final _demoRecipes = <(String, Recipe)>[
    (
      "Here's a delicious garlic butter chicken with herb rice! This French-inspired dish is simple yet elegant.",
      const Recipe(
        name: 'Garlic Butter Chicken with Herb Rice',
        region: 'european',
        cuisine: 'French-inspired',
        description: 'Tender chicken in a rich garlic butter sauce over fragrant herb rice.',
        prepTime: '10 mins',
        cookTime: '25 mins',
        servings: 4,
        difficulty: 'Easy',
        ingredients: [
          Ingredient(name: 'Chicken breasts', amount: '4', unit: 'pieces'),
          Ingredient(name: 'Butter', amount: '3', unit: 'tbsp'),
          Ingredient(name: 'Garlic cloves', amount: '6', unit: 'cloves', notes: 'minced'),
          Ingredient(name: 'White rice', amount: '2', unit: 'cups'),
          Ingredient(name: 'Chicken broth', amount: '3', unit: 'cups'),
          Ingredient(name: 'Fresh parsley', amount: '1/4', unit: 'cup', notes: 'chopped'),
          Ingredient(name: 'Fresh thyme', amount: '1', unit: 'tbsp'),
          Ingredient(name: 'Lemon', amount: '1', unit: 'whole'),
          Ingredient(name: 'Olive oil', amount: '2', unit: 'tbsp'),
          Ingredient(name: 'Salt and pepper', amount: '', unit: 'to taste'),
        ],
        instructions: [
          'Season chicken breasts with salt, pepper, and thyme.',
          'Heat olive oil in a large skillet over medium-high heat.',
          'Cook chicken 6-7 minutes per side until golden and cooked through. Set aside.',
          'In the same pan, melt butter and sauté garlic for 1 minute.',
          'Cook rice in chicken broth according to package directions.',
          'Fluff rice with a fork and stir in parsley.',
          'Slice chicken and serve over herb rice with garlic butter sauce.',
          'Squeeze fresh lemon over the top before serving.',
        ],
        tips: [
          'Pound chicken to even thickness for uniform cooking.',
          "Don't overcrowd the pan — cook in batches if needed.",
          'Let chicken rest 5 minutes before slicing.',
        ],
        tags: ['chicken', 'rice', 'garlic', 'butter', 'french', 'easy'],
      ),
    ),
    (
      "This hearty vegetarian curry is packed with flavor! It's a crowd-pleaser even for meat lovers.",
      const Recipe(
        name: 'Spiced Chickpea & Vegetable Curry',
        region: 'asian',
        cuisine: 'Indian',
        description: 'A rich, aromatic curry loaded with chickpeas and vegetables in coconut sauce.',
        prepTime: '15 mins',
        cookTime: '30 mins',
        servings: 4,
        difficulty: 'Easy',
        ingredients: [
          Ingredient(name: 'Chickpeas', amount: '2', unit: 'cans', notes: 'drained'),
          Ingredient(name: 'Coconut milk', amount: '1', unit: 'can'),
          Ingredient(name: 'Diced tomatoes', amount: '1', unit: 'can'),
          Ingredient(name: 'Onion', amount: '1', unit: 'large', notes: 'diced'),
          Ingredient(name: 'Garlic', amount: '4', unit: 'cloves', notes: 'minced'),
          Ingredient(name: 'Fresh ginger', amount: '1', unit: 'tbsp', notes: 'grated'),
          Ingredient(name: 'Curry powder', amount: '2', unit: 'tbsp'),
          Ingredient(name: 'Cumin', amount: '1', unit: 'tsp'),
          Ingredient(name: 'Turmeric', amount: '1', unit: 'tsp'),
          Ingredient(name: 'Spinach', amount: '3', unit: 'cups'),
          Ingredient(name: 'Bell pepper', amount: '1', unit: 'large', notes: 'diced'),
          Ingredient(name: 'Vegetable oil', amount: '2', unit: 'tbsp'),
          Ingredient(name: 'Basmati rice', amount: '2', unit: 'cups', notes: 'for serving'),
          Ingredient(name: 'Fresh cilantro', amount: '1/4', unit: 'cup'),
        ],
        instructions: [
          'Heat oil in a large pot over medium heat. Sauté onion until softened.',
          'Add garlic, ginger, curry powder, cumin, and turmeric. Cook 1 minute.',
          'Add diced tomatoes and coconut milk. Stir to combine.',
          'Add chickpeas and bell pepper. Bring to a simmer.',
          'Cook for 20 minutes, stirring occasionally.',
          'Stir in spinach and cook until wilted.',
          'Serve over basmati rice, garnished with fresh cilantro.',
        ],
        tips: [
          'Toast spices in dry pan first for deeper flavor.',
          'Add a squeeze of lime for brightness.',
          'This curry tastes even better the next day!',
        ],
        tags: ['vegetarian', 'curry', 'chickpea', 'indian', 'vegan', 'healthy'],
      ),
    ),
    (
      "Nothing beats a classic carbonara! Here's the authentic Roman version — no cream needed.",
      const Recipe(
        name: 'Classic Spaghetti Carbonara',
        region: 'european',
        cuisine: 'Italian',
        description: 'Authentic Roman carbonara with eggs, pecorino, guanciale, and black pepper.',
        prepTime: '10 mins',
        cookTime: '15 mins',
        servings: 4,
        difficulty: 'Medium',
        ingredients: [
          Ingredient(name: 'Spaghetti', amount: '1', unit: 'lb'),
          Ingredient(name: 'Guanciale', amount: '8', unit: 'oz', notes: 'or pancetta'),
          Ingredient(name: 'Egg yolks', amount: '4', unit: 'large'),
          Ingredient(name: 'Whole eggs', amount: '2', unit: 'large'),
          Ingredient(name: 'Pecorino Romano', amount: '1', unit: 'cup', notes: 'finely grated'),
          Ingredient(name: 'Black pepper', amount: '2', unit: 'tsp', notes: 'freshly cracked'),
          Ingredient(name: 'Pasta water', amount: '1', unit: 'cup', notes: 'reserved'),
          Ingredient(name: 'Salt', amount: '', unit: 'for pasta water'),
        ],
        instructions: [
          'Bring a large pot of salted water to a boil. Cook spaghetti until al dente.',
          'While pasta cooks, cut guanciale into small strips.',
          'Cook guanciale in a cold pan, slowly rendering the fat until crispy.',
          'Whisk egg yolks, whole eggs, and pecorino together in a bowl.',
          'Reserve 1 cup pasta water, then drain spaghetti.',
          'Remove guanciale pan from heat. Add hot pasta and toss.',
          'Quickly add egg mixture, tossing constantly (off heat!) to create a creamy sauce.',
          'Add pasta water a splash at a time if too thick. Season with black pepper.',
        ],
        tips: [
          'NEVER add the egg mixture over direct heat — it will scramble.',
          'Use pecorino, not parmesan, for authentic flavor.',
          'The pasta water starch is key to the silky sauce.',
        ],
        tags: ['pasta', 'italian', 'carbonara', 'classic', 'roman'],
      ),
    ),
    (
      "Here's a versatile stir-fry that's ready in no time! Feel free to swap in whatever veggies you have.",
      const Recipe(
        name: "Chef's Signature Stir-Fry",
        region: 'asian',
        cuisine: 'Asian Fusion',
        description: 'A quick and flavorful stir-fry with a savory sauce you can customize endlessly.',
        prepTime: '15 mins',
        cookTime: '10 mins',
        servings: 4,
        difficulty: 'Easy',
        ingredients: [
          Ingredient(name: 'Protein of choice', amount: '1', unit: 'lb', notes: 'chicken, tofu, or shrimp'),
          Ingredient(name: 'Mixed vegetables', amount: '4', unit: 'cups', notes: 'broccoli, bell pepper, snap peas'),
          Ingredient(name: 'Soy sauce', amount: '3', unit: 'tbsp'),
          Ingredient(name: 'Sesame oil', amount: '1', unit: 'tbsp'),
          Ingredient(name: 'Rice vinegar', amount: '1', unit: 'tbsp'),
          Ingredient(name: 'Honey', amount: '1', unit: 'tbsp'),
          Ingredient(name: 'Garlic', amount: '3', unit: 'cloves', notes: 'minced'),
          Ingredient(name: 'Ginger', amount: '1', unit: 'tbsp', notes: 'grated'),
          Ingredient(name: 'Cornstarch', amount: '1', unit: 'tbsp', notes: 'mixed with 2 tbsp water'),
          Ingredient(name: 'Cooked rice', amount: '3', unit: 'cups', notes: 'for serving'),
        ],
        instructions: [
          'Mix soy sauce, sesame oil, rice vinegar, and honey for the sauce.',
          'Heat a wok or large skillet over high heat.',
          'Cook protein until done. Remove and set aside.',
          'Stir-fry vegetables for 2-3 minutes until crisp-tender.',
          'Add garlic and ginger, cook 30 seconds.',
          'Return protein to the wok. Pour sauce over.',
          'Add cornstarch slurry and toss until sauce thickens.',
          'Serve immediately over hot rice.',
        ],
        tips: [
          'High heat is essential — the wok should be smoking.',
          'Cut all ingredients the same size for even cooking.',
          'Prep everything before you start — stir-frying is fast!',
        ],
        tags: ['stir-fry', 'asian', 'quick', 'versatile', 'easy'],
      ),
    ),
  ];
}
