import { useRef, useState } from "react";
import { Fingerprint, MousePointerClick, MoveHorizontal } from "lucide-react";
import { ERRORS, randomOf } from "@/lib/hes/copy";
import { haptic, sting } from "@/lib/hes/audio";

export function ModuleShell({
  index,
  code,
  title,
  brief,
  children,
}: {
  index: number;
  code: string;
  title: string;
  brief: string;
  children: React.ReactNode;
}) {
  return (
    <section className="hes-panel mx-auto w-full max-w-3xl p-5">
      <p className="text-[10px] tracking-[0.4em] text-muted-foreground">
        MODULE {index} OF 4 · {code}
      </p>
      <h2 className="mt-1 text-2xl tracking-[0.2em] text-phosphor">{title}</h2>
      <p className="mt-2 max-w-prose text-sm text-foreground/80">{brief}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** MODULE 1 — a button that objects to being clicked. */
export function AttentionModule({
  onError,
  onPenalty,
}: {
  onError: (msg: string) => void;
  onPenalty: () => void;
}) {
  const [attempts, setAttempts] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const attempt = () => {
    const next = attempts + 1;
    setAttempts(next);
    sting("deny");
    haptic(35);
    onError(randomOf(ERRORS));
    if (next >= 3) {
      onPenalty();
      return;
    }
    setOffset({ x: (Math.random() - 0.5) * 260, y: (Math.random() - 0.5) * 90 });
  };

  return (
    <div className="relative h-48">
      <button
        onPointerEnter={() =>
          setOffset((o) => ({ x: o.x + (Math.random() - 0.5) * 60, y: o.y + (Math.random() - 0.5) * 30 }))
        }
        onClick={attempt}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        className="hes-no-cursor absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 border border-phosphor/70 bg-secondary/60 px-6 py-3 text-sm tracking-[0.3em] text-phosphor transition-transform duration-150 hover:bg-secondary"
      >
        <MousePointerClick className="h-4 w-4" /> CONFIRM PRESENCE
      </button>
      <p className="absolute bottom-0 left-0 text-xs tracking-widest text-muted-foreground">
        FAILED CONFIRMATIONS: {attempts}/3 · ACCURACY EXPECTATION: UNREASONABLE
      </p>
    </div>
  );
}

/** MODULE 2 — a signature swipe that never quite registers. */
export function SignatureModule({
  onError,
  onPenalty,
}: {
  onError: (msg: string) => void;
  onPenalty: () => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(0);
  const [fails, setFails] = useState(0);
  const dragging = useRef(false);

  const setFromEvent = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Deliberate input lag + drift: the swipe is always slightly wrong.
    const raw = (clientX - rect.left) / rect.width;
    const skewed = Math.max(0, Math.min(1, raw * 0.88 - 0.02));
    setValue(skewed);
    if (skewed > 0.82) {
      dragging.current = false;
      setValue(0);
      const next = fails + 1;
      setFails(next);
      sting("error");
      haptic([20, 40, 20]);
      onError(randomOf(ERRORS));
      if (next >= 2) onPenalty();
    }
  };

  return (
    <div>
      <div
        ref={trackRef}
        onPointerDown={(e) => {
          dragging.current = true;
          setFromEvent(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && setFromEvent(e.clientX)}
        onPointerUp={() => {
          dragging.current = false;
          setValue(0);
        }}
        onPointerLeave={() => {
          dragging.current = false;
          setValue(0);
        }}
        className="hes-no-cursor relative h-14 w-full select-none border border-border bg-secondary/40"
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs tracking-[0.35em] text-muted-foreground">
          SWIPE RIGHT TO ATTEST THAT YOU ARE PROBABLY YOU
        </div>
        <div
          className="absolute top-1 flex h-12 w-16 items-center justify-center border border-phosphor/70 bg-background text-phosphor"
          style={{ left: `calc(${value * 100}% )`, transition: dragging.current ? "none" : "left 220ms" }}
        >
          <MoveHorizontal className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 flex items-center gap-2 text-xs tracking-widest text-muted-foreground">
        <Fingerprint className="h-3.5 w-3.5" /> REJECTED ATTESTATIONS: {fails}/2 · SIGNATURE CONFIDENCE{" "}
        {(value * 61).toFixed(0)}%
      </p>
    </div>
  );
}
