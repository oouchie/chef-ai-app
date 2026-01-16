// Unit conversion helpers for cooking

type VolumeUnit = 'cup' | 'tbsp' | 'tsp' | 'ml' | 'l' | 'floz';
type WeightUnit = 'g' | 'kg' | 'oz' | 'lb';
type TemperatureUnit = 'f' | 'c';

interface ConversionResult {
  value: number;
  unit: string;
  formatted: string;
}

// Volume conversions (base: ml)
const volumeToMl: Record<VolumeUnit, number> = {
  cup: 236.588,
  tbsp: 14.787,
  tsp: 4.929,
  ml: 1,
  l: 1000,
  floz: 29.574,
};

// Weight conversions (base: g)
const weightToGrams: Record<WeightUnit, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): ConversionResult {
  const mlValue = value * volumeToMl[from];
  const result = mlValue / volumeToMl[to];
  return {
    value: result,
    unit: to,
    formatted: `${result.toFixed(2)} ${to}`,
  };
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): ConversionResult {
  const gramValue = value * weightToGrams[from];
  const result = gramValue / weightToGrams[to];
  return {
    value: result,
    unit: to,
    formatted: `${result.toFixed(2)} ${to}`,
  };
}

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): ConversionResult {
  let result: number;

  if (from === 'f' && to === 'c') {
    result = (value - 32) * 5 / 9;
  } else if (from === 'c' && to === 'f') {
    result = (value * 9 / 5) + 32;
  } else {
    result = value;
  }

  return {
    value: result,
    unit: to === 'f' ? '°F' : '°C',
    formatted: `${Math.round(result)}${to === 'f' ? '°F' : '°C'}`,
  };
}

// Common substitutions
export const INGREDIENT_SUBSTITUTIONS: Record<string, string[]> = {
  'butter': ['coconut oil', 'olive oil', 'margarine', 'applesauce (for baking)'],
  'milk': ['almond milk', 'oat milk', 'soy milk', 'coconut milk'],
  'egg': ['flax egg (1 tbsp flax + 3 tbsp water)', 'chia egg', 'applesauce', 'mashed banana'],
  'flour': ['almond flour', 'coconut flour', 'oat flour', 'gluten-free blend'],
  'sugar': ['honey', 'maple syrup', 'stevia', 'coconut sugar'],
  'heavy cream': ['coconut cream', 'cashew cream', 'evaporated milk'],
  'sour cream': ['Greek yogurt', 'coconut cream + lemon', 'cashew cream'],
  'breadcrumbs': ['crushed crackers', 'oats', 'almond flour', 'crushed cornflakes'],
  'chicken broth': ['vegetable broth', 'mushroom broth', 'water + bouillon'],
  'soy sauce': ['coconut aminos', 'tamari', 'worcestershire sauce'],
};

export function getSubstitutions(ingredient: string): string[] {
  const normalizedIngredient = ingredient.toLowerCase().trim();

  // Check for exact match
  if (INGREDIENT_SUBSTITUTIONS[normalizedIngredient]) {
    return INGREDIENT_SUBSTITUTIONS[normalizedIngredient];
  }

  // Check for partial match
  for (const [key, subs] of Object.entries(INGREDIENT_SUBSTITUTIONS)) {
    if (normalizedIngredient.includes(key) || key.includes(normalizedIngredient)) {
      return subs;
    }
  }

  return [];
}

// Timer helpers
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function parseTimeString(timeStr: string): number {
  // Parse strings like "15 mins", "1 hour 30 mins", "45 minutes"
  let totalSeconds = 0;

  const hoursMatch = timeStr.match(/(\d+)\s*(?:hours?|hrs?|h)/i);
  const minutesMatch = timeStr.match(/(\d+)\s*(?:minutes?|mins?|m(?!s))/i);
  const secondsMatch = timeStr.match(/(\d+)\s*(?:seconds?|secs?|s)/i);

  if (hoursMatch) {
    totalSeconds += parseInt(hoursMatch[1]) * 3600;
  }
  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1]) * 60;
  }
  if (secondsMatch) {
    totalSeconds += parseInt(secondsMatch[1]);
  }

  return totalSeconds;
}

// Servings scaling
export function scaleIngredient(
  amount: string,
  originalServings: number,
  newServings: number
): string {
  // Try to parse the amount as a number or fraction
  let numericAmount = parseAmount(amount);

  if (numericAmount === null) {
    return amount; // Return original if we can't parse
  }

  const scaleFactor = newServings / originalServings;
  const scaledAmount = numericAmount * scaleFactor;

  return formatAmount(scaledAmount);
}

function parseAmount(amount: string): number | null {
  // Handle fractions like "1/2", "3/4"
  const fractionMatch = amount.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
  }

  // Handle mixed numbers like "1 1/2"
  const mixedMatch = amount.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  }

  // Handle simple numbers
  const num = parseFloat(amount);
  return isNaN(num) ? null : num;
}

function formatAmount(num: number): string {
  // Round to reasonable precision
  if (num === Math.floor(num)) {
    return num.toString();
  }

  // Check for common fractions
  const fractions: [number, string][] = [
    [0.25, '1/4'],
    [0.33, '1/3'],
    [0.5, '1/2'],
    [0.67, '2/3'],
    [0.75, '3/4'],
  ];

  const wholePart = Math.floor(num);
  const decimalPart = num - wholePart;

  for (const [decimal, fraction] of fractions) {
    if (Math.abs(decimalPart - decimal) < 0.05) {
      return wholePart > 0 ? `${wholePart} ${fraction}` : fraction;
    }
  }

  // Default to decimal
  return num.toFixed(1);
}
