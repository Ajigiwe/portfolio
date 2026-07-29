import { useMemo } from "react";

const COUNT = 30;

export default function Particles() {
  const dots = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 8,
      dur: Math.random() * 6 + 4,
      alpha: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  return (
    <div className="particles">
      {dots.map((d) => (
        <span
          key={d.id}
          className="particle"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.alpha,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
