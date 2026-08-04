// List of free models to try in order of reliability
const FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

export async function callOpenRouter(prompt: string, model?: string, retries: number = 2): Promise<any> {
  const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables. Add it to your Vercel Environment Variables.");
  }

  // Build the list of models to try
  const modelsToTry = model ? [model, ...FREE_MODELS.filter(m => m !== model)] : FREE_MODELS;

  let lastError: Error | null = null;

  for (const currentModel of modelsToTry) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[OpenRouter] Trying model: ${currentModel} (attempt ${attempt + 1}/${retries + 1})`);

        const requestBody = {
          model: currentModel,
          messages: [
            {
              role: "user",
              content: attempt > 0
                ? `${prompt}\n\nCRITICAL: Return ONLY a raw JSON object. No markdown, no explanation, no code blocks. Start with { and end with }.`
                : prompt,
            },
          ],
        };

        const response = await fetch(openRouterUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://heropath.vercel.app",
            "X-Title": "HeroPath AI",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[OpenRouter] API error with ${currentModel}: ${response.status} - ${errorText}`);
          lastError = new Error(`OpenRouter API error (${currentModel}): ${response.status} - ${errorText}`);
          // Don't retry this model if it's a 4xx error (invalid model, auth issue, etc.)
          if (response.status >= 400 && response.status < 500) {
            break; // Try the next model instead
          }
          continue; // Retry same model on 5xx
        }

        const data = await response.json();

        // Check if the API returned an error inside the response body
        if (data.error) {
          console.error(`[OpenRouter] Response error with ${currentModel}:`, data.error);
          lastError = new Error(`OpenRouter response error: ${JSON.stringify(data.error)}`);
          break; // Try next model
        }

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error(`[OpenRouter] Unexpected response structure from ${currentModel}:`, JSON.stringify(data).substring(0, 500));
          lastError = new Error(`Unexpected API response structure from ${currentModel}`);
          break; // Try next model
        }

        let aiText = data.choices[0].message.content || "";
        console.log(`[OpenRouter] Raw AI response (first 300 chars): ${aiText.substring(0, 300)}`);

        // Extract the JSON object robustly by finding the first { and last }
        const firstBrace = aiText.indexOf("{");
        const lastBrace = aiText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
          aiText = aiText.substring(firstBrace, lastBrace + 1);
        }

        // Remove any trailing commas before closing braces (common LLM mistake)
        aiText = aiText.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

        const parsed = JSON.parse(aiText);
        console.log(`[OpenRouter] Successfully parsed JSON from ${currentModel}`);
        return parsed;

      } catch (parseError: any) {
        console.warn(`[OpenRouter] Attempt ${attempt + 1} with ${currentModel} failed:`, parseError.message);
        lastError = parseError;
        // Continue to next retry attempt
      }
    }
    // If all retries for this model failed, try the next model
    console.log(`[OpenRouter] All attempts exhausted for ${currentModel}, trying next model...`);
  }

  // All models and retries exhausted
  throw new Error(`AI processing failed after trying ${modelsToTry.length} models. Last error: ${lastError?.message || "Unknown error"}`);
}
