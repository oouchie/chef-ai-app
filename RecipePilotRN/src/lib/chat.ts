import { Recipe, WorldRegion, WORLD_REGIONS } from '@/types';
import { getStoredApiKey, setStoredApiKey, removeStoredApiKey } from './storage';

interface ChatResponse {
  response: string;
  recipe: Recipe | null;
  isDemo: boolean;
}

// Call Anthropic API directly
export async function sendChatMessage(
  message: string,
  region: WorldRegion | 'all',
  conversationHistory: { role: string; content: string }[],
  apiKey?: string
): Promise<ChatResponse> {
  console.log('========== CHAT FUNCTION CALLED ==========');
  console.log('Message:', message);
  console.log('Region:', region);
  console.log('Has API Key:', !!apiKey);

  // If no API key, use demo mode
  if (!apiKey) {
    const demoRecipe = generateDemoRecipe(message, region);
    console.log('DEMO MODE - Recipe generated:', demoRecipe?.name);
    return {
      response: generateDemoResponse(message, region),
      recipe: demoRecipe,
      isDemo: true,
    };
  }

  try {
    const regionInfo = region !== 'all'
      ? WORLD_REGIONS.find(r => r.id === region)
      : null;

    const systemPrompt = `You are Chef AI, a friendly and knowledgeable culinary assistant who helps home cooks discover and master recipes from around the world.

Your personality:
- Warm, encouraging, and passionate about food
- Share interesting cultural context about dishes
- Offer practical tips for home cooks
- Suggest ingredient substitutions when appropriate
- Consider dietary restrictions when mentioned

${regionInfo ? `The user is currently exploring ${regionInfo.name} cuisine (${regionInfo.cuisines.join(', ')}).` : 'The user is exploring cuisines from all regions.'}

When recommending a recipe, you MUST include a JSON block with the recipe details in this exact format:
\`\`\`recipe
{
  "name": "Recipe Name",
  "region": "asian|african|european|latin-american|middle-eastern|southern|soul-food|cajun-creole|tex-mex|bbq|new-england|midwest|oceanian|caribbean",
  "cuisine": "Specific Cuisine (e.g., Italian, Thai)",
  "description": "Brief appetizing description",
  "prepTime": "15 mins",
  "cookTime": "30 mins",
  "servings": 4,
  "difficulty": "Easy|Medium|Hard",
  "ingredients": [
    {"name": "chicken breast", "amount": "2", "unit": "lbs", "notes": "boneless, skinless"},
    {"name": "olive oil", "amount": "2", "unit": "tbsp", "notes": ""},
    {"name": "garlic", "amount": "4", "unit": "cloves", "notes": "minced"}
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"],
  "tags": ["tag1", "tag2"]
}
\`\`\`

CRITICAL REQUIREMENTS:
- The "ingredients" array is REQUIRED and must contain at least 3-5 ingredient objects
- Each ingredient MUST have "name", "amount", and "unit" fields (notes is optional)
- Never skip the ingredients array - users need this for their shopping list
- Include ALL ingredients needed to make the dish

Guidelines:
- Keep responses conversational but informative
- ALWAYS include the recipe JSON block when sharing a specific recipe
- Offer to modify recipes based on dietary needs
- Share cooking tips and cultural background
- Be encouraging to beginner cooks`;

    const messages = [
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API error:', await response.text());
      return {
        response: generateDemoResponse(message, region),
        recipe: generateDemoRecipe(message, region),
        isDemo: true,
      };
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    // Extract recipe from response if present
    const recipeMatch = content.match(/```recipe\s*([\s\S]*?)\s*```/);
    let recipe: Recipe | null = null;

    if (recipeMatch) {
      try {
        const recipeData = JSON.parse(recipeMatch[1]);

        // Process ingredients
        let processedIngredients: { name: string; amount: string; unit: string; notes?: string }[] = [];
        if (Array.isArray(recipeData.ingredients)) {
          processedIngredients = recipeData.ingredients.map((ing: unknown) => {
            if (typeof ing === 'object' && ing !== null) {
              const ingObj = ing as Record<string, unknown>;
              return {
                name: String(ingObj.name || ingObj.ingredient || 'Unknown'),
                amount: String(ingObj.amount || ingObj.quantity || '1'),
                unit: String(ingObj.unit || ''),
                notes: ingObj.notes ? String(ingObj.notes) : undefined,
              };
            }
            if (typeof ing === 'string') {
              return { name: ing, amount: '1', unit: '', notes: undefined };
            }
            return { name: 'Unknown ingredient', amount: '1', unit: '', notes: undefined };
          });
        }

        recipe = {
          id: `recipe-${Date.now()}`,
          name: recipeData.name || 'Unnamed Recipe',
          region: recipeData.region || 'european',
          cuisine: recipeData.cuisine || 'International',
          description: recipeData.description || '',
          prepTime: recipeData.prepTime || '',
          cookTime: recipeData.cookTime || '',
          servings: recipeData.servings || 4,
          difficulty: recipeData.difficulty || 'Medium',
          ingredients: processedIngredients,
          instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
          tips: Array.isArray(recipeData.tips) ? recipeData.tips : [],
          tags: Array.isArray(recipeData.tags) ? recipeData.tags : [],
        };
      } catch (e) {
        console.error('Failed to parse recipe JSON:', e);
      }
    }

    // Clean up the response text
    const cleanResponse = content.replace(/```recipe[\s\S]*?```/g, '').trim();

    return {
      response: cleanResponse,
      recipe,
      isDemo: false,
    };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      response: generateDemoResponse(message, region),
      recipe: generateDemoRecipe(message, region),
      isDemo: true,
    };
  }
}

