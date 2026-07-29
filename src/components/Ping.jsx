import { useState, useEffect, useRef } from "react";

const HOSTS = ["google.com", "cloudflare.com", "github.com", "8.8.8.8", "1.1.1.1"];
const SPARK_W = 30;

function sparkline(vals, maxW) {
  if (vals.length === 0) return "";
  const max = Math.max(...vals, 1);
  return vals.slice(-maxW).map((v) => {
    const h = Math.round((v / max) * 4);
    return "\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588"[h] || "\u2581";
  }).join("");
}

function msStr() {
  const ms = (Math.random() * 180 + 10).toFixed(2);
  return { ms: +ms, str: `${ms} ms` };
}

export default function Ping({ onExit }) {
  const [lines, setLines] = useState([]);
  const [times, setTimes] = useState([]);
  const [sent, setSent] = useState(0);
  const [rcvd, setRcvd] = useState(0);
  const [active, setActive] = useState(true);
  const host = useRef(HOSTS[Math.floor(Math.random() * HOSTS.length)]);
  const ip = useRef(`${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`);

  useEffect(() => {
    setLines([
      "",
      `  PING ${host.current} (${ip.current}) 56(84) bytes of data.`,
      "",
    ]);
  }, []);

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      const { ms, str } = msStr();
      const seq = sent + 1;
      const ttl = Math.floor(Math.random() * 50 + 100);
      const lost = Math.random() < 0.05;
      if (lost) {
        setLines((prev) => [...prev, `  Request timeout for icmp_seq=${seq}`]);
      } else {
        setLines((prev) => [...prev, `  64 bytes from ${ip.current}: icmp_seq=${seq} ttl=${ttl} time=${str}`]);
        setRcvd((r) => r + 1);
        setTimes((prev) => [...prev, ms]);
      }
      setSent((s) => s + 1);
      if (seq >= 8) setActive(false);
    }, 800 + Math.random() * 400);
    return () => clearInterval(iv);
  }, [active, sent]);

  const loss = sent > 0 ? ((sent - rcvd) / sent * 100).toFixed(0) : "0";
  const avg = times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) : "0.00";
  const min = times.length > 0 ? Math.min(...times).toFixed(2) : "0.00";
  const max = times.length > 0 ? Math.max(...times).toFixed(2) : "0.00";

  return (
    <div className="top-overlay" onClick={onExit}>
      <div className="ping-window" onClick={(e) => e.stopPropagation()}>
        <div className="top-header">
          <span className="top-title">PING {host.current}</span>
          <button className="top-close" onClick={onExit}>{'\u2715'}</button>
        </div>
        <div className="ping-body">
          {lines.map((l, i) => (
            <div key={i} className="ping-line">{l}</div>
          ))}
          {!active && (
            <>
              <div className="ping-line" style={{ marginTop: 8 }}>{`  --- ${host.current} ping statistics ---`}</div>
              <div className="ping-line">{`  ${sent} packets transmitted, ${rcvd} received, ${loss}% packet loss`}</div>
              <div className="ping-line">{`  rtt min/avg/max = ${min}/${avg}/${max} ms`}</div>
              {times.length > 0 && (
                <div className="ping-spark">
                  <span className="ping-label">RTT: </span>
                  <span className="ping-chart">{sparkline(times, SPARK_W)}</span>
                </div>
              )}
            </>
          )}
          {active && (
            <div className="ping-line">
              <span className="ping-dot">{'\u25CF'}</span>
              <span className="ping-pulse"> Pinging {host.current}...</span>
            </div>
          )}
        </div>
        <div className="snake-hint">Esc/q to exit</div>
      </div>
    </div>
  );
}
