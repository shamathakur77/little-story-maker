import React, { useState, useRef, useEffect } from "react";

// ── Design tokens (Shama's system) ──────────────────────────────
const INK = "#0d0c0a";
const PAPER = "#f5f0e8";
const GOLD = "#c9a84c";
const RUST = "#b85c38";
const TEAL = "#3a7d74";

// ── Variable taxonomy ───────────────────────────────────────────
const LESSONS = [
  "Potty training", "Bath time", "Brushing teeth", "Sleeping in own bed",
  "Eating fruits & veg", "Sharing toys", "Big feelings & tantrums",
  "Saying goodbye at drop-off", "When screen time ends", "Trying new food",
  "Waiting for a turn", "Loud places & overwhelm", "A new sibling",
  "Visiting the doctor", "Getting dressed", "Cleaning up toys",
];

const AGE_BANDS = [
  { id: "1-2", label: "1–2 yrs", note: "very short, one idea per page" },
  { id: "3-4", label: "3–4 yrs", note: "simple sentences, gentle arc" },
  { id: "5-6", label: "5–6 yrs", note: "fuller story, more words" },
];

const STYLES = [
  "Classic fairytale", "Studio-Ghibli soft", "Pop art", "Minimalist line",
  "Maximalist pattern", "Watercolour", "Paper-cut collage", "Crayon child-like",
  "Retro 70s storybook", "Bold flat vector",
];

const LANGS = [
  "English", "Swedish", "Hindi", "Marathi",
  "Bilingual: English + Swedish", "Bilingual: English + Hindi",
];

const TONES = ["Gentle & soothing", "Silly & funny", "Rhyming", "Matter-of-fact"];

const FAMILY = ["Two parents", "One parent", "Grandparents", "Parent + sibling"];

const ND_SUPPORTS = [
  { id: "predictable", label: "Predictable structure (same arc each page)" },
  { id: "literal", label: "Literal language (no idioms or sarcasm)" },
  { id: "sensory", label: "Sensory-aware wording" },
  { id: "emotion", label: "Name the emotions out loud" },
  { id: "firstthen", label: "First / then framing" },
  { id: "schedule", label: "Visual step-strip on each page" },
];

// Ivaan defaults
const IVAAN_DEFAULT = {
  childName: "Ivaan",
  lesson: "Brushing teeth",
  age: "3-4",
  style: "Studio-Ghibli soft",
  lang: "Bilingual: English + Swedish",
  tone: "Gentle & soothing",
  family: "Two parents",
  skinTone: "warm brown",
  expat: true,
  nd: ["predictable", "literal", "sensory", "firstthen"],
  dedication: "from Mamma & Pappa",
};

const GIFT_DEFAULT = {
  childName: "",
  lesson: "Potty training",
  age: "3-4",
  style: "Watercolour",
  lang: "English",
  tone: "Gentle & soothing",
  family: "Two parents",
  skinTone: "any",
  expat: false,
  nd: ["predictable"],
  dedication: "",
};

// ── Image layer (Pollinations, free, keyless) ───────────────────
function imageUrl(prompt, style, seed) {
  const full = `${prompt}, ${style} children's picture book illustration, soft warm lighting, full bleed, no text, no words, no letters`;
  const enc = encodeURIComponent(full);
  return `https://image.pollinations.ai/prompt/${enc}?width=768&height=768&seed=${seed}&nologo=true`;
}

