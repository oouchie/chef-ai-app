export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  recipe?: Recipe;
}

export interface Recipe {
  id: string;
  name: string;
  region: WorldRegion;
  cuisine: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  instructions: string[];
  tips?: string[];
  imageUrl?: string;
  tags: string[];
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  recipeId?: string;
  category: 'prep' | 'shopping' | 'cooking' | 'other';
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  todos: TodoItem[];
  savedRecipes: Recipe[];
  selectedRegion: WorldRegion | 'all';
}

export type WorldRegion =
  | 'african'
  | 'asian'
  | 'european'
  | 'latin-american'
  | 'middle-eastern'
  | 'north-american'
  | 'oceanian'
  | 'caribbean';

export interface RegionInfo {
  id: WorldRegion;
  name: string;
  flag: string;
  cuisines: string[];
  description: string;
}

export const WORLD_REGIONS: RegionInfo[] = [
  {
    id: 'african',
    name: 'African',
    flag: '🌍',
    cuisines: ['Ethiopian', 'Moroccan', 'Nigerian', 'South African', 'Egyptian'],
    description: 'Rich, flavorful dishes with bold spices and unique ingredients',
  },
  {
    id: 'asian',
    name: 'Asian',
    flag: '🌏',
    cuisines: ['Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Indian'],
    description: 'Diverse flavors from stir-fries to curries to sushi',
  },
  {
    id: 'european',
    name: 'European',
    flag: '🇪🇺',
    cuisines: ['Italian', 'French', 'Spanish', 'Greek', 'German', 'British'],
    description: 'Classic techniques and refined flavors',
  },
  {
    id: 'latin-american',
    name: 'Latin American',
    flag: '🌎',
    cuisines: ['Mexican', 'Brazilian', 'Peruvian', 'Argentinian', 'Colombian'],
    description: 'Vibrant, colorful dishes with fresh ingredients',
  },
  {
    id: 'middle-eastern',
    name: 'Middle Eastern',
    flag: '🕌',
    cuisines: ['Lebanese', 'Turkish', 'Persian', 'Israeli', 'Syrian'],
    description: 'Aromatic spices, grilled meats, and mezze spreads',
  },
  {
    id: 'north-american',
    name: 'North American',
    flag: '🇺🇸',
    cuisines: ['American', 'Southern', 'Cajun', 'Canadian', 'Tex-Mex'],
    description: 'Comfort food classics and regional specialties',
  },
  {
    id: 'oceanian',
    name: 'Oceanian',
    flag: '🌊',
    cuisines: ['Australian', 'Polynesian', 'Hawaiian', 'New Zealand'],
    description: 'Fresh seafood and tropical flavors',
  },
  {
    id: 'caribbean',
    name: 'Caribbean',
    flag: '🏝️',
    cuisines: ['Jamaican', 'Cuban', 'Puerto Rican', 'Trinidadian', 'Haitian'],
    description: 'Island flavors with tropical fruits and spices',
  },
];

export const QUICK_PROMPTS = [
  "What can I make with chicken and rice?",
  "Give me an easy Italian pasta recipe",
  "I want to try something from Thailand",
  "What's a good vegetarian dinner?",
  "Suggest a quick 30-minute meal",
  "I'm craving something spicy",
  "What's a traditional Japanese dish?",
  "Give me a healthy breakfast idea",
];
