import { useEffect, useRef, useState } from "react";

/**
 * A deliberately unhelpful cursor: it lags behind the real pointer, occasionally
 * drifts, and reports its own inadequacy.
 */
export function LagCursor({ severity = 1 }: { severity?: number }) {
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const drift = useRef({ x: 0, y: 0 });
  const [, force] = useState(0);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", move);
    let raf = 0;
    let t = 0;
    const loop = () => {
      t += 1;
      if (t % 90 === 0) {
        drift.current = {
          x: (Math.random() - 0.5) * 40 * severity,
          y: (Math.random() - 0.5) * 40 * severity,
        };
      }
      const ease = Math.max(0.045, 0.18 - severity * 0.035);
      pos.current.x += (target.current.x + drift.current.x - pos.current.x) * ease;
      pos.current.y += (target.current.y + drift.current.y - pos.current.y) * ease;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      if (ghostRef.current) {
        ghostRef.current.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    force(1);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [severity]);

  return (
    <>
      <div
        ref={ghostRef}
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-px -mt-px h-1 w-1 rounded-full bg-phosphor/30"
        aria-hidden
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[70] -ml-3 -mt-3"
        aria-hidden
      >
        <svg width="26" height="26" viewBox="0 0 26 26" className="drop-shadow-[0_0_6px_currentColor] text-phosphor">
          <path d="M3 2 L3 20 L8 15.5 L11 22 L14 20.5 L11 14.5 L18 14 Z" fill="currentColor" />
        </svg>
        <span className="ml-4 block whitespace-nowrap text-[10px] tracking-widest text-phosphor/60">
          LATENCY {(severity * 84).toFixed(0)}ms
        </span>
      </div>
    </>
  );
}
