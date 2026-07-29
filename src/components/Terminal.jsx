import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import useTypewriter from "../hooks/useTypewriter";
import useSound from "../hooks/useSound";
import MatrixRain from "./MatrixRain";
import Particles from "./Particles";
import TopStats from "./TopStats";
import SnakeGame from "./SnakeGame";
import HackerTyper from "./HackerTyper";
import Game2048 from "./Game2048";
import Pong from "./Pong";
import Ping from "./Ping";
import AnimatedBanner from "./AnimatedBanner";

const fixUrl = (u) => u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`;

const fortunes = [
  "Keep it simple, stupid. — Kelly Johnson",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "First, solve the problem. Then, write the code. — John Johnson",
  "Code is like humor. When you have to explain it, it's bad. — Cory House",
  "Make it work, make it right, make it fast. — Kent Beck",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
  "Software is a great combination of art and engineering. — Bill Gates",
  "Programming isn't about what you know; it's about what you can figure out. — Chris Pine",
  "The best way to predict the future is to invent it. — Alan Kay",
  "Simplicity is prerequisite for reliability. — Edsger W. Dijkstra",
  "Debugging is twice as hard as writing the code in the first place. — Brian Kernighan",
  "Before software can be reusable it first has to be usable. — Ralph Johnson",
  "Fix the cause, not the symptom. — Steve Maguire",
  "Optimism is an occupational hazard of programming. — Kent Beck",
  "The only way to go fast is to go well. — Robert C. Martin",
];

function formatDate() {
  return new Date().toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZoneName: "short",
  });
}

const COMMANDS = [
  "about", "skills", "projects", "experience", "exp", "contact",
  "whoami", "help", "banner", "date", "theme", "neofetch", "fetch",
  "sudo", "ls", "clear", "repo", "fortune", "matrix", "cowsay",
  "ping", "admin", "top", "stats", "snake",   "hack", "hackertyper", "2048", "pong",
];

export default function Terminal() {
  const [history, setHistory] = useState([]);
  const [cmd, setCmd] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [savedInput, setSavedInput] = useState("");
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("term-theme") || "dark"
  );
  const [bootDone, setBootDone] = useState(false);
  const [autoDone, setAutoDone] = useState(false);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  const navigate = useNavigate();
  const { data } = useContent();
  const { click: sClick, boot: sBoot, error: sError, success: sSuccess } = useSound();
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem("term-sound") !== "off");

  const bootLines = [
    "[  ok  ] systemd-networkd.service — Network Configuration",
    "[  ok  ] ssh.service — OpenSSH Daemon",
    "[  ok  ] docker.service — Docker Application Container Engine",
    "[  ok  ] nginx.service — A high-performance web server",
    "",
    "Arch Linux 6.8.2-arch1-zen (tty1)",
    `${data.name}@portfolio ~ $ _`,
  ];

  const [matrixMode, setMatrixMode] = useState(false);
  const [topMode, setTopMode] = useState(false);
  const [snakeMode, setSnakeMode] = useState(false);
  const [hackMode, setHackMode] = useState(false);
  const [g2048Mode, setG2048Mode] = useState(false);
  const [pongMode, setPongMode] = useState(false);
  const [pingMode, setPingMode] = useState(false);
  const [fortune] = useState(() => fortunes[Math.floor(Math.random() * fortunes.length)]);

  const { lines: typed, done: typingDone } = useTypewriter(
    ["Welcome to Atio's terminal portfolio.", "Type 'help' to see available commands."],
    { speed: 40, delay: 1200 }
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("term-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("term-sound", soundOn ? "on" : "off");
  }, [soundOn]);

  useEffect(() => {
    if (bootDone && soundOn) sBoot();
  }, [bootDone]);

  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), bootLines.length * 100 + 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typingDone) {
      const t = setTimeout(() => setAutoDone(true), 300);
      return () => clearTimeout(t);
    }
  }, [typingDone]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
  }, [history, typed, bootDone]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const processCmd = useCallback((input) => {
    const trimmed = input.trim().toLowerCase();
    const output = { cmd: input, result: [] };

    if (trimmed) {
      setCmdHistory((prev) => {
        if (prev[prev.length - 1] !== trimmed) return [...prev, trimmed];
        return prev;
      });
    }
    setHistIdx(-1);

    if (trimmed === "matrix") {
      setMatrixMode(true);
      return;
    }

    if (trimmed === "top" || trimmed === "stats") {
      setTopMode(true);
      return;
    }

    if (trimmed === "snake") {
      setSnakeMode(true);
      return;
    }

    if (trimmed === "hack" || trimmed === "hackertyper") {
      setHackMode(true);
      return;
    }

    if (trimmed === "2048") {
      setG2048Mode(true);
      return;
    }

    if (trimmed === "pong") {
      setPongMode(true);
      return;
    }

    if (!trimmed) {
      output.result = [""];
    } else if (trimmed === "help") {
      output.result = ["", "  ╭─ Available Commands ─────────────────╮"];
      output.result.push("  │                                    │");
      output.result.push(`  │  about       About ${data.name}           │`);
      output.result.push("  │  skills      Technical skills     │");
      output.result.push("  │  projects    Project showcase     │");
      output.result.push("  │  experience  Work history         │");
      output.result.push("  │  contact     Get in touch         │");
      output.result.push("  │  whoami      Who you're talking   │");
      output.result.push("  │  banner      Display ASCII art    │");
      output.result.push("  │  date        Current date/time    │");
      output.result.push("  │  theme       Toggle theme mode    │");
      output.result.push("  │  neofetch    System info (fun)    │");
      output.result.push("  │  clear       Clear terminal       │");
      output.result.push("  │  sudo        ???                  │");
      output.result.push("  │  ls          List all sections    │");
      output.result.push("  │  repo        Source code          │");
      output.result.push("  │  fortune     Random dev quote     │");
      output.result.push("  │  matrix      Matrix rain (Esc|q)  │");
      output.result.push("  │  top         Live system stats    │");
      output.result.push("  │  snake       Play Snake game      │");
      output.result.push("  │  2048       2048 puzzle (Esc|q)  │");
      output.result.push("  │  pong        Pong vs AI (Esc|q)   │");
      output.result.push("  │  hack        Hacker typer (Esc|q) │");
      output.result.push("  │  cowsay      ASCII cow says hi    │");
      output.result.push("  │  ping        Live ping (Esc|q)    │");
      output.result.push("  │                                    │");
      output.result.push("  ╰────────────────────────────────────╯");
    } else if (trimmed === "about") {
      output.result = ["", `  ${data.name} — ${data.title}`, `  ${"─".repeat(30)}`, ""];
      data.about.forEach((p) => output.result.push(`  ${p}`));
    } else if (trimmed === "whoami") {
      output.result = [
        "",
        `  ${data.name}`,
        `  ${data.title}`,
        `  ${data.location}`,
        `  ${data.email}`,
        `  github.com/${data.github.split("/").pop()}`,
      ];
    } else if (trimmed === "skills") {
      output.result = ["", "  SKILLS", `  ${"─".repeat(30)}`, ""];
      data.skills.forEach((s) => {
        const pct = parseInt(s.level.match(/(\d+)%/)?.[1] || 0);
        output.result.push(
          <div key={`skill-${s.name}`} className="skill-line">
            <span className="skill-name">{s.name}</span>
            <div className="skill-bar-bg">
              <div className="skill-bar-fill" style={{ '--w': `${pct}%` }} />
            </div>
            <span className="skill-pct">{pct}%</span>
          </div>
        );
      });
    } else if (trimmed === "projects") {
      output.result = ["", "  PROJECTS", `  ${"─".repeat(30)}`, ""];
      data.projects.forEach((p) => {
        output.result.push(`  \x1b[36m${p.name}\x1b[0m`);
        output.result.push(`  ${p.desc}`);
        output.result.push(`  [${p.tech}]`);
        output.result.push(
          <div key={`links-${p.name}`} className="project-links" style={{display:'flex',gap:'8px',padding:'4px 0 0 24px'}}>
            {p.live && <button className="project-btn" onClick={(e)=>{e.stopPropagation();window.open(fixUrl(p.live),'_blank','noopener')}}>LIVE</button>}
            {p.github && <button className="project-btn" onClick={(e)=>{e.stopPropagation();window.open(fixUrl(p.github),'_blank','noopener')}}>REPO</button>}
          </div>
        );
        output.result.push("");
      });
    } else if (trimmed === "experience" || trimmed === "exp") {
      output.result = ["", "  EXPERIENCE", `  ${"─".repeat(30)}`, ""];
      data.experience.forEach((e) => {
        output.result.push(`  \x1b[36m${e.role}\x1b[0m @ ${e.company}`);
        output.result.push(`  ${e.period}`);
        output.result.push(`  ${e.desc}`);
        output.result.push("");
      });
    } else if (trimmed === "contact") {
      output.result = [
        "",
        "  CONTACT",
        `  ${"─".repeat(30)}`,
        "",
        `  Email    ${data.email}`,
        `  GitHub   ${data.github}`,
        `  Twitter  ${data.twitter}`,
        "",
        "  Open to freelance, collab, and interesting projects.",
      ];
    } else if (trimmed === "banner") {
      output.result = ["", <AnimatedBanner key="banner-cmd" />, ""];
    } else if (trimmed === "date") {
      output.result = [`  ${formatDate()}`];
    } else if (trimmed === "theme") {
      const next = theme === "dark" ? "light" : "dark";
      setTheme(next);
      output.result = [`  Theme set to \x1b[36m${next}\x1b[0m`];
    } else if (trimmed === "clear") {
      setHistory([]);
      return;
    } else if (trimmed === "sudo") {
      output.result = [
        "",
        "  Permission denied. Try asking nicely.",
        "  Actually, even then — no.",
        "  ¯\\_(ツ)_/¯",
      ];
    } else if (trimmed === "ls") {
      output.result = ["  about/   skills/   projects/   experience/   contact/"];
    } else if (trimmed === "neofetch" || trimmed === "fetch") {
      const colors = "\x1b[36m";
      output.result = [
        "",
        `  ${data.name}@portfolio`,
        `  ${"─".repeat(30)}`,
        `  OS        Arch Linux x86_64`,
        `  Host      Custom-built`,
        `  Kernel    6.8.2-arch1-zen`,
        `  Uptime    100,000+ hours`,
        `  Packages  ∞ npm modules`,
        `  Shell     bash 5.2.26`,
        `  Terminal  ${data.name} Portfolio`,
        `  CPU       AMD Ryzen 9 7950X (32) @ 5.7GHz`,
        `  GPU       NVIDIA RTX 4090 24GB`,
        `  Memory    17456MiB / 32178MiB`,
        `  Disk      847GiB / 1.8TiB`,
        `  WM        ${theme === "dark" ? "Neon" : "Daylight"}`,
        `  Theme     ${theme === "dark" ? "Terminal Dark" : "Terminal Light"}`,
        "",
      ];
    } else if (trimmed.startsWith("cowsay")) {
      const msg = trimmed.slice(7).trim() || fortunes[Math.floor(Math.random() * fortunes.length)];
      const border = "─".repeat(Math.min(msg.length + 2, 60));
      output.result = [
        "",
        `  ╭${border}╮`,
        `  │ ${msg} │`,
        `  ╰${border}╯`,
        `        \\   ^__^`,
        `         \\  (oo)\\_______`,
        `            (__)\\       )\\/\\`,
        `                ||----w |`,
        `                ||     ||`,
        "",
      ];
    } else if (trimmed === "ping") {
      setPingMode(true);
      return;
    } else if (trimmed === "admin") {
      navigate("/admin");
      return;
    } else if (trimmed === "fortune") {
      const f = fortunes[Math.floor(Math.random() * fortunes.length)];
      output.result = ["", `  "${f}"`, ""];
    } else {
      output.result = [`  bash: ${trimmed}: command not found. Try 'help'.`];
      if (soundOn) sError();
    }

    if (soundOn && trimmed && trimmed !== "matrix") {
      const known = ["about", "skills", "projects", "experience", "exp", "contact", "whoami", "help", "banner", "date", "theme", "neofetch", "fetch", "sudo", "ls", "clear", "repo", "fortune", "cowsay", "ping", "admin", "top", "stats", "snake", "hack", "hackertyper", "2048", "pong"];
      if (known.includes(trimmed)) sSuccess();
    }

    setHistory((prev) => [...prev, output]);
    scrollToBottom();
  }, [theme, scrollToBottom, soundOn, sError, sSuccess]);

  const handleKey = (e) => {
    if (e.key === "Enter") {
      processCmd(cmd);
      setCmd("");
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      if (histIdx === -1) setSavedInput(cmd);
      const nextIdx = histIdx === -1 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(nextIdx);
      setCmd(cmdHistory[nextIdx]);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === -1) return;
      const nextIdx = histIdx + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistIdx(-1);
        setCmd(savedInput);
        return;
      }
      setHistIdx(nextIdx);
      setCmd(cmdHistory[nextIdx]);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const partial = cmd.trim().toLowerCase();
      if (!partial) return;
      const matches = COMMANDS.filter((c) => c.startsWith(partial));
      if (matches.length === 0) return;
      if (matches.length === 1) {
        setCmd(matches[0]);
      } else {
        const common = matches.reduce((a, b) => {
          let i = 0;
          while (i < a.length && a[i] === b[i]) i++;
          return a.slice(0, i);
        });
        if (common.length > partial.length) {
          setCmd(common);
        }
      }
      return;
    }
  };

  const clickCmd = (name) => {
    setCmd("");
    processCmd(name);
    inputRef.current?.focus();
  };

  const renderLine = (line, i) => {
    if (!line) return <br key={i} />;
    const parts = line.split(/(\x1b\[36m|\x1b\[0m|\x1b\[link\x1b\[0m)/g);
    const nodes = [];
    let isCyan = false;
    let isLink = false;
    for (const p of parts) {
      if (p === "\x1b[36m") { isCyan = true; continue; }
      if (p === "\x1b[link\x1b[0m") { isLink = true; continue; }
      if (p === "\x1b[0m") { isCyan = false; isLink = false; continue; }
      const segs = p.split(/(https?:\/\/[^\s]+)/g);
      for (const seg of segs) {
        if (!seg) continue;
        const isUrl = /^https?:\/\//.test(seg);
        let el = isUrl ? <span key={`${i}-${seg}`} className="link" onClick={(e) => { e.stopPropagation(); window.open(fixUrl(seg), '_blank', 'noopener'); }} style={{cursor:'pointer', textDecoration:'underline', color:'var(--cyan)'}}>{seg}</span> : seg;
        if (isCyan) el = <span key={`${i}-${seg}-cyan`} className="cyan">{el}</span>;
        if (isLink) el = <span key={`${i}-${seg}-link`} className="link-label">{el}</span>;
        nodes.push(el);
      }
    }
    return <div key={i} className="line">{nodes}</div>;
  };

  return (
    <>
      <Particles />
      {matrixMode && <MatrixRain onExit={() => setMatrixMode(false)} />}
      {topMode && <TopStats onExit={() => setTopMode(false)} />}
      {snakeMode && <SnakeGame onExit={() => setSnakeMode(false)} />}
      {hackMode && <HackerTyper onExit={() => setHackMode(false)} />}
      {g2048Mode && <Game2048 onExit={() => setG2048Mode(false)} />}
      {pongMode && <Pong onExit={() => setPongMode(false)} />}
      {pingMode && <Ping onExit={() => setPingMode(false)} />}
      <div className="terminal-wrapper" onClick={() => inputRef.current?.focus()}>
      <div className="terminal">
        <div className="term-header">
          <span className="term-dot red" />
          <span className="term-dot yellow" />
          <span className="term-dot green" />
          <span className="term-title">{data.name}@portfolio:~/portfolio</span>
          <button
            className="term-theme-btn"
            onClick={(e) => { e.stopPropagation(); setTheme(t => t === "dark" ? "light" : "dark"); }}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "\u2566" : "\u2563"}
          </button>
          <button
            className="term-theme-btn"
            onClick={(e) => { e.stopPropagation(); setSoundOn(s => !s); }}
            title={soundOn ? "Mute sounds" : "Enable sounds"}
            aria-label="Toggle sound"
            style={{fontSize:'0.9rem'}}
          >
            {soundOn ? "\u266B" : "\u2715"}
          </button>
          <button
            className="term-theme-btn"
            onClick={(e) => { e.stopPropagation(); navigate("/visual"); }}
            title="Switch to visual mode"
            aria-label="Visual mode"
            style={{fontSize:'0.7rem', letterSpacing:'1px', width:'auto', padding:'0 10px'}}
          >
            Visual
          </button>
        </div>

        <div className="term-body" ref={outputRef}>
          {!bootDone ? (
            bootLines.map((l, i) => (
              <div
                key={i}
                className="line"
                style={{ animation: `fadeIn 0.08s ${i * 100}ms both` }}
              >
                {i === bootLines.length - 1 ? (
                  <span><span className="prompt">$ </span><span className="cursor blink" /></span>
                ) : l.startsWith("[") ? (
                  <span><span className="green">  {l}</span></span>
                ) : (
                  l
                )}
              </div>
            ))
          ) : (
            <>
              <div className="line">
                <span className="prompt">$ </span>
                <span className="cyan">banner</span>
              </div>
              <AnimatedBanner key="animated-banner" />

              {typed.map((l, i) => (
                <div key={`typed-${i}`} className="line">
                  <span className="prompt">$ </span>
                  {l}
                  {i === typed.length - 1 && !typingDone && <span className="cursor blink" />}
                </div>
              ))}

              {autoDone && (
                <>
                  <div className="line" style={{ marginTop: "10px" }}>
                    <span className="dim">  # {fortune}</span>
                  </div>
                  <div className="line">
                    <span className="prompt">$ </span>
                    <span className="cyan">help</span>
                  </div>
                </>
              )}

              {typingDone && (
                <div className="line hint-lines">
                  <span className="dim">  Type a command or click one below</span>
                </div>
              )}

              {history.map((entry, hi) => (
                <div key={`hist-${hi}`}>
                  <div className="line">
                    <span className="prompt">$ </span>{entry.cmd}
                  </div>
                  {entry.result.map((r, ri) => typeof r === 'string' ? renderLine(r, ri) : <div key={`elem-${hi}-${ri}`}>{r}</div>)}
                </div>
              ))}
            </>
          )}

          <div className="line input-line">
            <span className="prompt">$ </span>
            <input
              ref={inputRef}
              className="term-input"
              value={cmd}
              onChange={(e) => {
                setCmd(e.target.value);
                if (soundOn && e.target.value.length > cmd.length) sClick();
                if (histIdx !== -1) {
                  setHistIdx(-1);
                  setSavedInput("");
                }
              }}
              onKeyDown={handleKey}
              spellCheck={false}
              autoComplete="off"
              autoFocus
            />
          </div>
        </div>
      </div>

      {autoDone && (
        <div className="quick-cmds">
          {["about", "skills", "projects", "top", "snake", "2048", "pong", "hack", "fortune"].map((c) => (
            <button key={c} className="quick-cmd" onClick={() => clickCmd(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
