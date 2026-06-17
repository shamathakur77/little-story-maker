// Serverless proxy → Google Gemini (free tier).
// Holds your key server-side; never exposed to the browser.
// Set GEMINI_API_KEY in Vercel → Settings → Environment Variables.
//
// Free tier: no credit card, no billing account = cannot be charged.
// Reshapes Gemini's response into { content:[{type:"text",text}] } so the
// frontend stays unchanged.

// Tries these in order; if one 404s on a name, the next is attempted.
const MODELS = ["gemini-3.1-flash-lite", "gemini-3.1-flash-lite-preview"];

async function callGemini(model, key, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 3000,
        // light reasoning is plenty for short structured stories, keeps it fast + cheap
        thinkingConfig: { thinkingLevel: "minimal" },
      },
    }),
  });
  return r;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "Missing GEMINI_API_KEY env var" });

  const prompt = req.body && req.body.prompt;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  let lastErr = "Unknown error";
  for (const model of MODELS) {
    try {
      const upstream = await callGemini(model, key, prompt);
      const data = await upstream.json();

      if (upstream.ok) {
        const text =
          data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
        if (text) return res.status(200).json({ content: [{ type: "text", text }] });
        lastErr = "Empty response";
        continue;
      }

      // 404 = model name not found → try the next name in the list
      if (upstream.status === 404) {
        lastErr = data?.error?.message || "Model not found";
        continue;
      }

      // any other error (e.g. bad key, quota) → report it straight away
      return res.status(upstream.status).json({ error: data?.error?.message || "Gemini error" });
    } catch (e) {
      lastErr = "Network error reaching Gemini";
    }
  }
  return res.status(502).json({ error: lastErr });
}
