import { useState, useEffect, useCallback, useRef } from "react";

const SIZE = 4;
const WIN_VAL = 2048;

function blankGrid() {
  const g = [];
  for (let y = 0; y < SIZE; y++) {
    g[y] = [];
    for (let x = 0; x < SIZE; x++) g[y][x] = 0;
  }
  return g;
}

function cloneGrid(g) {
  return g.map((r) => [...r]);
}

function addTile(g) {
  const empty = [];
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (g[y][x] === 0) empty.push([x, y]);
  if (empty.length === 0) return false;
  const [x, y] = empty[Math.floor(Math.random() * empty.length)];
  g[y][x] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function slideRow(row) {
  let arr = row.filter((v) => v !== 0);
  let score = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < SIZE) arr.push(0);
  return { row: arr, score };
}

function move(g, dir) {
  const grid = cloneGrid(g);
  let totalScore = 0;
  const rot = (m) => m[0].map((_, i) => m.map((r) => r[i]));

  if (dir === "up" || dir === "down") {
    const cols = rot(grid);
    for (let i = 0; i < SIZE; i++) {
      const c = dir === "up" ? cols[i] : [...cols[i]].reverse();
      const { row, score } = slideRow(c);
      totalScore += score;
      cols[i] = dir === "up" ? row : row.reverse();
    }
    const r2 = rot(cols);
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++)
        grid[y][x] = r2[y][x];
  } else {
    for (let i = 0; i < SIZE; i++) {
      const r = dir === "left" ? grid[i] : [...grid[i]].reverse();
      const { row, score } = slideRow(r);
      totalScore += score;
      grid[i] = dir === "left" ? row : row.reverse();
    }
  }

  return { grid, score: totalScore };
}

function hasMoves(g) {
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      if (g[y][x] === 0) return true;
      if (x < SIZE - 1 && g[y][x] === g[y][x + 1]) return true;
      if (y < SIZE - 1 && g[y][x] === g[y + 1][x]) return true;
    }
  return false;
}

function initGame() {
  const g = blankGrid();
  addTile(g);
  addTile(g);
  return g;
}

const TILE_COLORS = {
  2: { fg: "#776e65", bg: "#eee4da" },
  4: { fg: "#776e65", bg: "#ede0c8" },
  8: { fg: "#f9f6f2", bg: "#f2b179" },
  16: { fg: "#f9f6f2", bg: "#f59563" },
  32: { fg: "#f9f6f2", bg: "#f67c5f" },
  64: { fg: "#f9f6f2", bg: "#f65e3b" },
  128: { fg: "#f9f6f2", bg: "#edcf72" },
  256: { fg: "#f9f6f2", bg: "#edcc61" },
  512: { fg: "#f9f6f2", bg: "#edc850" },
  1024: { fg: "#f9f6f2", bg: "#edc53f" },
  2048: { fg: "#f9f6f2", bg: "#edc22e" },
};

export default function Game2048({ onExit }) {
  const [grid, setGrid] = useState(initGame);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);
  const wonRef = useRef(false);

  const reset = () => {
    setGrid(initGame());
    setScore(0);
    setWon(false);
    setOver(false);
    wonRef.current = false;
  };

  const handleKey = useCallback((e) => {
    if (e.key === "Escape" || e.key === "q") { onExit(); return; }
    if (e.key === "r") { reset(); return; }
    const dir = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" }[e.key];
    if (!dir) return;
    e.preventDefault();
    setGrid((prev) => {
      const { grid: ng, score: gained } = move(prev, dir);
      if (JSON.stringify(ng) === JSON.stringify(prev)) return prev;
      addTile(ng);
      setScore((s) => s + gained);
      if (!wonRef.current) {
        const maxVal = Math.max(...ng.flat());
        if (maxVal >= WIN_VAL) { setWon(true); wonRef.current = true; }
      }
      if (!hasMoves(ng)) setOver(true);
      return ng;
    });
  }, [onExit]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div className="top-overlay" onClick={onExit}>
      <div className="g2048-window" onClick={(e) => e.stopPropagation()}>
        <div className="top-header">
          <span className="top-title">2048  |  Score: {score}</span>
          <button className="top-close" onClick={onExit}>{'\u2715'}</button>
        </div>
        <div className="g2048-body">
          <div className="g2048-grid">
            {grid.map((row, y) =>
              row.map((val, x) => {
                const c = TILE_COLORS[val] || { fg: "#00ff6a", bg: "transparent" };
                return (
                  <div
                    key={`${x}-${y}`}
                    className="g2048-cell"
                    style={{
                      color: c.fg,
                      background: val ? c.bg : "rgba(255,255,255,0.05)",
                      fontSize: val >= 1000 ? "1rem" : val >= 100 ? "1.2rem" : "1.4rem",
                    }}
                  >
                    {val || ""}
                  </div>
                );
              })
            )}
          </div>
          {won && <div className="g2048-msg">You Win! Keep playing or press R to restart</div>}
          {over && <div className="g2048-msg g2048-over">Game Over! Press R to restart</div>}
        </div>
        <div className="snake-hint">Arrow/WASD to move · R to restart · Esc/q to exit</div>
      </div>
    </div>
  );
}
