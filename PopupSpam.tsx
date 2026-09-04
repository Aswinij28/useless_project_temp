import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { POPUP_BODIES, POPUP_TITLES, randomOf } from "@/lib/hes/copy";
import { haptic, sting } from "@/lib/hes/audio";

type Popup = { id: number; title: string; body: string; x: number; y: number; escapes: number };

let seq = 0;

export function PopupSpam({
  active,
  intensity = 1,
  max = 6,
  onDismiss,
}: {
  active: boolean;
  intensity?: number;
  max?: number;
  onDismiss?: () => void;
}) {
  const [popups, setPopups] = useState<Popup[]>([]);

  useEffect(() => {
    if (!active) {
      setPopups([]);
      return;
    }
    const spawn = () => {
      setPopups((p) => {
        if (p.length >= max) return p;
        sting("beep");
        return [
          ...p,
          {
            id: ++seq,
            title: randomOf(POPUP_TITLES),
            body: randomOf(POPUP_BODIES),
            x: 8 + Math.random() * 62,
            y: 14 + Math.random() * 58,
            escapes: 0,
          },
        ];
      });
    };
    spawn();
    const id = window.setInterval(spawn, Math.max(900, 3200 / intensity));
    return () => window.clearInterval(id);
  }, [active, intensity, max]);

  const close = (id: number) => {
    setPopups((p) => {
      const target = p.find((x) => x.id === id);
      if (target && target.escapes < 1) {
        // First close attempt: the dialog relocates instead of closing.
        haptic(30);
        sting("deny");
        return p.map((x) =>
          x.id === id
            ? { ...x, escapes: x.escapes + 1, x: 6 + Math.random() * 66, y: 12 + Math.random() * 60 }
            : x,
        );
      }
      haptic(15);
      onDismiss?.();
      return p.filter((x) => x.id !== id);
    });
  };

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {popups.map((p) => (
        <div
          key={p.id}
          className="hes-panel pointer-events-auto absolute w-[19rem] max-w-[80vw] transition-all duration-150"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <div className="flex items-center justify-between border-b border-border/60 bg-secondary/70 px-2 py-1">
            <span className="flex items-center gap-1.5 text-[11px] tracking-[0.2em] text-phosphor">
              <AlertTriangle className="h-3 w-3 text-alarm" />
              {p.title}
            </span>
            <button
              onClick={() => close(p.id)}
              className="hes-no-cursor text-muted-foreground hover:text-alarm"
              aria-label="Dismiss notice"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="px-3 py-2 text-sm leading-snug text-foreground/90">{p.body}</p>
          <div className="flex justify-end gap-2 border-t border-border/40 px-2 py-1.5">
            <button
              onClick={() => close(p.id)}
              className="hes-no-cursor border border-border px-2 py-0.5 text-[11px] tracking-widest hover:bg-secondary"
            >
              {p.escapes ? "FINE" : "OK"}
            </button>
            <button
              onClick={() => close(p.id)}
              className="hes-no-cursor border border-border px-2 py-0.5 text-[11px] tracking-widest text-muted-foreground hover:bg-secondary"
            >
              ALSO OK
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
