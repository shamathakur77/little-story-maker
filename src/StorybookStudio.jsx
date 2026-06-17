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

// ── Decorative illustration (inline SVG, no fetch, instant) ──────
// One reusable component used on every page.
// seed drives which arrangement of elements renders -- same book = same look.
// artStyle drives the colour palette.

const PALETTES = {
  "Bold flat vector":      { sky:"#74B9FF", ground:"#55EFC4", sun:"#FDCB6E", star1:"#FF6B6B", star2:"#A29BFE", star3:"#FF9F43", cloud:"#ffffff", rainbow:["#FF6B6B","#FF9F43","#FDCB6E","#55EFC4","#74B9FF","#A29BFE"], stroke:"#1a1a2e", sw:3 },
  "Watercolour":           { sky:"#B8DEF5", ground:"#C8EAB5", sun:"#FDE8C8", star1:"#F8B4B4", star2:"#D4B8F5", star3:"#FAD4A0", cloud:"#fefefe", rainbow:["#F8B4B4","#FAD4A0","#FDE8C8","#C8EAB5","#B8DEF5","#D4B8F5"], stroke:"#6b7c8d", sw:2 },
  "Crayon child-like":     { sky:"#9BB7D4", ground:"#7BC8A4", sun:"#F5D76E", star1:"#E8846A", star2:"#C8A8D4", star3:"#E8846A", cloud:"#FFF8F0", rainbow:["#E8846A","#F5D76E","#7BC8A4","#9BB7D4","#C8A8D4","#E8C8A0"], stroke:"#4a3728", sw:2.5 },
  "Classic fairytale":     { sky:"#2980B9", ground:"#27AE60", sun:"#F39C12", star1:"#C0392B", star2:"#8E44AD", star3:"#F39C12", cloud:"#ECF0F1", rainbow:["#C0392B","#E67E22","#F1C40F","#27AE60","#2980B9","#8E44AD"], stroke:"#2C3E50", sw:3 },
  "Studio-Ghibli soft":    { sky:"#B8D4E8", ground:"#A8C8A0", sun:"#E8C8A0", star1:"#E8D5B7", star2:"#C8B8D4", star3:"#D4C8A8", cloud:"#F5F0E8", rainbow:["#E8B8A8","#E8D5B7","#E8C8A0","#A8C8A0","#B8D4E8","#C8B8D4"], stroke:"#5a6e5a", sw:2 },
  "Pop art":               { sky:"#ffffff", ground:"#FFEA00", sun:"#FF6D00", star1:"#FF1744", star2:"#00E5FF", star3:"#FF6D00", cloud:"#ffffff", rainbow:["#FF1744","#FF6D00","#FFEA00","#00E5FF","#0091EA","#D500F9"], stroke:"#000000", sw:4 },
  "Minimalist line":       { sky:"#F5F0E8", ground:"#F5F0E8", sun:"#c9a84c", star1:"#b85c38", star2:"#3a7d74", star3:"#c9a84c", cloud:"#F5F0E8", rainbow:["#c9a84c","#b85c38","#3a7d74","#c9a84c","#b85c38","#3a7d74"], stroke:"#0d0c0a", sw:2 },
  "Maximalist pattern":    { sky:"#74B9FF", ground:"#55EFC4", sun:"#FDCB6E", star1:"#FF6B6B", star2:"#A29BFE", star3:"#FF9F43", cloud:"#ffffff", rainbow:["#FF6B6B","#FF9F43","#FDCB6E","#55EFC4","#74B9FF","#A29BFE"], stroke:"#1a1a2e", sw:3 },
  "Paper-cut collage":     { sky:"#74B9FF", ground:"#55EFC4", sun:"#FDCB6E", star1:"#FF6B6B", star2:"#A29BFE", star3:"#FF9F43", cloud:"#fefefe", rainbow:["#FF6B6B","#FF9F43","#FDCB6E","#55EFC4","#74B9FF","#A29BFE"], stroke:"none",   sw:0 },
  "Retro 70s storybook":   { sky:"#7BA5B8", ground:"#8FB87A", sun:"#E8C97A", star1:"#D4845A", star2:"#7BA5B8", star3:"#E8C97A", cloud:"#EDE0CC", rainbow:["#D4845A","#E8C97A","#8FB87A","#7BA5B8","#A09060","#C8A878"], stroke:"#3d2b1a", sw:2.5 },
};

const DEFAULT_PALETTE = PALETTES["Bold flat vector"];

function getPalette(artStyle) {
  return PALETTES[artStyle] || DEFAULT_PALETTE;
}

// Tiny seeded pseudo-random -- same seed always gives same layout variation
function seededRand(seed, index) {
  const x = Math.sin(seed * 9301 + index * 49297 + 233720) * 10000;
  return x - Math.floor(x);
}

