import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEXT_SYSTEM_PROMPT = `You are Chef AI, a friendly and enthusiastic culinary assistant who helps home cooks discover recipes from around the world.

IMPORTANT RULES:
1. ALWAYS include a recipe JSON block in your response when the user asks about food, cooking, ingredients, or meals. Even for casual food questions, suggest a specific recipe.
2. Keep your conversational text brief (2-3 sentences max) before the recipe block.
3. Use this exact format for the recipe JSON block:

\`\`\`recipe
{"name":"Recipe Name","region":"asian","cuisine":"Thai","description":"Brief appetizing description","prepTime":"15 mins","cookTime":"30 mins","servings":4,"difficulty":"Easy","ingredients":[{"name":"ingredient","amount":"1","unit":"cup","notes":"optional note"}],"instructions":["Step 1","Step 2"],"tips":["Tip 1"],"tags":["dinner","quick"]}
\`\`\`

4. Valid regions: african, asian, european, latin-american, middle-eastern, southern, soul-food, cajun-creole, tex-mex, bbq, new-england, midwest, oceanian, caribbean
5. Valid difficulties: Easy, Medium, Hard
6. Include at least 6 ingredients and 6 instruction steps for a complete recipe.
7. Tips should be practical and specific to the recipe.
8. If the user greets you or asks a non-food question, respond conversationally but still suggest a popular recipe they might enjoy.`;

const IMAGE_SYSTEM_PROMPT = `You are Chef AI, a friendly culinary assistant with expert food recognition skills.

The user has shared a photo of food or ingredients. Your job:
1. Carefully analyze the image and identify what you see (specific dishes, ingredients, or cooking situation).
2. If it's a finished dish: identify it by name and provide a copycat recipe to recreate it at home.
3. If it's raw ingredients: suggest the best recipe that uses those specific ingredients.
4. If it's a restaurant menu, food packaging, or grocery haul: suggest recipes based on what you see.

IMPORTANT RULES:
1. ALWAYS include a recipe JSON block. This is mandatory for every image response.
2. Start with a brief description of what you see in the image (1-2 sentences), then provide the recipe.
3. Use this exact format for the recipe JSON block:

\`\`\`recipe
{"name":"Recipe Name","region":"asian","cuisine":"Thai","description":"Brief appetizing description","prepTime":"15 mins","cookTime":"30 mins","servings":4,"difficulty":"Easy","ingredients":[{"name":"ingredient","amount":"1","unit":"cup","notes":"optional note"}],"instructions":["Step 1","Step 2"],"tips":["Tip 1"],"tags":["dinner","quick"]}
\`\`\`

4. Valid regions: african, asian, european, latin-american, middle-eastern, southern, soul-food, cajun-creole, tex-mex, bbq, new-england, midwest, oceanian, caribbean
5. Valid difficulties: Easy, Medium, Hard
6. Include at least 6 ingredients and 6 instruction steps for a complete recipe.
7. Tips should be practical and specific to the recipe.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const message = body.message;
    const region = body.region;
    const history = body.history || [];
    const image = body.image; // Optional: { data: string, media_type: string }

    // Build user message content - support vision when image is present
    let userContent: any;
    if (image) {
      userContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: image.media_type,
            data: image.data,
          },
        },
        {
          type: "text",
          text: message,
        },
      ];
    } else {
      userContent = message;
    }

    const messages = [...history, { role: "user", content: userContent }];

    const systemPrompt = image ? IMAGE_SYSTEM_PROMPT : TEXT_SYSTEM_PROMPT;

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
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      throw new Error("Claude API failed");
    }

    const data = await response.json();
    const content = data.content[0].text;

    const recipeMatch = content.match(/```recipe\s*([\s\S]*?)\s*```/);
    let recipe = null;

    if (recipeMatch) {
      try {
        const r = JSON.parse(recipeMatch[1]);
        recipe = {
          id: crypto.randomUUID(),
          name: r.name || "Recipe",
          region: r.region || "european",
          cuisine: r.cuisine || "International",
          description: r.description || "",
          prepTime: r.prepTime || "",
          cookTime: r.cookTime || "",
          servings: r.servings || 4,
          difficulty: r.difficulty || "Medium",
          ingredients: r.ingredients || [],
          instructions: r.instructions || [],
          tips: r.tips || [],
          tags: r.tags || [],
        };
      } catch (e) {
        console.error("Recipe parse error:", e);
      }
    }

    const cleanResponse = content.replace(/```recipe[\s\S]*?```/g, "").trim();

    return new Response(
      JSON.stringify({ response: cleanResponse, recipe: recipe }),
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