export default function StorybookStudio() {
  const [mode, setMode] = useState(null); // null | 'ivaan' | 'gift'
  const [cfg, setCfg] = useState(IVAAN_DEFAULT);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(0);
  const printRef = useRef();

  function pick(door) {
    setMode(door);
    setCfg(door === "ivaan" ? IVAAN_DEFAULT : GIFT_DEFAULT);
    setBook(null);
    setErr("");
  }

  function toggleND(id) {
    setCfg((c) => ({
      ...c,
      nd: c.nd.includes(id) ? c.nd.filter((x) => x !== id) : [...c.nd, id],
    }));
  }

  async function generate() {
    if (!cfg.childName.trim()) {
      setErr("Add the child's name first.");
      return;
    }
    setLoading(true);
    setErr("");
    setBook(null);
    setPage(0);

    const ndText = cfg.nd.length
      ? ND_SUPPORTS.filter((s) => cfg.nd.includes(s.id)).map((s) => s.label).join("; ")
      : "predictable structure; literal language";

    // The proxy owns the three-loop logic. We just send the structured brief.
    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: cfg.childName,
          lesson: cfg.lesson,
          age: cfg.age,
          tone: cfg.tone,
          family: cfg.family,
          lang: cfg.lang,
          style: cfg.style,
          skinTone: cfg.skinTone,
          expat: cfg.expat,
          ndText,
        }),
      });
      if (!res.ok) throw new Error("api");
      const data = await res.json();
      if (!data.book) throw new Error("nobook");
      setBook(data.book);
    } catch (e) {
      setErr("Let's try that again — the story is thinking.");
    } finally {
      setLoading(false);
    }
  }

  function printBook() {
    window.print();
  }

  // seed keeps a single book visually coherent
  const seed = book ? Math.abs(hash(book.title)) % 99999 : 1;

  // ── Landing ───────────────────────────────────────────────────
  if (!mode) {
    return (
      <Shell>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto", paddingTop: 40 }}>
          <Eyebrow>a tiny book studio</Eyebrow>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 600,
            fontSize: "clamp(40px, 9vw, 76px)", lineHeight: 1.0, color: INK, margin: "8px 0 14px",
          }}>
            The Little<br /><span style={{ color: RUST }}>Story</span> Maker
          </h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: INK, opacity: 0.75, lineHeight: 1.6 }}>
            Make a calm, printable picture book that helps a child
            learn one everyday thing. Neurodivergent-friendly.
            Diverse by default. Free to make, free to gift.
          </p>
          <div style={{ display: "grid", gap: 14, marginTop: 36 }}>
            <DoorButton onClick={() => pick("ivaan")} accent={TEAL}
              title="Ivaan's shelf"
              sub="Pre-loaded with your world — Swedish, two cultures, gentle." />
            <DoorButton onClick={() => pick("gift")} accent={GOLD}
              title="Make one for any child"
              sub="Pick everything yourself. Print it or share the link as a gift." />
          </div>
        </div>
      </Shell>
    );
  }

  // ── Builder + book ────────────────────────────────────────────
  return (
    <Shell>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <button onClick={() => setMode(null)} style={linkBtn}>← back</button>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: INK, opacity: 0.6 }}>
          {mode === "ivaan" ? "Ivaan's shelf" : "Gift mode"}
        </span>
      </div>

      <div className="builder-grid">
        {/* Controls */}
        <div className="no-print" style={panel}>
          <Field label="Who is this for?">
            <input value={cfg.childName} placeholder="child's name"
              onChange={(e) => setCfg({ ...cfg, childName: e.target.value })}
              style={input} />
          </Field>

          <Field label="What will they learn?">
            <Select value={cfg.lesson} opts={LESSONS} onChange={(v) => setCfg({ ...cfg, lesson: v })} />
          </Field>

          <Field label="Age">
            <Chips opts={AGE_BANDS.map((a) => a.label)}
              value={AGE_BANDS.find((a) => a.id === cfg.age).label}
              onChange={(label) => setCfg({ ...cfg, age: AGE_BANDS.find((a) => a.label === label).id })} />
          </Field>

          <Field label="Art style">
            <Select value={cfg.style} opts={STYLES} onChange={(v) => setCfg({ ...cfg, style: v })} />
          </Field>

          <Field label="Language">
            <Select value={cfg.lang} opts={LANGS} onChange={(v) => setCfg({ ...cfg, lang: v })} />
          </Field>

          <Field label="Tone">
            <Select value={cfg.tone} opts={TONES} onChange={(v) => setCfg({ ...cfg, tone: v })} />
          </Field>

          <Field label="Family">
            <Select value={cfg.family} opts={FAMILY} onChange={(v) => setCfg({ ...cfg, family: v })} />
          </Field>

          <Field label="Skin tone of the family">
            <Select value={cfg.skinTone}
              opts={["any", "warm brown", "deep brown", "olive", "light", "tan"]}
              onChange={(v) => setCfg({ ...cfg, skinTone: v })} />
          </Field>

          <label style={{ display: "flex", gap: 10, alignItems: "center", margin: "4px 0 16px", cursor: "pointer" }}>
            <input type="checkbox" checked={cfg.expat}
              onChange={(e) => setCfg({ ...cfg, expat: e.target.checked })} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: INK }}>
              Two-cultures / expat thread
            </span>
          </label>

          <Field label="Neurodivergent supports">
            <div style={{ display: "grid", gap: 8 }}>
              {ND_SUPPORTS.map((s) => (
                <label key={s.id} style={{ display: "flex", gap: 9, alignItems: "flex-start", cursor: "pointer" }}>
                  <input type="checkbox" checked={cfg.nd.includes(s.id)} onChange={() => toggleND(s.id)} style={{ marginTop: 3 }} />
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: INK, lineHeight: 1.4 }}>{s.label}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Dedication (last page)">
            <input value={cfg.dedication} placeholder="from Mamma & Pappa"
              onChange={(e) => setCfg({ ...cfg, dedication: e.target.value })} style={input} />
          </Field>

          <button onClick={generate} disabled={loading} style={primaryBtn}>
            {loading ? "Writing tonight's story…" : book ? "Make another story" : "Make tonight's story"}
          </button>
          {err && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: RUST, marginTop: 10 }}>{err}</p>}
        </div>

        {/* Book viewer */}
        <div>
          {!book && !loading && (
            <div style={emptyState}>
              <div style={{ fontSize: 46, marginBottom: 8 }}>✶</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: INK }}>
                Your book appears here.
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: INK, opacity: 0.6 }}>
                Fill the left, then make the book.
              </p>
            </div>
          )}

          {loading && <LoadingState name={cfg.childName} />}

          {book && (
            <>
              <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <button onClick={printBook} style={primaryBtn}>Print / save as PDF</button>
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} style={ghostBtn}>‹</button>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: INK, alignSelf: "center" }}>
                  {page === 0 ? "cover" : `${page} / ${book.pages.length}`}
                </span>
                <button onClick={() => setPage((p) => Math.min(book.pages.length, p + 1))} style={ghostBtn}>›</button>
              </div>

              {/* On-screen single page */}
              <div className="no-print">
                {page === 0
                  ? <CoverPage book={book} cfg={cfg} seed={seed} />
                  : <StoryPage p={book.pages[page - 1]} cfg={cfg} seed={seed} n={page} />}
              </div>

              {/* Print-only: whole book */}
              <div ref={printRef} className="print-only">
                <CoverPage book={book} cfg={cfg} seed={seed} print />
                {book.pages.map((p, i) => (
                  <StoryPage key={i} p={p} cfg={cfg} seed={seed} n={i + 1} print />
                ))}
                <DedicationPage cfg={cfg} />
              </div>
            </>
          )}
        </div>
      </div>

      <Styles />
    </Shell>
  );
}

