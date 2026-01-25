import { Recipe, WorldRegion } from '@/types';
import { sendChatMessageViaSupabase } from './supabase';

interface ChatResponse {
  response: string;
  recipe: Recipe | null;
  isDemo: boolean;
}

// Send chat message via Supabase Edge Function (Claude API key is server-side)
export async function sendChatMessage(
  message: string,
  region: WorldRegion | 'all',
  conversationHistory: { role: string; content: string }[],
  _apiKey?: string // Kept for backwards compatibility, no longer used
): Promise<ChatResponse> {
  try {
    const result = await sendChatMessageViaSupabase(message, region, conversationHistory);
    return result;
  } catch (error) {
    console.error('Chat error:', error);
    // Fallback to demo mode on error
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
    return "Hello! I'm Chef AI, your personal culinary assistant. I'm here to help you discover amazing recipes from around the world! What are you in the mood for today?";
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

  return "That sounds delicious! Let me find the perfect recipe for you.";
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
