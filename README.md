# The Little Story Maker

Make calm, printable, neurodivergent-friendly children's picture books.
Diverse by default. Free to make, free to gift.

- **Story** written by Google Gemini (free tier — no credit card)
- **Images** generated free via Pollinations.ai (no key, no cost)
- **Print / save as PDF** straight from the browser
- Mobile-responsive; square book format

Total running cost: **0 kr.** No card anywhere.

---

## Deploy to Vercel (about 15 minutes)

### 1. Get a free Gemini API key (no credit card)
- Go to **aistudio.google.com**
- Sign in with a Google account
- Click **Get API key** → **Create API key**
- Copy it and keep it safe

Free tier is roughly 10 requests/minute and 1,500/day — hundreds of books a
day, free, with no billing relationship at all.

### 2. Put the code on GitHub
- github.com → New repository → name it `little-story-maker` → **Public**
- On the new repo page click **"uploading an existing file"**
- Drag in the *contents* of this folder (so package.json sits at the top level)
- Commit changes

### 3. Import to Vercel
- vercel.com → Add New → Project → import the repo
- Framework auto-detects as **Vite** — leave settings as they are
- Open **Environment Variables** and add:
  - Key: `GEMINI_API_KEY`
  - Value: your key from step 1
- Deploy. You get a public `*.vercel.app` URL.

### 4. Test
Open the URL, pick a name, hit "Make the book." Story text appears in a couple
of seconds; pictures fade in after (Pollinations generates on request).

---

## Run locally
```bash
npm install
# create .env.local containing:  GEMINI_API_KEY=your_key
npx vercel dev
```

---

## A privacy note (read this — relevant to GDPR work)
Google's Gemini **free tier** may use your inputs to improve their models, and
Google's free-tier *commercial* terms exclude the EU/EEA/UK/Switzerland.
For a personal or gift project this is normally fine — the prompts here contain
only a child's first name and a chosen topic, no sensitive data, no photos.
If this ever becomes a paid/commercial product serving EU users, switch to a
paid Gemini tier (which doesn't train on your data) or another EU-appropriate
provider. The story provider lives entirely in `/api/story.js` — swapping it
is a one-file change.

To keep prompts minimal, the app never sends a surname, photo, or any data
beyond the first name + chosen options.

---

## Swapping the AI later
Everything AI-related is in `api/story.js`. It takes `{ prompt }` and returns
`{ content: [{ type:"text", text }] }`. Point it at any provider that can
honour that shape and nothing else changes.
