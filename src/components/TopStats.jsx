import { useState, useEffect, useCallback } from "react";

function rand(min, max) { return (Math.random() * (max - min) + min).toFixed(1); }

const PROC = [
  { pid: 1324, user: "atio", cpu: "--", mem: "--", cmd: "nginx -g daemon off;" },
  { pid: 2314, user: "atio", cpu: "--", mem: "--", cmd: "node server.js" },
  { pid: 3912, user: "atio", cpu: "--", mem: "--", cmd: "python3 worker.py" },
  { pid: 4211, user: "root", cpu: "--", mem: "--", cmd: "dockerd" },
  { pid: 5823, user: "atio", cpu: "--", mem: "--", cmd: "redis-server" },
  { pid: 6331, user: "atio", cpu: "--", mem: "--", cmd: "postgres -D /var/lib/postgres" },
];

export default function TopStats({ onExit }) {
  const [stats, setStats] = useState({
    cpu: 0, mem: 0, disk: 0,
    uptime: "00:00:00",
    procs: PROC.map(p => ({ ...p, cpu: "0.0", mem: "0.0" })),
  });

  const tick = useCallback(() => {
    setStats((prev) => ({
      cpu: +rand(5, 45),
      mem: +rand(30, 75),
      disk: +rand(40, 80),
      uptime: prev.uptime,
      procs: prev.procs.map((p) => ({
        ...p,
        cpu: rand(0.1, 12),
        mem: rand(0.5, 8),
      })),
    }));
  }, []);

  useEffect(() => {
    tick();
    const iv = setInterval(tick, 1500);
    document.addEventListener("keydown", handleKey);
    return () => { clearInterval(iv); document.removeEventListener("keydown", handleKey); };
  }, []);

  const handleKey = (e) => {
    if (e.key === "Escape" || e.key === "q" || e.key === "Enter") {
      onExit();
    }
  };

  const bar = (pct) => {
    const w = 20;
    const filled = Math.round((pct / 100) * w);
    return "\u2588".repeat(filled) + "\u2591".repeat(w - filled);
  };

  return (
    <div className="top-overlay" onClick={onExit}>
      <div className="top-window" onClick={(e) => e.stopPropagation()}>
        <div className="top-header">
          <span className="top-title">top - {stats.uptime} up</span>
          <button className="top-close" onClick={onExit}>\u2715</button>
        </div>

        <div className="top-body">
          <div className="top-stats-row">
            <span className="top-label">CPU</span>
            <span className="top-bar-text">{bar(stats.cpu)} {stats.cpu}%</span>
          </div>
          <div className="top-stats-row">
            <span className="top-label">MEM</span>
            <span className="top-bar-text">{bar(stats.mem)} {stats.mem}%</span>
          </div>
          <div className="top-stats-row">
            <span className="top-label">DISK</span>
            <span className="top-bar-text">{bar(stats.disk)} {stats.disk}%</span>
          </div>

          <div className="top-proc-header">
            <span>PID    USER     CPU%   MEM%   COMMAND</span>
          </div>
          {stats.procs.map((p) => (
            <div key={p.pid} className="top-proc-row">
              <span>{String(p.pid).padEnd(6)} </span>
              <span>{p.user.padEnd(8)}</span>
              <span>{p.cpu.padStart(5)} </span>
              <span>{p.mem.padStart(6)}  </span>
              <span>{p.cmd}</span>
            </div>
          ))}
          <div className="top-hint">Press Esc / q / Enter or click outside to exit</div>
        </div>
      </div>
    </div>
  );
}
