import { useState, useEffect, useRef } from "react";

const W = 600;
const H = 360;
const PAD_W = 8;
const PAD_H = 60;
const BALL_SZ = 10;
const WIN = 5;
const SPEED = 4;

function init() {
  return {
    bx: W / 2 - BALL_SZ / 2,
    by: H / 2 - BALL_SZ / 2,
    dx: (Math.random() > 0.5 ? 1 : -1) * SPEED,
    dy: (Math.random() * 2 - 1) * SPEED * 0.6,
    p1: H / 2 - PAD_H / 2,
    p2: H / 2 - PAD_H / 2,
    s1: 0,
    s2: 0,
  };
}

export default function Pong({ onExit }) {
  const [g, setG] = useState(init);
  const keys = useRef({ up: false, down: false });
  const gRef = useRef(g);
  const [flash, setFlash] = useState(0);
  const [scale, setScale] = useState(1);
  const wrapRef = useRef(null);

  useEffect(() => { gRef.current = g; }, [g]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(Math.min(w / 600, 1));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape" || e.key === "q") { onExit(); return; }
      if (e.key === "r") { setG(init()); setFlash(0); return; }
      if (e.key === "w" || e.key === "W") { keys.current.up = e.type === "keydown"; e.preventDefault(); }
      if (e.key === "s" || e.key === "S") { keys.current.down = e.type === "keydown"; e.preventDefault(); }
    };
    document.addEventListener("keydown", h);
    document.addEventListener("keyup", h);
    return () => { document.removeEventListener("keydown", h); document.removeEventListener("keyup", h); };
  }, [onExit]);

  useEffect(() => {
    const iv = setInterval(() => {
      setG((prev) => {
        const k = keys.current;
        let { bx, by, dx, dy, p1, p2, s1, s2 } = prev;

        if (k.up && p1 > 0) p1 -= 5;
        if (k.down && p1 + PAD_H < H) p1 += 5;

        const target = by + BALL_SZ / 2 - PAD_H / 2;
        const err = Math.sin(Date.now() / 400) * 3;
        if (p2 + PAD_H / 2 < target + err + 1 && p2 + PAD_H < H) p2 += 3.5;
        if (p2 + PAD_H / 2 > target + err - 1 && p2 > 0) p2 -= 3.5;

        bx += dx;
        by += dy;

        if (by < 0) { by = 0; dy *= -1; }
        if (by + BALL_SZ > H) { by = H - BALL_SZ; dy *= -1; }

        if (bx <= PAD_W && by + BALL_SZ > p1 && by < p1 + PAD_H) {
          bx = PAD_W;
          dx = Math.abs(dx) * 1.08;
          const off = (by + BALL_SZ / 2 - (p1 + PAD_H / 2)) / (PAD_H / 2);
          dy += off * 2;
          const m = Math.sqrt(dx * dx + dy * dy);
          dx = (dx / m) * SPEED * 1.08;
          dy = (dy / m) * SPEED * 1.08;
        }

        if (bx + BALL_SZ >= W - PAD_W && by + BALL_SZ > p2 && by < p2 + PAD_H) {
          bx = W - PAD_W - BALL_SZ;
          dx = -Math.abs(dx) * 1.08;
          const off = (by + BALL_SZ / 2 - (p2 + PAD_H / 2)) / (PAD_H / 2);
          dy += off * 2;
          const m = Math.sqrt(dx * dx + dy * dy);
          dx = -(dx / m) * SPEED * 1.08;
          dy = (dy / m) * SPEED * 1.08;
        }

        let scored = false;
        if (bx < 0) { s2++; scored = true; }
        if (bx + BALL_SZ > W) { s1++; scored = true; }

        if (scored) {
          setFlash(8);
          const d = (Math.random() > 0.5 ? 1 : -1) * SPEED;
          const dy2 = (Math.random() * 2 - 1) * SPEED * 0.6;
          return { bx: W / 2 - BALL_SZ / 2, by: H / 2 - BALL_SZ / 2, dx: d, dy: dy2, p1, p2, s1, s2 };
        }

        return { bx, by, dx, dy, p1, p2, s1, s2 };
      });
    }, 16);
    return () => clearInterval(iv);
  }, []);

  const won = g.s1 >= WIN || g.s2 >= WIN;

  return (
    <div className="top-overlay pong-overlay" onClick={onExit}>
      <div className="pong-outer" onClick={(e) => e.stopPropagation()}>
        <div className="pong-hud">
          <span className={`pong-score ${g.s1 >= g.s2 ? "pong-score-lead" : ""}`}>{String(g.s1).padStart(2, "0")}</span>
          <span className="pong-vs">VS</span>
          <span className={`pong-score ${g.s2 >= g.s1 ? "pong-score-lead" : ""}`}>{String(g.s2).padStart(2, "0")}</span>
          <div className="pong-hud-controls">W/S &middot; R restart &middot; Esc exit</div>
        </div>

        <div className="pong-field-wrap" ref={wrapRef} style={{ height: 360 * scale }}>
          <div className={`pong-field ${flash > 0 ? "pong-field-flash" : ""}`} style={{ transform: `scale(${scale})` }}>
            <div className="pong-center-line">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="pong-center-dot" />
              ))}
            </div>

            <div className="pong-paddle pong-paddle-left" style={{ top: g.p1, height: PAD_H }} />
            <div className="pong-paddle pong-paddle-right" style={{ top: g.p2, height: PAD_H }} />

            <div className="pong-ball" style={{ left: g.bx, top: g.by, width: BALL_SZ, height: BALL_SZ }} />

            {won && (
              <div className="pong-over">
                <div className="pong-over-msg">{g.s1 >= WIN ? "YOU WIN" : "AI WINS"}</div>
                <div className="pong-over-sub">Press R for rematch</div>
              </div>
            )}
          </div>
        </div>
        <div className="pong-controls show" style={{ padding: "0 16px 16px" }}>
          <button className="game-btn game-btn-wide"
            onPointerDown={(e) => { e.preventDefault(); keys.current.up = true; }}
            onPointerUp={() => { keys.current.up = false; }}
            onPointerLeave={() => { keys.current.up = false; }}>&#9650; Up</button>
          <button className="game-btn game-btn-wide"
            onPointerDown={(e) => { e.preventDefault(); keys.current.down = true; }}
            onPointerUp={() => { keys.current.down = false; }}
            onPointerLeave={() => { keys.current.down = false; }}>&#9660; Down</button>
          <button className="game-btn game-btn-wide" onClick={() => { setG(init()); setFlash(0); }}>Restart</button>
        </div>
      </div>
    </div>
  );
}
