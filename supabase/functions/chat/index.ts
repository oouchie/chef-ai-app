import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const message = body.message;
    const region = body.region;
    const history = body.history || [];

    const messages = [...history, { role: "user", content: message }];

    const systemPrompt = "You are Chef AI, a friendly culinary assistant who helps home cooks discover recipes from around the world. When sharing a recipe, include a JSON block in this format: ```recipe {\"name\":\"Recipe Name\",\"region\":\"asian\",\"cuisine\":\"Thai\",\"description\":\"Brief description\",\"prepTime\":\"15 mins\",\"cookTime\":\"30 mins\",\"servings\":4,\"difficulty\":\"Easy\",\"ingredients\":[{\"name\":\"ingredient\",\"amount\":\"1\",\"unit\":\"cup\",\"notes\":\"\"}],\"instructions\":[\"Step 1\",\"Step 2\"],\"tips\":[\"Tip 1\"],\"tags\":[\"dinner\"]} ``` Always include the recipe JSON block when recommending a specific recipe.";

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
