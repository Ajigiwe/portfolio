import { useState, useEffect, useCallback } from "react";

export default function useTypewriter(texts, { speed = 30, delay = 500 } = {}) {
  const [displayed, setDisplayed] = useState([]);
  const [idx, setIdx] = useState(0);
  const [charPos, setCharPos] = useState(0);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setDisplayed([]);
    setIdx(0);
    setCharPos(0);
    setDone(false);
  }, []);

  useEffect(() => {
    if (idx >= texts.length) {
      setDone(true);
      return;
    }

    const current = texts[idx];
    if (charPos < current.length) {
      const timer = setTimeout(() => {
        setDisplayed((prev) => {
          const next = [...prev];
          if (!next[idx]) next[idx] = "";
          next[idx] = current.slice(0, charPos + 1);
          return next;
        });
        setCharPos((p) => p + 1);
      }, speed);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setIdx((i) => i + 1);
      setCharPos(0);
    }, delay);
    return () => clearTimeout(timer);
  }, [idx, charPos, texts, speed, delay]);

  return { lines: displayed, done, reset };
}
