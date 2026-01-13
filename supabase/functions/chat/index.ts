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

    // Build system prompt
    const systemPrompt = `You are RecipePilot, a friendly AI chef assistant. You help users discover and cook delicious recipes from around the world.

${region && region !== "all" ? `The user is interested in ${region} cuisine.` : ""}

When suggesting recipes:
- Provide clear ingredient lists with measurements
- Give step-by-step cooking instructions
- Include cooking times and serving sizes
- Suggest variations or substitutions when helpful

Format recipes clearly with sections for Ingredients and Instructions.
Be conversational, encouraging, and passionate about food!`;

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
    const assistantMessage = data.content[0].text;

    // Try to extract recipe if present
    let recipe = null;
    if (assistantMessage.includes("Ingredients") && assistantMessage.includes("Instructions")) {
      // Simple recipe extraction
      const titleMatch = assistantMessage.match(/^#?\s*(.+?)(?:\n|Ingredients)/);
      recipe = {
        id: crypto.randomUUID(),
        title: titleMatch ? titleMatch[1].trim().replace(/[#*]/g, "") : "Recipe",
        content: assistantMessage,
      };
    }

    return new Response(
      JSON.stringify({ response: assistantMessage, recipe }),
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
