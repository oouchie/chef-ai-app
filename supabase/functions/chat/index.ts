import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, region, history } = await req.json();

    // Build system prompt (matches client-side prompt)
    const systemPrompt = `You are Chef AI, a friendly and knowledgeable culinary assistant who helps home cooks discover and master recipes from around the world.

Your personality:
- Warm, encouraging, and passionate about food
- Share interesting cultural context about dishes
- Offer practical tips for home cooks
- Suggest ingredient substitutions when appropriate
- Consider dietary restrictions when mentioned

${region && region !== "all" ? `The user is currently exploring ${region} cuisine.` : "The user is exploring cuisines from all regions."}

When recommending a recipe, you MUST include a JSON block with the recipe details in this exact format:
\`\`\`recipe
{
  "name": "Recipe Name",
  "region": "asian|african|european|latin-american|middle-eastern|southern|soul-food|cajun-creole|tex-mex|bbq|new-england|midwest|oceanian|caribbean",
  "cuisine": "Specific Cuisine (e.g., Italian, Thai, Southern Comfort)",
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

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: history || [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API error:", error);
      throw new Error("Failed to get response from Claude");
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract recipe from response if present (matches client-side parsing)
    const recipeMatch = content.match(/```recipe\s*([\s\S]*?)\s*```/);
    let recipe = null;

    if (recipeMatch) {
      try {
        const recipeData = JSON.parse(recipeMatch[1]);

        // Process ingredients - handle various formats
        let processedIngredients: { name: string; amount: string; unit: string; notes?: string }[] = [];

        if (Array.isArray(recipeData.ingredients)) {
          processedIngredients = recipeData.ingredients.map((ing: unknown) => {
            if (typeof ing === "object" && ing !== null) {
              const ingObj = ing as Record<string, unknown>;
              return {
                name: String(ingObj.name || ingObj.ingredient || "Unknown"),
                amount: String(ingObj.amount || ingObj.quantity || "1"),
                unit: String(ingObj.unit || ""),
                notes: ingObj.notes ? String(ingObj.notes) : undefined,
              };
            }
            if (typeof ing === "string") {
              return { name: ing, amount: "1", unit: "", notes: undefined };
            }
            return { name: "Unknown ingredient", amount: "1", unit: "", notes: undefined };
          });
        }

        recipe = {
          id: crypto.randomUUID(),
          name: recipeData.name || "Unnamed Recipe",
          region: recipeData.region || "european",
          cuisine: recipeData.cuisine || "International",
          description: recipeData.description || "",
          prepTime: recipeData.prepTime || "",
          cookTime: recipeData.cookTime || "",
          servings: recipeData.servings || 4,
          difficulty: recipeData.difficulty || "Medium",
          ingredients: processedIngredients,
          instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
          tips: Array.isArray(recipeData.tips) ? recipeData.tips : [],
          tags: Array.isArray(recipeData.tags) ? recipeData.tags : [],
        };

        console.log(`Recipe "${recipe.name}" parsed with ${processedIngredients.length} ingredients`);
      } catch (e) {
        console.error("Failed to parse recipe JSON:", e);
      }
    }

    // Clean up the response text (remove recipe JSON block)
    const cleanResponse = content.replace(/```recipe[\s\S]*?```/g, "").trim();

    return new Response(
      JSON.stringify({ response: cleanResponse, recipe }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
