import { Recipe, WorldRegion, WORLD_REGIONS } from '@/types';

interface ChatResponse {
  response: string;
  recipe: Recipe | null;
  isDemo: boolean;
}

// Call Anthropic API directly from client
export async function sendChatMessage(
  message: string,
  region: WorldRegion | 'all',
  conversationHistory: { role: string; content: string }[],
  apiKey?: string
): Promise<ChatResponse> {
  // If no API key, use demo mode
  if (!apiKey) {
    return {
      response: generateDemoResponse(message, region),
      recipe: generateDemoRecipe(message, region),
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

When recommending a recipe, ALWAYS include a JSON block with the recipe details in this exact format:
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
    {"name": "ingredient", "amount": "1", "unit": "cup", "notes": "optional notes"}
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"],
  "tags": ["tag1", "tag2"]
}
\`\`\`

Guidelines:
- Keep responses conversational but informative
- Include the recipe JSON block when sharing a specific recipe
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
        recipe = {
          id: `recipe-${Date.now()}`,
          ...recipeData,
        };
      } catch {
        console.error('Failed to parse recipe JSON');
      }
    }

    // Clean up the response text (remove recipe JSON block)
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
    return "Hello! I'm Chef AI, your personal culinary assistant. I'm here to help you discover amazing recipes from around the world! What are you in the mood for today? You can ask me for recipes by cuisine, ingredients you have on hand, or dietary preferences.\n\n(Demo mode - Add your Anthropic API key in Settings for AI responses)";
  }

  if (lowerMessage.includes('chicken') || lowerMessage.includes('rice')) {
    return "Great choice! Chicken and rice is a beloved combination across many cultures. I have a delicious recipe for you - check out this classic dish that's both comforting and flavorful. The key is to properly season the chicken and let the rice absorb all those wonderful flavors.";
  }

  if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
    return "I love cooking plant-based meals! There are so many delicious vegetarian options from around the world. Let me share a recipe that's packed with flavor and nutrition. This dish proves that meat-free cooking can be incredibly satisfying!";
  }

  if (lowerMessage.includes('quick') || lowerMessage.includes('fast') || lowerMessage.includes('30 minute')) {
    return "I understand - sometimes we need delicious food fast! Here's a recipe that comes together in about 30 minutes without sacrificing flavor. It's perfect for busy weeknights when you still want something homemade and satisfying.";
  }

  if (lowerMessage.includes('italian') || lowerMessage.includes('pasta')) {
    return "Ah, Italian cuisine - one of my favorites! The beauty of Italian cooking lies in its simplicity and quality ingredients. Let me share an authentic recipe that captures the essence of Italian home cooking.";
  }

  const regionResponses: Record<string, string> = {
    'asian': "Asian cuisine is incredibly diverse! From the umami-rich dishes of Japan to the aromatic curries of Thailand, there's so much to explore. Let me share a recipe that captures the beautiful flavors of this region.",
    'african': "African cuisine is full of bold, complex flavors and rich culinary traditions. From the spiced stews of Ethiopia to the aromatic tagines of Morocco, let me introduce you to something special.",
    'european': "European cooking offers such wonderful variety - from rustic French country dishes to hearty German meals. I have a classic recipe that showcases the best of European culinary traditions.",
    'latin-american': "Latin American food is vibrant, colorful, and full of life! The combination of fresh ingredients and bold spices creates unforgettable dishes. Let me share something delicious with you.",
    'middle-eastern': "Middle Eastern cuisine features beautiful aromatic spices and time-honored cooking techniques. From mezze spreads to grilled meats, the flavors are absolutely wonderful.",
    'southern': "Southern cooking is all about comfort and hospitality! Think crispy fried chicken, fluffy biscuits, creamy grits, and that famous sweet tea. Let me share a recipe that'll warm your soul.",
    'soul-food': "Soul food carries deep cultural roots and incredible flavor! These recipes have been passed down through generations, from collard greens to mac and cheese to candied yams. Let me share something special.",
    'cajun-creole': "Louisiana cooking is a celebration of bold spices and rich flavors! From gumbo to jambalaya to crawfish étouffée, Cajun and Creole cuisines are truly unique. Let me take you to the Bayou!",
    'tex-mex': "Tex-Mex is the perfect fusion of Texas and Mexican flavors! Think sizzling fajitas, cheesy enchiladas, and that addictive queso. Let me share a recipe that brings the border flavors to your kitchen.",
    'bbq': "American BBQ is an art form! Whether it's Texas brisket, Carolina pulled pork, or Memphis ribs, the low-and-slow smoking tradition creates incredible flavors. Let me share some pitmaster secrets.",
    'new-england': "New England cuisine celebrates the bounty of the Atlantic coast! From creamy clam chowder to buttery lobster rolls, these dishes are coastal classics. Let me share something from the Northeast.",
    'midwest': "Midwest cooking is hearty, comforting, and delicious! Think cheese curds, hotdish casseroles, and farm-fresh flavors. Let me share a recipe that captures that heartland hospitality.",
    'oceanian': "Oceanian cuisine celebrates fresh seafood and tropical flavors. The cooking traditions of Australia, New Zealand, and the Pacific Islands offer unique and delicious dishes.",
    'caribbean': "Caribbean food is a beautiful fusion of African, European, and indigenous influences. The bold spices and tropical ingredients create incredibly flavorful dishes!",
  };

  if (region && region !== 'all' && regionResponses[region]) {
    return regionResponses[region];
  }

  return "That sounds delicious! Let me find the perfect recipe for you. I'll include all the details you need - ingredients, step-by-step instructions, and some tips to make sure it turns out perfectly.\n\n(Demo mode - Add your Anthropic API key in Settings for AI responses)";
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
        "Don't move the chicken while it's searing - let it develop a golden crust",
        "You can substitute thyme with rosemary for a different flavor profile",
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
        { name: "turmeric", amount: "1/2", unit: "tsp" },
        { name: "vegetable oil", amount: "2", unit: "tbsp" },
        { name: "salt", amount: "to", unit: "taste" },
        { name: "fresh cilantro", amount: "for", unit: "garnish" },
      ],
      instructions: [
        "Heat oil in a large pot over medium heat. Add onion and cook until softened, about 5 minutes.",
        "Add garlic and ginger, cook for 1 minute until fragrant.",
        "Stir in curry powder, garam masala, cumin, and turmeric. Toast spices for 30 seconds.",
        "Add diced tomatoes and cook for 3 minutes, stirring occasionally.",
        "Pour in coconut milk and bring to a simmer.",
        "Add chickpeas and cook for 15 minutes, allowing flavors to meld.",
        "Stir in spinach and cook until wilted, about 2 minutes.",
        "Season with salt to taste.",
        "Serve over basmati rice, garnished with fresh cilantro.",
      ],
      tips: [
        "Toast your spices in a dry pan first for deeper flavor",
        "Add a squeeze of lime juice at the end for brightness",
        "This curry tastes even better the next day as flavors develop",
      ],
      tags: ["vegetarian", "vegan", "curry", "healthy", "indian", "plant-based"],
    };
  }

  if (lowerMessage.includes('italian') || lowerMessage.includes('pasta')) {
    return {
      id: `recipe-${Date.now()}`,
      name: "Classic Spaghetti Carbonara",
      region: "european",
      cuisine: "Italian",
      description: "An authentic Roman pasta dish with a silky egg and cheese sauce, crispy guanciale, and freshly cracked black pepper.",
      prepTime: "10 mins",
      cookTime: "20 mins",
      servings: 4,
      difficulty: "Medium",
      ingredients: [
        { name: "spaghetti", amount: "400", unit: "g" },
        { name: "guanciale", amount: "200", unit: "g", notes: "or pancetta" },
        { name: "egg yolks", amount: "4", unit: "large" },
        { name: "whole egg", amount: "1", unit: "large" },
        { name: "Pecorino Romano", amount: "100", unit: "g", notes: "finely grated" },
        { name: "Parmigiano Reggiano", amount: "50", unit: "g", notes: "finely grated" },
        { name: "black pepper", amount: "2", unit: "tsp", notes: "freshly ground" },
        { name: "salt", amount: "for", unit: "pasta water" },
      ],
      instructions: [
        "Bring a large pot of salted water to boil. Cook spaghetti until al dente.",
        "While pasta cooks, cut guanciale into small strips or cubes.",
        "In a bowl, whisk together egg yolks, whole egg, both cheeses, and 1 tsp black pepper.",
        "Cook guanciale in a large cold pan over medium heat until fat renders and meat is crispy, about 8 minutes.",
        "Reserve 1 cup pasta water, then drain pasta.",
        "Remove guanciale pan from heat. Add hot pasta and toss to coat in the fat.",
        "Working quickly, pour egg mixture over pasta and toss vigorously. The residual heat will create a creamy sauce.",
        "Add pasta water a splash at a time if needed for silkiness.",
        "Serve immediately with extra cheese and black pepper.",
      ],
      tips: [
        "Never add the egg mixture while the pan is on heat - it will scramble",
        "The pasta must be hot enough to cook the eggs but not scramble them",
        "Authentic carbonara has NO cream - the creaminess comes from the eggs and cheese",
      ],
      tags: ["pasta", "italian", "authentic", "quick", "classic"],
    };
  }

  // Default recipe
  return {
    id: `recipe-${Date.now()}`,
    name: "Chef's Signature Stir-Fry",
    region: region !== 'all' ? region as WorldRegion : 'asian',
    cuisine: "Asian Fusion",
    description: "A quick and flavorful stir-fry with your choice of protein and fresh vegetables in a savory sauce.",
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
      { name: "water", amount: "2", unit: "tbsp" },
      { name: "green onions", amount: "3", unit: "stalks", notes: "sliced" },
    ],
    instructions: [
      "Cut protein into bite-sized pieces. Toss with 1 tbsp soy sauce.",
      "Mix remaining soy sauce, sesame oil, cornstarch, and water for the sauce.",
      "Heat vegetable oil in a wok or large skillet over high heat.",
      "Stir-fry protein until cooked through. Remove and set aside.",
      "Add more oil if needed. Stir-fry vegetables for 3-4 minutes until crisp-tender.",
      "Add garlic and ginger, cook 30 seconds until fragrant.",
      "Return protein to pan. Pour sauce over and toss to coat.",
      "Cook 1-2 minutes until sauce thickens.",
      "Garnish with green onions and serve over rice.",
    ],
    tips: [
      "Have all ingredients prepped before you start - stir-frying is fast!",
      "Don't overcrowd the pan - cook in batches if needed",
      "The wok should be smoking hot for the best sear",
    ],
    tags: ["stir-fry", "quick", "versatile", "asian", "healthy"],
  };
}

// API Key storage
const API_KEY_STORAGE = 'chef-ai-api-key';

export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY_STORAGE);
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function removeStoredApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE);
}
