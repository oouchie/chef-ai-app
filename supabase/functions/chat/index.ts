import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are Chef AI, a friendly and knowledgeable culinary assistant who specializes in world recipes and cooking techniques. You help users discover and cook amazing dishes from around the globe.

When providing recipes:
- Include cultural context and history when relevant
- Provide ingredient substitutions for hard-to-find items
- Consider dietary restrictions when mentioned
- ALWAYS include a recipe JSON block in your response using the exact format below

CRITICAL: You MUST include a recipe block in your response formatted exactly like this:

\`\`\`recipe
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
\`\`\`

The ingredients array is REQUIRED and must contain at least 3-5 ingredients, each with name, amount, and unit fields.

Keep your conversational response brief (2-3 sentences max before the recipe).`;

const VISION_SYSTEM_PROMPT = `You are Chef AI, a friendly culinary assistant. The user has sent you a photo of food or ingredients.

Analyze the image carefully:
- If it's a prepared dish: identify it and provide a copycat recipe
- If it's ingredients: suggest what can be made with them
- If it's a restaurant menu item: recreate it as a home recipe

ALWAYS include a recipe JSON block in your response using the exact format:

\`\`\`recipe
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
\`\`\`

Keep your conversational response brief (2-3 sentences max before the recipe).`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("CLAUDE_API_KEY") || Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "CLAUDE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, region, history, image } = await req.json();

    const hasImage = image && image.length > 0;

    // Build system prompt with region context
    let systemPrompt = hasImage ? VISION_SYSTEM_PROMPT : SYSTEM_PROMPT;
    if (region && region !== "all" && !hasImage) {
      systemPrompt += `\n\nThe user is currently exploring ${region} cuisine. Focus on authentic recipes from this region.`;
    }

    // Build user content (text or multimodal)
    let userContent: any;
    if (hasImage) {
      userContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: image,
          },
        },
        {
          type: "text",
          text: message || "What is this? Give me a recipe.",
        },
      ];
    } else {
      userContent = message;
    }

    // Build messages array
    const messages = [
      ...(history || []).slice(-10).map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: userContent },
    ];

    // Call Claude API
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Claude API error:", response.status, errorBody);
      return new Response(
        JSON.stringify({ error: `Claude API error: ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    // Parse recipe from response
    let recipe = null;
    const recipeMatch = text.match(/```recipe\s*([\s\S]*?)```/);
    if (recipeMatch) {
      try {
        recipe = JSON.parse(recipeMatch[1].trim());
      } catch {
        // Recipe JSON parse failed, return text only
      }
    }

    return new Response(
      JSON.stringify({ text, recipe }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
