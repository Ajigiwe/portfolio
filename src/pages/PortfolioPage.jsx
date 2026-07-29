import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import defaultData from "../data/content";

function load() {
  try {
    const saved = localStorage.getItem("portfolio_content");
    if (!saved) return defaultData;
    const p = JSON.parse(saved);
    return {
      ...defaultData, ...p,
      about: Array.isArray(p.about) ? p.about : defaultData.about,
      skills: Array.isArray(p.skills) ? p.skills : defaultData.skills,
      projects: Array.isArray(p.projects) ? p.projects : defaultData.projects,
      experience: Array.isArray(p.experience) ? p.experience : defaultData.experience,
      services: Array.isArray(p.services) ? p.services : defaultData.services,
      achievements: Array.isArray(p.achievements) ? p.achievements : defaultData.achievements,
      marquee: Array.isArray(p.marquee) ? p.marquee : defaultData.marquee,
      clients: typeof p.clients === "number" ? p.clients : defaultData.clients,
    };
  } catch { return defaultData; }
}

const _data = load();

function pct(level) {
  if (typeof level !== "string") return 0;
  return parseInt(level.match(/(\d+)%/)?.[1]) || 0;
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("vp-visible"); o.unobserve(el); }
    }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return ref;
}

const THEMES = {
  dark: {
    bg: "#05050a", surface: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)",
    text: "#d0d0e0", muted: "#888", dim: "#555", heading: "#fff",
    green: "#00ff6a", greenBg: "rgba(0,255,106,0.08)", greenBorder: "rgba(0,255,106,0.2)",
    navBg: "rgba(5,5,10,0.85)", cardBg: "rgba(255,255,255,0.02)", footerBorder: "rgba(255,255,255,0.04)",
    skillBg: "rgba(255,255,255,0.05)", glow: "rgba(0,255,106,0.15)",
    statBg: "rgba(255,255,255,0.015)",
  },
  light: {
    bg: "#f0eee8", surface: "rgba(0,0,0,0.02)", border: "rgba(0,0,0,0.08)",
    text: "#333", muted: "#777", dim: "#999", heading: "#111",
    green: "#008844", greenBg: "rgba(0,136,68,0.06)", greenBorder: "rgba(0,136,68,0.15)",
    navBg: "rgba(240,238,232,0.9)", cardBg: "#fff", footerBorder: "rgba(0,0,0,0.06)",
    skillBg: "rgba(0,0,0,0.05)", glow: "rgba(0,136,68,0.15)",
    statBg: "rgba(0,0,0,0.02)",
  },
};

const NEON_COLORS = ["#00ff6a", "#00d4ff", "#ff00ff", "#ffd700", "#ff4081", "#7c4dff"];

const SERVICES = _data.services;
const MARQUEE_ITEMS = _data.marquee;
const ACHIEVEMENTS = _data.achievements;