function generateDemoResponse(message: string, region?: WorldRegion | 'all'): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm Chef AI, your personal culinary assistant. I'm here to help you discover amazing recipes from around the world! What are you in the mood for today?\n\n(Demo mode - Add your Anthropic API key in Settings for AI responses)";
  }

  if (lowerMessage.includes('chicken') || lowerMessage.includes('rice')) {
    return "Great choice! Chicken and rice is a beloved combination across many cultures. I have a delicious recipe for you - check out this classic dish that's both comforting and flavorful.";
  }

  if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
    return "I love cooking plant-based meals! There are so many delicious vegetarian options from around the world. Let me share a recipe that's packed with flavor and nutrition.";
  }

  if (lowerMessage.includes('quick') || lowerMessage.includes('fast') || lowerMessage.includes('30 minute')) {
    return "I understand - sometimes we need delicious food fast! Here's a recipe that comes together quickly without sacrificing flavor.";
  }

  if (lowerMessage.includes('italian') || lowerMessage.includes('pasta')) {
    return "Ah, Italian cuisine - one of my favorites! The beauty of Italian cooking lies in its simplicity and quality ingredients.";
  }

  const regionResponses: Record<string, string> = {
    'asian': "Asian cuisine is incredibly diverse! From umami-rich dishes to aromatic curries, there's so much to explore.",
    'african': "African cuisine is full of bold, complex flavors and rich culinary traditions.",
    'european': "European cooking offers wonderful variety - from rustic French dishes to hearty German meals.",
    'latin-american': "Latin American food is vibrant, colorful, and full of life!",
    'middle-eastern': "Middle Eastern cuisine features beautiful aromatic spices and time-honored techniques.",
    'southern': "Southern cooking is all about comfort and hospitality!",
    'soul-food': "Soul food carries deep cultural roots and incredible flavor!",
    'cajun-creole': "Louisiana cooking is a celebration of bold spices and rich flavors!",
    'tex-mex': "Tex-Mex is the perfect fusion of Texas and Mexican flavors!",
    'bbq': "American BBQ is an art form! Low-and-slow smoking creates incredible flavors.",
    'new-england': "New England cuisine celebrates the bounty of the Atlantic coast!",
    'midwest': "Midwest cooking is hearty, comforting, and delicious!",
    'oceanian': "Oceanian cuisine celebrates fresh seafood and tropical flavors.",
    'caribbean': "Caribbean food is a beautiful fusion of cultures and flavors!",
  };

  if (region && region !== 'all' && regionResponses[region]) {
    return regionResponses[region];
  }

  return "That sounds delicious! Let me find the perfect recipe for you.\n\n(Demo mode - Add your Anthropic API key in Settings for AI responses)";
}