// ── Page components ─────────────────────────────────────────────
function CoverPage({ book, cfg, seed, print }) {
  return (
    <div className={`book-page cover-page ${print ? "print-page" : ""}`}>
      <img src={imageUrl(book.cover.image_prompt, cfg.style, seed)} alt="" className="page-img" />
      <div className="cover-overlay">
        <h2 className="cover-title">{book.title}</h2>
        {book.cover.subtitle && <p className="cover-sub">{book.cover.subtitle}</p>}
        <p className="cover-for">for {cfg.childName}</p>
      </div>
    </div>
  );
}

function StoryPage({ p, cfg, seed, n, print }) {
  const showStrip = cfg.nd.includes("schedule");
  return (
    <div className={`book-page ${print ? "print-page" : ""}`}>
      <img src={imageUrl(p.image_prompt, cfg.style, seed + n)} alt="" className="page-img" />
      <div className="page-text-box">
        <p className="page-text">{p.text}</p>
        {showStrip && (
          <div className="step-strip">
            <span>●</span><span>●</span><span style={{ color: GOLD }}>●</span>
            <em>one step at a time</em>
          </div>
        )}
        <span className="page-num">{n}</span>
      </div>
    </div>
  );
}

function DedicationPage({ cfg }) {
  return (
    <div className="book-page print-page dedication-page">
      <div>
        <p className="ded-made">made with love</p>
        <p className="ded-name">for {cfg.childName}</p>
        {cfg.dedication && <p className="ded-from">{cfg.dedication}</p>}
        <p className="ded-mark">The Little Story Maker</p>
      </div>
    </div>
  );
}

