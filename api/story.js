// Serverless proxy → Google Gemini (free tier). Three-loop architecture.
// Key stays server-side. Set GEMINI_API_KEY in Vercel env vars.
//
// Loop 1 Draft → Loop 2 Eval (judge) → Loop 3 Refine.
// Only the Loop 3 story is returned to the browser. Scores never leave here.
//
// Free tier: no billing account attached = cannot be charged.

export const config = { maxDuration: 60 }; // 3 sequential calls can exceed the 10s default

const MODELS = ["gemini-3.1-flash-lite", "gemini-3.1-flash-lite-preview"];

// One Gemini call. Tries each model name; returns text or throws.
async function gemini(key, prompt, { temperature = 1, maxOutputTokens = 2000 } = {}) {
  let lastErr = "Unknown error";
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens,
            thinkingConfig: { thinkingLevel: "minimal" },
          },
        }),
      });
      const data = await r.json();
      if (r.ok) {
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
        if (text) return text;
        lastErr = "Empty response";
        continue;
      }
      if (r.status === 404) { lastErr = data?.error?.message || "Model not found"; continue; }
      throw new Error(data?.error?.message || "Gemini error");
    } catch (e) {
      lastErr = e.message || "Network error reaching Gemini";
    }
  }
  throw new Error(lastErr);
}

function stripFences(s) {
  return s.replace(/```json|```/g, "").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "Missing GEMINI_API_KEY env var" });

  // The frontend sends the structured brief; the proxy owns the loop logic.
  const b = req.body || {};
  const childName = b.childName || "the child";
  const age = b.age || "3-4";
  const ageNum = age.split("-")[0]; // lower bound for the judge
  const lesson = b.lesson || "a gentle everyday moment";
  const tone = b.tone || "Gentle & soothing";
  const family = b.family || "Two parents";
  const lang = b.lang || "English";
  const style = b.style || "Watercolour";
  const skinTone = b.skinTone || "any";
  const expat = !!b.expat;
  const ndText = b.ndText || "predictable structure; literal language";
  const wordCap = (age === "1-2" || age === "3-4") ? 150 : 280;

  const bilingual = String(lang).toLowerCase().startsWith("bilingual");
  const secondLang = bilingual ? String(lang).split("+").pop().trim() : "";

  try {
    // ── LOOP 1 — DRAFT ──────────────────────────────────────────
    const draftPrompt = `You are a children's picture-book author for multilingual expat families. Write a calm, warm bedtime story.

Child's name: ${childName} (use this exact name, never a placeholder)
Lesson woven gently into the story: ${lesson}
Age: ${age} years — keep vocabulary genuinely simple for a ${ageNum}-year-old
Tone: ${tone}
Family shape: ${family}
Representation: family has ${skinTone} skin; show it warmly and naturally${expat ? "; this is an expat / two-cultures family — weave in a small two-cultures detail" : ""}
Neurodivergent supports: ${ndText}
${bilingual ? `Bilingual: weave ${secondLang} naturally INTO the dialogue (a word or phrase a parent would actually say), not as labels or translations in brackets.` : `Language: ${lang}`}

Rules:
- Under ${wordCap} words total.
- Do NOT default to a Western forest/castle/farm setting unless it fits the family's world.
- End on emotional safety: ${childName} feels seen, loved, or brave.
- 10 short scenes (pages), 1–3 simple sentences each.

Return ONLY JSON, no markdown:
{"title":"...","cover":{"image_prompt":"scene only, no style words, no text","subtitle":"one gentle line"},"pages":[{"text":"...","image_prompt":"scene only, no style words, no text"}]}`;

    const draftRaw = await gemini(key, draftPrompt, { temperature: 1, maxOutputTokens: 2200 });

    // ── LOOP 2 — EVAL (judge) ───────────────────────────────────
    const judgePrompt = `You are evaluating a children's story for a multilingual expat family. Score it on: (1) cultural authenticity — does it avoid Western defaults? (2) age-appropriate vocabulary for a ${ageNum}-year-old — is it genuinely simple? (3) emotional warmth — does it feel handmade not template? Return a JSON with scores 1-5 for each and one specific improvement instruction per dimension.

Story to evaluate:
${draftRaw}

Return ONLY JSON: {"cultural":{"score":n,"fix":"..."},"vocab":{"score":n,"fix":"..."},"warmth":{"score":n,"fix":"..."}}`;

    const evalRaw = await gemini(key, judgePrompt, { temperature: 0.4, maxOutputTokens: 600 });

    // ── LOOP 3 — REFINE ─────────────────────────────────────────
    const refinePrompt = `Rewrite this story applying exactly these three improvements. Do not change the child's name, the core plot, or the ending. Make it feel like a beloved bedtime story told by a grandmother who knows this child.

Improvements to apply:
${stripFences(evalRaw)}

Original story:
${draftRaw}

Keep the SAME JSON shape exactly:
{"title":"...","cover":{"image_prompt":"scene only, no style words, no text","subtitle":"..."},"pages":[{"text":"...","image_prompt":"scene only, no style words, no text"}]}
Return ONLY JSON, no markdown. Stay under ${wordCap} words total.`;

    const finalRaw = await gemini(key, refinePrompt, { temperature: 0.9, maxOutputTokens: 2200 });

    // Parse final; if it somehow isn't clean JSON, fall back to the draft.
    let book;
    try { book = JSON.parse(stripFences(finalRaw)); }
    catch { book = JSON.parse(stripFences(draftRaw)); }

    return res.status(200).json({ book });
  } catch (e) {
    return res.status(502).json({ error: e.message || "The story is thinking. Let's try that again." });
  }
}
