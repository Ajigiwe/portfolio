import { useState, useEffect, useRef } from "react";

const LINES = [
  "root@matrix:~# ssh -p 443 root@192.168.1.105",
  "root@192.168.1.105's password: ********",
  "Last login: Thu Jan 13 13:37:00 2026 from 10.0.0.1",
  "root@target:~# nmap -sV -p- 10.0.0.0/24",
  "Starting Nmap 7.94 ( https://nmap.org )",
  "Nmap scan report for 10.0.0.1",
  "PORT     STATE  SERVICE    VERSION",
  "22/tcp   open   ssh        OpenSSH 8.9p1",
  "443/tcp  open   https      nginx 1.24.0",
  "8080/tcp open   http-proxy Squid 6.1",
  "root@target:~# curl -X POST https://api.example.com/v2/exploit",
  '{ "status": "ok", "session": "eyJhbGciOiJIUzI1NiJ9" }',
  "root@target:~# sqlmap -u 'https://api.example.com/v2/login' --dbs",
  "[14:37:01] [INFO] testing connection to the target URL",
  "[14:37:02] [INFO] checking if the target is protected by WAF",
  "[14:37:03] [PARAM] 'username' seems vulnerable to SQL injection",
  "root@target:~# hydra -l admin -P rockyou.txt ssh://10.0.0.1",
  "[22][ssh] host: 10.0.0.1   login: admin   password: P@ssw0rd!",
  "root@target:~# nc -lvnp 4444",
  "listening on [any] 4444 ...",
  "Connection from 10.0.0.105:54321 received!",
  "Microsoft Windows [Version 10.0.19045.3803]",
  "C:\\Users\\Administrator> whoami",
  "nt authority\\system",
  "C:\\Users\\Administrator> type C:\\Users\\Administrator\\Desktop\\flag.txt",
  "flag{7357f1b4-9c3f-4d2e-8a1b-6e9c2d3f4a5b}",
  "root@target:~# clear && exit",
];

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

function randStr(len) {
  let s = "";
  for (let i = 0; i < len; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return s;
}

export default function HackerTyper({ onExit }) {
  const [buf, setBuf] = useState([]);
  const idxRef = useRef(0);
  const bufRef = useRef([]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" || e.key === "q") { onExit(); return; }
      if (e.key.length === 1) {
        const next = idxRef.current < LINES.length
          ? LINES[idxRef.current++]
          : `  ${randStr(Math.floor(Math.random() * 40 + 10))}`;
        bufRef.current = [...bufRef.current, next];
        if (bufRef.current.length > 100) bufRef.current = bufRef.current.slice(-100);
        setBuf([...bufRef.current]);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onExit]);

  return (
    <div className="ht-overlay" onClick={onExit}>
      <div className="ht-window" onClick={(e) => e.stopPropagation()}>
        <div className="ht-header">
          <span className="ht-title">root@matrix:~ — HACKER TYPER</span>
          <button className="top-close" onClick={onExit}>{'\u2715'}</button>
        </div>
        <div className="ht-body">
          {buf.map((l, i) => (
            <div key={i} className="ht-line">{l}</div>
          ))}
          <div className="ht-line ht-cursor">{'\u2588'}</div>
        </div>
        <div className="ht-hint">Type any key to generate code · Esc/q to exit</div>
      </div>
    </div>
  );
}