function generateDemoRecipe(message: string, region?: WorldRegion | 'all'): Recipe | null {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('chicken') || lowerMessage.includes('rice')) {
    return {
      id: `recipe-${Date.now()}`,
      name: "Garlic Butter Chicken with Herb Rice",
      region: region !== 'all' ? region as WorldRegion : 'european',
      cuisine: "French-inspired",
      description: "Juicy pan-seared chicken thighs in a rich garlic butter sauce, served over fluffy herb-infused rice.",
      prepTime: "15 mins",
      cookTime: "35 mins",
      servings: 4,
      difficulty: "Easy",
      ingredients: [
        { name: "chicken thighs", amount: "4", unit: "pieces", notes: "bone-in, skin-on" },
        { name: "butter", amount: "4", unit: "tbsp" },
        { name: "garlic", amount: "6", unit: "cloves", notes: "minced" },
        { name: "chicken broth", amount: "1", unit: "cup" },
        { name: "heavy cream", amount: "1/2", unit: "cup" },
        { name: "long grain rice", amount: "1.5", unit: "cups" },
        { name: "fresh thyme", amount: "2", unit: "sprigs" },
        { name: "fresh parsley", amount: "2", unit: "tbsp", notes: "chopped" },
        { name: "salt", amount: "to", unit: "taste" },
        { name: "black pepper", amount: "to", unit: "taste" },
      ],
      instructions: [
        "Season chicken thighs generously with salt and pepper on both sides.",
        "Heat a large skillet over medium-high heat. Add 2 tbsp butter and sear chicken skin-side down for 6-7 minutes until golden.",
        "Flip chicken and cook another 5 minutes. Remove and set aside.",
        "In the same pan, add remaining butter and garlic. Sauté for 1 minute until fragrant.",
        "Add chicken broth, scraping up any browned bits. Add cream and bring to a simmer.",
        "Return chicken to pan, cover, and cook for 15-20 minutes until internal temp reaches 165°F.",
        "Meanwhile, cook rice according to package directions, adding thyme sprigs to the water.",
        "Fluff rice with a fork, remove thyme, and stir in parsley.",
        "Serve chicken over herb rice, spooning sauce generously over top.",
      ],
      tips: [
        "Pat chicken dry before seasoning for crispier skin",
        "Don't move the chicken while it's searing",
        "You can substitute thyme with rosemary",
      ],
      tags: ["chicken", "comfort food", "dinner", "one-pan", "creamy"],
    };
  }

  if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
    return {
      id: `recipe-${Date.now()}`,
      name: "Spiced Chickpea & Vegetable Curry",
      region: "asian",
      cuisine: "Indian",
      description: "A warming, aromatic curry loaded with chickpeas and seasonal vegetables in a creamy coconut sauce.",
      prepTime: "15 mins",
      cookTime: "30 mins",
      servings: 4,
      difficulty: "Easy",
      ingredients: [
        { name: "chickpeas", amount: "2", unit: "cans", notes: "drained and rinsed" },
        { name: "coconut milk", amount: "1", unit: "can", notes: "full fat" },
        { name: "diced tomatoes", amount: "1", unit: "can" },
        { name: "onion", amount: "1", unit: "large", notes: "diced" },
        { name: "garlic", amount: "4", unit: "cloves", notes: "minced" },
        { name: "ginger", amount: "1", unit: "inch", notes: "grated" },
        { name: "spinach", amount: "4", unit: "cups" },
        { name: "curry powder", amount: "2", unit: "tbsp" },
        { name: "garam masala", amount: "1", unit: "tsp" },
        { name: "cumin", amount: "1", unit: "tsp" },
      ],
      instructions: [
        "Heat oil in a large pot over medium heat. Add onion and cook until softened.",
        "Add garlic and ginger, cook for 1 minute until fragrant.",
        "Stir in curry powder, garam masala, and cumin. Toast spices for 30 seconds.",
        "Add diced tomatoes and cook for 3 minutes.",
        "Pour in coconut milk and bring to a simmer.",
        "Add chickpeas and cook for 15 minutes.",
        "Stir in spinach and cook until wilted.",
        "Season with salt to taste.",
        "Serve over basmati rice.",
      ],
      tips: [
        "Toast your spices for deeper flavor",
        "Add a squeeze of lime juice at the end",
        "This curry tastes even better the next day",
      ],
      tags: ["vegetarian", "vegan", "curry", "healthy", "indian"],
    };
  }

  // Default recipe
  return {
    id: `recipe-${Date.now()}`,
    name: "Chef's Signature Stir-Fry",
    region: region !== 'all' ? region as WorldRegion : 'asian',
    cuisine: "Asian Fusion",
    description: "A quick and flavorful stir-fry with your choice of protein and fresh vegetables.",
    prepTime: "15 mins",
    cookTime: "15 mins",
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      { name: "protein of choice", amount: "1", unit: "lb", notes: "chicken, beef, tofu, or shrimp" },
      { name: "mixed vegetables", amount: "4", unit: "cups", notes: "broccoli, bell peppers, snap peas" },
      { name: "garlic", amount: "4", unit: "cloves", notes: "minced" },
      { name: "ginger", amount: "1", unit: "tbsp", notes: "grated" },
      { name: "soy sauce", amount: "3", unit: "tbsp" },
      { name: "sesame oil", amount: "1", unit: "tbsp" },
      { name: "vegetable oil", amount: "2", unit: "tbsp" },
      { name: "cornstarch", amount: "1", unit: "tbsp" },
      { name: "green onions", amount: "3", unit: "stalks", notes: "sliced" },
    ],
    instructions: [
      "Cut protein into bite-sized pieces. Toss with 1 tbsp soy sauce.",
      "Mix remaining soy sauce, sesame oil, cornstarch, and water for the sauce.",
      "Heat vegetable oil in a wok over high heat.",
      "Stir-fry protein until cooked. Remove and set aside.",
      "Stir-fry vegetables for 3-4 minutes until crisp-tender.",
      "Add garlic and ginger, cook 30 seconds.",
      "Return protein to pan and pour sauce over.",
      "Cook 1-2 minutes until sauce thickens.",
      "Garnish with green onions and serve.",
    ],
    tips: [
      "Have all ingredients prepped before you start",
      "Don't overcrowd the pan",
      "The wok should be smoking hot for the best sear",
    ],
    tags: ["stir-fry", "quick", "versatile", "asian", "healthy"],
  };
}

// Re-export storage functions for API key
export { getStoredApiKey, setStoredApiKey, removeStoredApiKey };