function TiltCard({ children, style }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handle = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -12, y: ((e.clientX - r.left) / r.width - 0.5) * 12 });
  }, []);
  const leave = () => setTilt({ x: 0, y: 0 });
  return (
    <div ref={ref} className="vp-card-tilt vp-grad-border" onMouseMove={handle} onMouseLeave={leave}
      style={{ ...style, transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
      {children}
    </div>
  );
}

function Section({ id, title, theme, children, noDivider }) {
  const ref = useReveal();
  return (
    <section id={id} ref={ref} className="vp-reveal" style={{ padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div className="vp-section-orb" style={{ width: 400, height: 400, top: -100, right: -100, background: `radial-gradient(circle, ${theme.green}08, transparent)` }} />
      <div className="vp-section-orb" style={{ width: 300, height: 300, bottom: -80, left: -80, background: "radial-gradient(circle, rgba(0,212,255,0.06), transparent)", animationDelay: "-3s" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: theme.heading, letterSpacing: "-0.5px" }}>{title}</h2>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${theme.green}40, transparent)` }} />
        </div>
        {children}
      </div>
      {!noDivider && <div className="vp-section-divider" style={{ marginTop: 100 }} />}
    </section>
  );
}

function useCounter(target, enabled) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let start, raf;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1500, 1);
      setVal(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled]);
  return val;
}

function useMousePos() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    const onLeave = () => setPos({ x: -200, y: -200 });
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("mousemove", onMove); document.removeEventListener("mouseleave", onLeave); };
  }, []);
  return pos;
}

function Cursor() {
  const pos = useMousePos();
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const onOver = (e) => { if (e.target.closest("a,button,.vp-card-tilt,.vp-service-card,.vp-achieve")) setHover(true); };
    const onOut = () => setHover(false);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => { document.removeEventListener("mouseover", onOver); document.removeEventListener("mouseout", onOut); };
  }, []);
  const trails = [];
  for (let i = 0; i < 3; i++) {
    trails.push(
      <div key={i} className="vp-cursor-trail" style={{
        left: pos.x, top: pos.y,
        width: 6 - i * 1.5, height: 6 - i * 1.5,
        opacity: 0.08 - i * 0.02,
        transitionDelay: `${i * 0.04}s`,
      }} />
    );
  }
  return (
    <>
      {trails}
      <div className={`vp-cursor ${hover ? "hover" : ""}`} style={{ left: pos.x, top: pos.y }} />
    </>
  );
}

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const s = localStorage.getItem("vp-theme");
    return s === "light" ? "light" : "dark";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const T = THEMES[theme];

  useEffect(() => { localStorage.setItem("vp-theme", theme); }, [theme]);
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const docH = typeof document !== "undefined" ? Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) : 1;
  const winH = typeof window !== "undefined" ? window.innerHeight : 1;
  const scrollPct = Math.min(scrollY / (docH - winH), 1);

  const nav = [
    ["About", "#about"], ["Services", "#services"], ["Skills", "#skills"],
    ["Projects", "#projects"], ["Contact", "#contact"],
  ];

  const socialLinks = [
    ["GH", _data.github, "GitHub"],
    ["Li", _data.linkedin, "LinkedIn"],
    ["Tw", _data.twitter, "Twitter"],
    ["Em", `mailto:${_data.email}`],
  ];

  const initials = _data.name ? _data.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "XX";

  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsVisible(true); o.unobserve(el); }
    }, { threshold: 0.5 });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  const projectsCount = useCounter(_data.projects.length || 0, statsVisible);
  const skillsCount = useCounter(_data.skills.length || 0, statsVisible);
  const expCount = useCounter(_data.experience.length || 0, statsVisible);

  const TYPED = ["full stack developer", "vibe coder", "UI architect", "problem solver"];
  const [typedText, setTypedText] = useState("");
  const [typedIdx, setTypedIdx] = useState(0);
  const [typedCharIdx, setTypedCharIdx] = useState(0);
  const [typedDir, setTypedDir] = useState(1);

  useEffect(() => {
    if (typedDir === 1 && typedCharIdx >= TYPED[typedIdx].length) {
      const t = setTimeout(() => setTypedDir(-1), 2000);
      return () => clearTimeout(t);
    }
    if (typedDir === -1 && typedCharIdx === 0) {
      const t = setTimeout(() => { setTypedIdx(i => (i + 1) % TYPED.length); setTypedDir(1); }, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTypedCharIdx(i => i + typedDir), typedDir === 1 ? 80 : 40);
    return () => clearTimeout(t);
  }, [typedCharIdx, typedDir, typedIdx]);

  useEffect(() => { setTypedText(TYPED[typedIdx].slice(0, typedCharIdx)); }, [typedCharIdx, typedIdx]);

  const taglines = [
    "Building digital experiences with code & creativity",
    "Turning ideas into interactive realities",
    "Full stack · UI/UX · Creative development",
  ];
  const [tagIdx, setTagIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTagIdx(i => (i + 1) % taglines.length), 5000);
    return () => clearInterval(t);
  }, []);

  const heroParallax = (factor) => scrollY * factor;

  const magneticRefs = useRef({});
  const onMagneticMove = useCallback((e, key) => {
    const el = magneticRefs.current[key];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.2;
    const y = (e.clientY - r.top - r.height / 2) * 0.2;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, []);
  const onMagneticLeave = useCallback((key) => {
    const el = magneticRefs.current[key];
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "system-ui, sans-serif", fontSize: "17px", lineHeight: 1.6, transition: "background 0.3s, color 0.3s", cursor: "none" }}>
      <Cursor />

      <div className="vp-scroll-progress" style={{ transform: `scaleX(${scrollPct})` }} />

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: T.navBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}`, transition: "background 0.3s" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
          <span style={{ color: T.green, fontWeight: 700, fontSize: "1.1rem", textShadow: `0 0 10px ${T.glow}` }}>{_data.name}</span>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {nav.map(([label, href]) => (
              <a key={label} href={href} className="vp-nav-link" style={{ color: T.muted, textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s", letterSpacing: "1px" }}
                onClick={(e) => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }}>
                {label}
              </a>
            ))}
            <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              style={{ font: "inherit", fontSize: "0.85rem", background: "none", border: "none", cursor: "none", color: T.muted, padding: "2px 4px" }}>
              {theme === "dark" ? "\u2600" : "\u25CF"}
            </button>
            <button onClick={() => navigate("/")}
              className="vp-term-btn"
              style={{ font: "inherit", fontSize: "0.8rem", padding: "6px 16px", color: T.green, background: "transparent", border: `1px solid ${T.greenBorder}`, borderRadius: 6, cursor: "none" }}>
              Terminal
            </button>
            <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`vp-overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />
      <div className={`vp-mobile-menu ${menuOpen ? "open" : ""}`}>
        {nav.map(([label, href]) => (
          <a key={label} href={href} className="vp-mobile-link"
            onClick={(e) => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }}>
            {label}
          </a>
        ))}
        <button onClick={() => navigate("/")}
          style={{ marginTop: 20, font: "inherit", fontSize: "0.8rem", padding: "10px", color: T.green, background: "transparent", border: `1px solid ${T.greenBorder}`, borderRadius: 6, cursor: "none" }}>
          Terminal Mode
        </button>
      </div>

      {/* ─── Hero ─── */}
      <header style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 24px 60px", overflow: "hidden" }}>
        <div className="vp-grid-bg" style={{ transform: `translateY(${heroParallax(-0.08)}px)` }} />
        <div className="vp-scanlines" />

        <div className="vp-hero-anim vp-liquid" style={{
          position: "absolute", inset: "-30%",
          background: `radial-gradient(ellipse at 30% 25%, ${T.green}0c 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 20%, #00d4ff0c 0%, transparent 50%),
                       radial-gradient(ellipse at 50% 75%, #ff00ff08 0%, transparent 50%),
                       radial-gradient(ellipse at 80% 60%, #ffd70006 0%, transparent 50%)`,
        }} />

        {/* Glow particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="vp-glow-particle" style={{
            width: 4 + i * 2, height: 4 + i * 2,
            left: `${8 + i * 11}%`, top: `${10 + (i * 7) % 80}%`,
            background: [T.green, "#00d4ff", "#ff00ff", "#ffd700"][i % 4],
            "--dur": `${4 + i * 1.5}s`,
            "--dx": `${15 + i * 5}px`,
            "--dy": `${-15 - i * 3}px`,
            animationDelay: `${i * 0.4}s`,
            opacity: 0.15 + i * 0.03,
          }} />
        ))}

        {/* Rings with parallax */}
        <div className="vp-ring" style={{ width: 340, height: 340, borderColor: "rgba(0,255,106,0.08)", "--dur": "20s", top: `calc(50% - 170px + ${heroParallax(-0.04)}px)`, left: "calc(50% - 170px)" }} />
        <div className="vp-ring" style={{ width: 280, height: 280, borderColor: "rgba(0,212,255,0.06)", "--dur": "15s", top: `calc(50% - 140px + ${heroParallax(-0.02)}px)`, left: "calc(50% - 140px)", animationDirection: "reverse" }} />

        {/* Data flow */}
        <div className="vp-data-line" style={{ width: 200, top: "22%", left: "10%", "--dur": "4s" }}><div className="vp-data-dot" /></div>
        <div className="vp-data-line" style={{ width: 160, top: "75%", right: "12%", "--dur": "5s" }}><div className="vp-data-dot" style={{ animationDelay: "-2s" }} /></div>
        <div className="vp-data-line" style={{ width: 140, top: "45%", right: "8%", "--dur": "3.5s" }}><div className="vp-data-dot" style={{ animationDelay: "-1s" }} /></div>

        {[...Array(6)].map((_, i) => (
          <div key={i} className="vp-hex" style={{
            left: `${10 + i * 16}%`, top: `${15 + (i % 4) * 20}%`,
            animationDelay: `${i * 1.2}s`, animationDuration: `${6 + i * 2}s`,
            transform: `translateY(${heroParallax(-0.03 * (i + 1))}px)`,
          }}>
            {"0x" + (0xCAFE + i * 0xBEEF).toString(16).toUpperCase().slice(0, 4)}
          </div>
        ))}

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${heroParallax(0.06)}px)` }}>
          <div className="vp-mono">{initials}</div>

          <div style={{ marginTop: 24, display: "inline-block", fontSize: "0.7rem", color: T.green, padding: "5px 18px", border: `1px solid ${T.greenBorder}`, borderRadius: 20, background: T.greenBg, letterSpacing: "2px", textTransform: "uppercase" }}>
            {_data.location}
          </div>

          <h1 className="vp-glitch" data-text={_data.name}
            style={{ fontSize: "clamp(3rem, 10vw, 5.5rem)", fontWeight: 800, color: T.heading, letterSpacing: "-2px", margin: "12px 0 8px", lineHeight: 1.1 }}>
            {_data.name}
          </h1>

          <p style={{ fontSize: "1.4rem", color: T.green, margin: "0 0 6px", fontWeight: 500, textShadow: `0 0 20px ${T.glow}`, height: "1.6em" }}>
            {typedText}<span className="vp-type-cursor" />
          </p>

          <p key={tagIdx} style={{ fontSize: "0.82rem", color: T.dim, marginBottom: 36, letterSpacing: "1px", maxWidth: 480, animation: "fadeIn 0.5s ease" }}>
            {taglines[tagIdx]}
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            {[
              { label: "View Work", href: "#projects", cls: "vp-neon-btn" },
              { label: "Get in Touch", href: "#contact", cls: "vp-ghost-btn" },
            ].map((btn) => (
              <a key={btn.label} ref={(el) => magneticRefs.current[btn.label] = el}
                className={`vp-magnetic ${btn.cls}`}
                href={btn.href}
                onClick={(e) => { e.preventDefault(); document.querySelector(btn.href)?.scrollIntoView({ behavior: "smooth" }); }}
                onMouseMove={(e) => onMagneticMove(e, btn.label)}
                onMouseLeave={() => onMagneticLeave(btn.label)}
                style={{
                  padding: "10px 28px", borderRadius: 8, textDecoration: "none",
                  fontSize: "0.82rem", letterSpacing: "2px", textTransform: "uppercase",
                  cursor: "none",
                  ...(btn.cls === "vp-neon-btn"
                    ? { border: `1px solid ${T.green}`, color: T.green, background: "transparent" }
                    : { border: `1px solid ${T.border}`, color: T.text, background: "transparent" }),
                }}
                onMouseEnter={(e) => { if (btn.cls !== "vp-neon-btn") { e.target.style.borderColor = T.green; e.target.style.color = T.green; } }}
                onMouseLeave={(e) => { if (btn.cls !== "vp-neon-btn") { e.target.style.borderColor = T.border; e.target.style.color = T.text; } }}>
                {btn.label}
              </a>
            ))}
          </div>

          {/* Social */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 40 }}>
            {socialLinks.map(([label, url]) => (
              <a key={label} href={url} target={url?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="vp-social-link"
                style={{ fontFamily: "monospace", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.5px", cursor: "none" }}>
                {label}
              </a>
            ))}
          </div>

          {/* Stats */}
          <div ref={statsRef} style={{ display: "flex", gap: 0, justifyContent: "center", flexWrap: "wrap", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, background: T.statBg, borderRadius: 12, overflow: "hidden" }}>
            {[
              { num: projectsCount, label: "Projects" },
              { num: skillsCount, label: "Skills" },
              { num: expCount, label: "Experience" },
              { num: _data.clients, label: "Clients" },
            ].map((s, i) => (
              <div key={s.label} className="vp-stat" style={{ border: "none", borderRight: i < 3 ? `1px solid ${T.border}` : "none", borderRadius: 0, minWidth: 100, flex: 1 }}>
                <div className="vp-stat-num" style={{ color: [T.green, "#00d4ff", "#ff00ff", "#ffd700"][i] }}>{s.num}</div>
                <div className="vp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ─── About ─── */}
        <Section id="about" title="About" theme={T}>
          <div className="vp-neon-card vp-grad-border" style={{ maxWidth: 640, background: T.cardBg }}>
            <div className="vp-corner vp-corner-tl" />
            <div className="vp-corner vp-corner-tr" />
            <div className="vp-corner vp-corner-bl" />
            <div className="vp-corner vp-corner-br" />
            <div style={{ fontSize: "2.5rem", color: T.green, opacity: 0.15, lineHeight: 1, marginBottom: -16, userSelect: "none" }}>&ldquo;</div>
            {_data.about.map((p, i) => (
              <p key={i} style={{ fontSize: "1.05rem", lineHeight: 1.8, color: T.muted, marginBottom: 12 }}>{p}</p>
            ))}
          </div>
        </Section>

        {/* ─── Services ─── */}
        <Section id="services" title="Services" theme={T}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {SERVICES.map((svc) => (
              <div key={svc.title} className="vp-service-card vp-grad-border"
                style={{ background: T.cardBg, cursor: "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${svc.color}30`; e.currentTarget.style.boxShadow = `0 0 25px ${svc.color}08`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div className="vp-service-icon" style={{ color: svc.color }}>{svc.icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: T.heading, margin: "0 0 8px" }}>{svc.title}</h3>
                <p style={{ fontSize: "0.82rem", color: T.muted, lineHeight: 1.7, margin: 0 }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Skills ─── */}
        <Section id="skills" title="Skills" theme={T}>
          <div style={{ display: "grid", gap: 14, maxWidth: 500 }}>
            {_data.skills.map((s, i) => (
              <div key={s.name} className="vp-skill-item"
                style={{ borderLeft: `3px solid ${NEON_COLORS[i % NEON_COLORS.length]}30`, cursor: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.9rem", color: T.text, fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: NEON_COLORS[i % NEON_COLORS.length], textShadow: `0 0 8px ${NEON_COLORS[i % NEON_COLORS.length]}40` }}>
                    {pct(s.level)}%
                  </span>
                </div>
                <div className="vp-skill-bar-track">
                  <SkillFill pct={pct(s.level)} color={NEON_COLORS[i % NEON_COLORS.length]} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Projects ─── */}
        <Section id="projects" title="Projects" theme={T}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {_data.projects.map((p) => (
              <TiltCard key={p.name} style={{ background: "rgba(255,255,255,0.015)", padding: 24 }}>
                <span className="vp-project-badge" style={{
                  color: "#00d4ff", borderColor: "rgba(0,212,255,0.25)", background: "rgba(0,212,255,0.06)",
                }}>Featured</span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: T.heading, margin: "0 0 8px" }}>{p.name}</h3>
                <p style={{ fontSize: "0.88rem", color: T.muted, lineHeight: 1.6, margin: "0 0 14px" }}>{p.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {p.tech.split(" · ").map((t, j) => (
                    <span key={t} className="vp-tag"
                      style={{ color: NEON_COLORS[j % NEON_COLORS.length], borderColor: `${NEON_COLORS[j % NEON_COLORS.length]}30`, background: `${NEON_COLORS[j % NEON_COLORS.length]}08` }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer" className="vp-neon-btn" style={{ fontSize: "0.7rem", padding: "6px 16px", letterSpacing: "1px", cursor: "none" }}>Live</a>}
                  {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.7rem", padding: "6px 16px", background: "transparent", color: T.muted, borderRadius: 6, textDecoration: "none", border: `1px solid ${T.border}`, letterSpacing: "1px", textTransform: "uppercase", transition: "all 0.3s", cursor: "none" }}
                    onMouseEnter={(e) => { e.target.style.borderColor = "#00d4ff"; e.target.style.color = "#00d4ff"; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = T.border; e.target.style.color = T.muted; }}>
                    Repo
                  </a>}
                </div>
              </TiltCard>
            ))}
          </div>
        </Section>

        {/* ─── Marquee ─── */}
        <div className="vp-marquee-wrap" style={{ margin: "40px 0", padding: "20px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
          <div className="vp-marquee">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="vp-marquee-item">
                {item}
                <span className="vp-marquee-dot" />
              </span>
            ))}
          </div>
        </div>

        {/* ─── Experience ─── */}
        <Section id="experience" title="Experience" theme={T}>
          <div className="vp-timeline">
            {_data.experience.map((e, i) => (
              <div key={i} className="vp-timeline-item" style={{ cursor: "none" }}>
                <div className="vp-timeline-dot"
                  style={{ background: NEON_COLORS[i % NEON_COLORS.length], color: NEON_COLORS[i % NEON_COLORS.length] }} />
                <div style={{ fontSize: "0.82rem", color: T.dim, letterSpacing: "1px" }}>{e.period}</div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: T.heading, margin: "2px 0" }}>{e.role}</h3>
                <div style={{ fontSize: "0.9rem", color: NEON_COLORS[i % NEON_COLORS.length], marginBottom: 6, textShadow: `0 0 8px ${NEON_COLORS[i % NEON_COLORS.length]}40` }}>{e.company}</div>
                <p style={{ fontSize: "0.9rem", color: T.muted, lineHeight: 1.7, margin: 0 }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Achievements ─── */}
        <Section id="achievements" title="Achievements" theme={T}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {ACHIEVEMENTS.map((a) => (
              <div key={a.label} className="vp-achieve" style={{ cursor: "none" }}>
                <div className="vp-achieve-icon" style={{ background: `${T.green}10`, color: T.green }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: T.heading }}>{a.label}</div>
                  <div style={{ fontSize: "0.78rem", color: T.dim }}>{a.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Contact ─── */}
        <Section id="contact" title="Contact" theme={T} noDivider>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {[
              ["@" + _data.email.split("@")[0], `mailto:${_data.email}`],
              ["GitHub", _data.github],
              ["LinkedIn", _data.linkedin],
              ["Twitter", _data.twitter],
            ].map(([label, href]) => (
              <a key={label} href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="vp-contact-link" style={{ cursor: "none" }}>
                <span style={{ color: T.green, fontSize: "0.7rem" }}>&#9656;</span>
                {label}
              </a>
            ))}
          </div>
        </Section>
      </div>

      <footer style={{ textAlign: "center", padding: "40px 24px", fontSize: "0.85rem", color: T.dim, borderTop: `1px solid ${T.footerBorder}` }}>
        <p>{_data.name} &copy; {new Date().getFullYear()} &middot; Built with React</p>
      </footer>

      <button className={`vp-back-top ${scrollY > 300 ? "visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ cursor: "none" }}>
        &#8593;
      </button>
    </div>
  );
}

function SkillFill({ pct: p, color }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.width = `${p}%`; o.unobserve(el); }
    }, { threshold: 0.3 });
    o.observe(el);
    return () => o.disconnect();
  }, [p]);
  return (
    <div ref={ref} className="vp-skill-fill"
      style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)`, boxShadow: `0 0 10px ${color}60` }} />
  );
}