function StoryIllustration({ seed = 1, artStyle = "Bold flat vector" }) {
  const p = getPalette(artStyle);
  const r = (i) => seededRand(seed, i);

  // Star positions -- 5 stars scattered across upper area
  const stars = [
    { cx: 60 + r(0) * 40,  cy: 30 + r(1) * 30, r: 6 + r(2) * 5,  fill: p.star1 },
    { cx: 180 + r(3) * 40, cy: 20 + r(4) * 25, r: 8 + r(5) * 5,  fill: p.star2 },
    { cx: 320 + r(6) * 40, cy: 35 + r(7) * 30, r: 5 + r(8) * 5,  fill: p.star3 },
    { cx: 430 + r(9) * 40, cy: 25 + r(10) * 25,r: 7 + r(11) * 4, fill: p.star1 },
    { cx: 540 + r(12)* 30, cy: 40 + r(13) * 25,r: 5 + r(14) * 5, fill: p.star2 },
  ];

  // Rainbow arc -- centre shifts slightly per seed
  const rainbowCx = 280 + r(20) * 40;
  const rainbowCy = 340;
  const rainbowRadii = [220, 195, 170, 145, 120, 95];

  // Cloud positions -- 2 clouds
  const clouds = [
    { cx: 100 + r(30) * 60, cy: 90 + r(31) * 20 },
    { cx: 420 + r(32) * 60, cy: 70 + r(33) * 20 },
  ];

  // Moon -- upper right, slight position variation
  const moonCx = 520 + r(40) * 20;
  const moonCy = 55 + r(41) * 20;

  const sw = p.sw;
  const stroke = p.stroke;

  return (
    <svg
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
      className="page-img"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      {/* Sky background */}
      <rect width="600" height="600" fill={p.sky} />

      {/* Ground strip */}
      <ellipse cx="300" cy="620" rx="380" ry="120" fill={p.ground} />

      {/* Sun */}
      <circle cx={80 + r(50)*30} cy={80 + r(51)*20} r="52" fill={p.sun}
        stroke={stroke} strokeWidth={sw} />
      {/* Sun rays */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = angle * Math.PI / 180;
        const x1 = (80 + r(50)*30) + Math.cos(rad)*58;
        const y1 = (80 + r(51)*20) + Math.sin(rad)*58;
        const x2 = (80 + r(50)*30) + Math.cos(rad)*72;
        const y2 = (80 + r(51)*20) + Math.sin(rad)*72;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={p.sun} strokeWidth={sw+1} strokeLinecap="round" />;
      })}

      {/* Moon */}
      <circle cx={moonCx} cy={moonCy} r="30" fill={p.star3}
        stroke={stroke} strokeWidth={sw} />
      <circle cx={moonCx+12} cy={moonCy-6} r="22" fill={p.sky} />

      {/* Rainbow arcs */}
      {rainbowRadii.map((rad, i) => (
        <path key={i}
          d={`M ${rainbowCx - rad} ${rainbowCy} A ${rad} ${rad} 0 0 1 ${rainbowCx + rad} ${rainbowCy}`}
          fill="none" stroke={p.rainbow[i]} strokeWidth={14} strokeLinecap="round"
          opacity="0.88"
        />
      ))}

      {/* Clouds */}
      {clouds.map((c, i) => (
        <g key={i}>
          <ellipse cx={c.cx}    cy={c.cy}    rx={38} ry={22} fill={p.cloud}
            stroke={stroke} strokeWidth={sw} opacity="0.92"/>
          <ellipse cx={c.cx-24} cy={c.cy+6}  rx={26} ry={18} fill={p.cloud}
            stroke={stroke} strokeWidth={sw} opacity="0.92"/>
          <ellipse cx={c.cx+24} cy={c.cy+6}  rx={26} ry={18} fill={p.cloud}
            stroke={stroke} strokeWidth={sw} opacity="0.92"/>
        </g>
      ))}

      {/* Stars (4-pointed sparkle shape) */}
      {stars.map((s, i) => {
        const sr = s.r;
        const pts = [
          `${s.cx},${s.cy - sr}`,
          `${s.cx + sr*0.3},${s.cy - sr*0.3}`,
          `${s.cx + sr},${s.cy}`,
          `${s.cx + sr*0.3},${s.cy + sr*0.3}`,
          `${s.cx},${s.cy + sr}`,
          `${s.cx - sr*0.3},${s.cy + sr*0.3}`,
          `${s.cx - sr},${s.cy}`,
          `${s.cx - sr*0.3},${s.cy - sr*0.3}`,
        ].join(" ");
        return (
          <polygon key={i} points={pts} fill={s.fill}
            stroke={stroke} strokeWidth={sw > 0 ? sw - 0.5 : 0}
            strokeLinejoin="round" />
        );
      })}

      {/* Small scatter dots for warmth -- bottom ground area */}
      {[0,1,2,3,4,5].map(i => (
        <circle key={i}
          cx={80 + r(60+i)*440} cy={520 + r(66+i)*50}
          r={5 + r(72+i)*6}
          fill={p.rainbow[i % 6]} opacity="0.7"
          stroke={stroke} strokeWidth={sw > 0 ? 1 : 0}
        />
      ))}
    </svg>
  );
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
      <StoryIllustration seed={seed} artStyle={cfg.style} />
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
      <StoryIllustration seed={seed + n} artStyle={cfg.style} />
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