// ── Small UI atoms ──────────────────────────────────────────────
function LoadingState({ name }) {
  const child = name || "your little one";
  const phases = [
    `Dreaming up ${child}'s story…`,
    "Reading it back with a careful heart…",
    "Tucking in the warmth, like a grandmother would…",
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    // ~7s per phase ≈ the three loops; gentle, not a spinner race
    const t = setInterval(() => setI((p) => (p + 1) % phases.length), 7000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={emptyState}>
      <div className="pulse" style={{ fontSize: 46, marginBottom: 12 }}>✶</div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: INK, margin: 0 }}>
        {phases[i]}
      </p>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, color: INK, opacity: 0.55, marginTop: 8 }}>
        good stories take a breath
      </p>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: PAPER, padding: "28px 18px 40px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>{children}</div>
      <footer className="no-print" style={{
        maxWidth: 1080, margin: "44px auto 0", paddingTop: 20,
        borderTop: `1px solid ${INK}22`, textAlign: "center",
        fontFamily: "'DM Mono', monospace", fontSize: 12, color: INK,
      }}>
        <p style={{ opacity: 0.7, margin: "0 0 8px" }}>
          made by hand for small humans, by Shama
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://ko-fi.com/shamathakur" target="_blank" rel="noopener noreferrer"
            style={{ color: RUST, textDecoration: "none", fontWeight: 500 }}>
            ♡ buy me a ko-fi
          </a>
          <a href="https://www.instagram.com/shama_thakur77" target="_blank" rel="noopener noreferrer"
            style={{ color: INK, textDecoration: "none", opacity: 0.7 }}>instagram</a>
          <a href="https://pinterest.com/thkrshama" target="_blank" rel="noopener noreferrer"
            style={{ color: INK, textDecoration: "none", opacity: 0.7 }}>pinterest</a>
          <a href="https://shamathakur.substack.com" target="_blank" rel="noopener noreferrer"
            style={{ color: INK, textDecoration: "none", opacity: 0.7 }}>substack</a>
        </div>
      </footer>
    </div>
  );
}
function Eyebrow({ children }) {
  return <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: GOLD }}>{children}</p>;
}
function DoorButton({ onClick, title, sub, accent }) {
  return (
    <button onClick={onClick} style={{
      textAlign: "left", background: "#fff", border: `1.5px solid ${INK}`,
      borderRadius: 4, padding: "18px 20px", cursor: "pointer",
      boxShadow: `5px 5px 0 ${accent}`, transition: "transform .12s",
    }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "none")}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: INK }}>{title}</div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: INK, opacity: 0.7, marginTop: 3 }}>{sub}</div>
    </button>
  );
}
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: INK, opacity: 0.65, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
function Select({ value, opts, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={input}>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function Chips({ opts, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {opts.map((o) => (
        <button key={o} onClick={() => onChange(o)} style={{
          fontFamily: "'DM Mono', monospace", fontSize: 12, padding: "6px 11px",
          border: `1.4px solid ${INK}`, borderRadius: 3, cursor: "pointer",
          background: value === o ? INK : "transparent", color: value === o ? PAPER : INK,
        }}>{o}</button>
      ))}
    </div>
  );
}

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i); return h; }

