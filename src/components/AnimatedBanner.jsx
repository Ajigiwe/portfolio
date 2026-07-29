import { useState, useEffect } from "react";

const L1 = "╔══════════════════════════════════════╗";
const L2 = "║                                     ║";
const L3 = "║                                     ║";
const L4 = "║                                     ║";
const L5 = "║                                     ║";
const L6 = "╚══════════════════════════════════════╝";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

function scramble(len) {
  let s = "";
  for (let i = 0; i < len; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return s;
}

const TARGET = "  ATIO  ";

export default function AnimatedBanner() {
  const [text, setText] = useState(scramble(TARGET.length));
  const [tagline, setTagline] = useState("");
  const [done, setDone] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  useEffect(() => {
    let frame = 0;
    const maxFrames = 20;
    const iv = setInterval(() => {
      frame++;
      if (frame < maxFrames) {
        const p = Math.floor((frame / maxFrames) * TARGET.length);
        const partial = TARGET.slice(0, p);
        const rest = scramble(TARGET.length - p);
        setText(partial + rest);
        if (p > 0) setActiveIdx(p - 1);
      } else {
        setText(TARGET);
        setActiveIdx(TARGET.length - 1);
        clearInterval(iv);
        setTimeout(() => {
          setDone(true);
          let ti = 0;
          const tag = "full stack vibe coder";
          const tiv = setInterval(() => {
            ti++;
            setTagline(tag.slice(0, ti));
            if (ti >= tag.length) clearInterval(tiv);
          }, 40);
        }, 400);
      }
    }, 60);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className={`abanner ${done ? "abanner-done" : ""}`}>
      <div className="abanner-box">
        <div className="abanner-line">{L1}</div>
        <div className="abanner-line">{L2}</div>
        <div className="abanner-line-center">
          <span className="abanner-text">
            {text.split("").map((ch, i) => (
              <span
                key={i}
                className={`abanner-char ${i <= activeIdx ? "abanner-revealed" : ""}`}
              >
                {ch}
              </span>
            ))}
          </span>
        </div>
        <div className="abanner-line">{L4}</div>
        <div className="abanner-line-center">
          {done ? (
            <span className="abanner-tagline">
              <span className="abanner-arrow">&#9656;</span> {tagline}
              <span className="abanner-cursor">_</span>
            </span>
          ) : (
            <span className="abanner-placeholder">&nbsp;</span>
          )}
        </div>
        <div className="abanner-line">{L6}</div>
      </div>
    </div>
  );
}
