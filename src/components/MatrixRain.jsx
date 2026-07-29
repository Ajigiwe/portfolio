import { useEffect, useState } from "react";

const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";

function randomChar() {
  return chars[Math.floor(Math.random() * chars.length)];
}

export default function MatrixRain({ onExit }) {
  const [show, setShow] = useState(true);
  const [drops] = useState(() =>
    Array.from({ length: 50 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      speed: 1.5 + Math.random() * 2.5,
      char: randomChar(),
    }))
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "q" || e.key === "Enter") setShow(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!show) {
      const t = setTimeout(onExit, 100);
      return () => clearTimeout(t);
    }
  }, [show, onExit]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        overflow: "hidden",
      }}
      onClick={() => setShow(false)}
    >
      <style>{`
        @keyframes matrixFall {
          0% { transform: translateY(-100vh); opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
      {drops.map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${d.top}%`,
            left: `${d.left}%`,
            fontFamily: "monospace",
            fontSize: 16,
            color: "#00ff6a",
            textShadow: "0 0 8px rgba(0, 255, 106, 0.6)",
            animation: `matrixFall ${d.speed}s linear ${d.delay}s infinite`,
            pointerEvents: "none",
          }}
        >
          {d.char}
        </span>
      ))}
    </div>
  );
}
