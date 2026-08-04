export async function callOpenRouter(prompt: string, model: string = "anthropic/claude-3-5-sonnet:beta", retries: number = 1): Promise<any> {
  const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
  }

  const requestBody = {
    model: model, // "anthropic/claude-3-5-sonnet:beta" or "meta-llama/llama-3.3-70b-instruct:free"
    messages: [{ role: "user", content: prompt }],
    // Some free-tier models don't support JSON mode, but Claude and many others do. 
    // We will just enforce JSON in the prompt as a fallback, but provide response_format.
    // response_format: { type: "json_object" } 
  };

  try {
    const response = await fetch(openRouterUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "HeroPath Hackathon MVP"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let aiText = data.choices[0].message.content || "";
    
    // Extract the JSON object robustly by finding the first { and last }
    const firstBrace = aiText.indexOf('{');
    const lastBrace = aiText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
      aiText = aiText.substring(firstBrace, lastBrace + 1);
    }

    // Try parsing
    return JSON.parse(aiText);

  } catch (error) {
    console.warn("Failed to parse JSON from AI response.", error);
    
    // One retry on parse failure
    if (retries > 0) {
      console.log("Retrying AI call due to parse failure... Retries left:", retries);
      // Ask the model to specifically fix the format
      const retryPrompt = `${prompt}\n\nIMPORTANT: Your previous response was not valid JSON. You MUST return ONLY valid, raw JSON with no markdown wrapping.`;
      return callOpenRouter(retryPrompt, model, retries - 1);
    }
    
    throw new Error("AI failed to return valid JSON after retries.");
  }
}
