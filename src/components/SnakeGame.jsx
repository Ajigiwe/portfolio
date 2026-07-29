import { useState, useEffect, useCallback, useRef } from "react";

const W = 20;
const H = 15;
const TICK = 180;

function initSnake() {
  const x = Math.floor(W / 2);
  const y = Math.floor(H / 2);
  return [
    [x, y], [x - 1, y], [x - 2, y],
  ];
}

function randPos(snake) {
  let p;
  do {
    p = [Math.floor(Math.random() * W), Math.floor(Math.random() * H)];
  } while (snake.some((s) => s[0] === p[0] && s[1] === p[1]));
  return p;
}

export default function SnakeGame({ onExit }) {
  const [snake, setSnake] = useState(initSnake);
  const [food, setFood] = useState(() => randPos(initSnake()));
  const [dir, setDir] = useState([1, 0]);
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const dirRef = useRef(dir);
  const deadRef = useRef(dead);

  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => { deadRef.current = dead; }, [dead]);

  const reset = () => {
    const s = initSnake();
    setSnake(s);
    setFood(randPos(s));
    setDir([1, 0]);
    setScore(0);
    setDead(false);
  };

  const handleKey = useCallback((e) => {
    if (e.key === "Escape" || e.key === "q") { onExit(); return; }
    if (e.key === "r" && deadRef.current) { reset(); return; }
    const k = e.key;
    const nd = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[k];
    if (!nd) return;
    e.preventDefault();
    const cur = dirRef.current;
    if (nd[0] === -cur[0] && nd[1] === -cur[1]) return;
    setDir(nd);
  }, [onExit]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (dead) return;
    const iv = setInterval(() => {
      setSnake((prev) => {
        const h = prev[0];
        const d = dirRef.current;
        const nh = [h[0] + d[0], h[1] + d[1]];
        if (nh[0] < 0 || nh[0] >= W || nh[1] < 0 || nh[1] >= H) { setDead(true); return prev; }
        if (prev.some((s) => s[0] === nh[0] && s[1] === nh[1])) { setDead(true); return prev; }
        const ate = nh[0] === food[0] && nh[1] === food[1];
        const next = [nh, ...prev];
        if (ate) {
          setScore((s) => s + 1);
          setFood(randPos(next));
        } else {
          next.pop();
        }
        return next;
      });
    }, TICK);
    return () => clearInterval(iv);
  }, [dead, food]);

  const grid = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const isSnake = snake.some((s) => s[0] === x && s[1] === y);
      const isHead = !dead && snake[0][0] === x && snake[0][1] === y;
      const isFood = !dead && food[0] === x && food[1] === y;
      let ch = ".";
      let cls = "snake-cell";
      if (isFood) { ch = "@"; cls += " snake-food"; }
      if (isHead) { ch = "O"; cls += " snake-head"; }
      else if (isSnake) { ch = "#"; cls += " snake-body"; }
      grid.push(<span key={`${x}-${y}`} className={cls}>{ch}</span>);
    }
    grid.push(<br key={`br-${y}`} />);
  }

  return (
    <div className="top-overlay" onClick={onExit}>
      <div className="snake-window" onClick={(e) => e.stopPropagation()}>
        <div className="top-header">
          <span className="top-title">SNAKE  |  Score: {score}</span>
          <button className="top-close" onClick={onExit}>{'\u2715'}</button>
        </div>
        <div className="snake-board">
          {grid}
        </div>
        {dead && (
          <div className="snake-over">
            <div>GAME OVER</div>
            <div className="snake-restart">Press R to restart or Esc/q to exit</div>
          </div>
        )}
        <div className="snake-hint">Arrow keys/WASD to move · Esc/q to exit</div>
      </div>
    </div>
  );
}
