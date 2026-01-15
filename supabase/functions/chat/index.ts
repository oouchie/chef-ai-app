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

When recommending a recipe, ALWAYS include a JSON block with the recipe details in this exact format:
\`\`\`recipe
{
  "name": "Recipe Name",
  "region": "asian|african|european|latin-american|middle-eastern|north-american|oceanian|caribbean",
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
        recipe = {
          id: crypto.randomUUID(),
          ...recipeData,
        };
      } catch {
        console.error("Failed to parse recipe JSON");
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
