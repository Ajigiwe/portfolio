import { useCallback, useRef } from "react";

export default function useSound() {
  const ctxRef = useRef(null);

  const ctx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  };

  const beep = useCallback((freq, duration, type = "sine", vol = 0.03) => {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + duration);
  }, []);

  const click = useCallback(() => beep(800, 0.03, "square", 0.015), [beep]);
  const boot = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.12, "sine", 0.04), i * 100));
  }, [beep]);
  const error = useCallback(() => beep(200, 0.3, "sawtooth", 0.04), [beep]);
  const success = useCallback(() => {
    [523, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.1, "sine", 0.03), i * 80));
  }, [beep]);

  return { click, boot, error, success, ctx };
}