// ── Inline styles ───────────────────────────────────────────────
const panel = { background: "#fffdf8", border: `1.5px solid ${INK}`, borderRadius: 4, padding: 22, boxShadow: `4px 4px 0 ${GOLD}` };
const input = { width: "100%", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "9px 11px", border: `1.4px solid ${INK}`, borderRadius: 3, background: "#fff", color: INK, boxSizing: "border-box" };
const primaryBtn = { fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, padding: "11px 18px", border: `1.5px solid ${INK}`, borderRadius: 3, background: RUST, color: PAPER, cursor: "pointer", boxShadow: `3px 3px 0 ${INK}` };
const ghostBtn = { fontFamily: "'DM Mono', monospace", fontSize: 16, padding: "6px 14px", border: `1.4px solid ${INK}`, borderRadius: 3, background: "transparent", color: INK, cursor: "pointer" };
const linkBtn = { fontFamily: "'DM Mono', monospace", fontSize: 13, background: "none", border: "none", color: INK, cursor: "pointer", opacity: 0.7 };
const emptyState = { border: `1.5px dashed ${INK}`, borderRadius: 4, padding: "60px 20px", textAlign: "center", opacity: 0.8 };

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Mono:wght@400;500&display=swap');
      * { -webkit-tap-highlight-color: transparent; }
      .builder-grid { display: grid; grid-template-columns: 340px 1fr; gap: 26px; }
      @media (max-width: 760px) { .builder-grid { grid-template-columns: 1fr; } }

      .book-page { position: relative; width: 100%; aspect-ratio: 1/1; max-width: 560px; margin: 0 auto;
        border: 1.5px solid ${INK}; border-radius: 4px; overflow: hidden; background: ${PAPER}; }
      .page-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .page-text-box { position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 20px 16px;
        background: linear-gradient(to top, rgba(13,12,10,.82), rgba(13,12,10,0)); }
      .page-text { font-family: 'Cormorant Garamond', serif; font-size: clamp(18px,3.4vw,24px);
        line-height: 1.35; color: ${PAPER}; white-space: pre-line; margin: 0; }
      .page-num { position: absolute; top: -34px; right: 16px; font-family: 'DM Mono', monospace;
        font-size: 12px; color: ${PAPER}; opacity: .8; }
      .step-strip { display: flex; gap: 6px; align-items: center; margin-top: 8px;
        font-family: 'DM Mono', monospace; font-size: 10px; color: ${PAPER}; opacity: .85; }
      .step-strip em { font-style: italic; margin-left: 4px; }

      .cover-page .cover-overlay { position: absolute; inset: 0; display: flex; flex-direction: column;
        justify-content: flex-end; padding: 26px; background: linear-gradient(to top, rgba(13,12,10,.7), rgba(13,12,10,.05) 55%); }
      .cover-title { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: clamp(28px,6vw,44px);
        color: ${PAPER}; line-height: 1.05; margin: 0; }
      .cover-sub { font-family: 'DM Mono', monospace; font-size: 13px; color: ${GOLD}; margin: 8px 0 0; }
      .cover-for { font-family: 'DM Mono', monospace; font-size: 12px; color: ${PAPER}; opacity: .85; margin: 4px 0 0; }

      .pulse { animation: pulse 1.3s ease-in-out infinite; }
      @keyframes pulse { 0%,100%{opacity:.35;transform:scale(.9)} 50%{opacity:1;transform:scale(1.1)} }

      .print-only { display: none; }
      @media print {
        .no-print { display: none !important; }
        .print-only { display: block !important; }
        body { background: #fff; }
        .print-page { max-width: 100%; width: 100%; aspect-ratio: 1/1; page-break-after: always;
          break-after: page; border: none; border-radius: 0; margin: 0; }
        .dedication-page { display: flex; align-items: center; justify-content: center; background: ${PAPER}; }
      }
      .dedication-page { aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center;
        text-align: center; background: ${PAPER}; }
      .ded-made { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: ${GOLD}; }
      .ded-name { font-family: 'Cormorant Garamond', serif; font-size: 38px; color: ${INK}; margin: 6px 0; }
      .ded-from { font-family: 'DM Mono', monospace; font-size: 14px; color: ${RUST}; }
      .ded-mark { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: ${INK}; opacity: .5; margin-top: 28px; }
    `}</style>
  );
}
