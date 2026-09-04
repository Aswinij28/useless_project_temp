import { useEffect } from "react";
import { Cctv, Loader2, TriangleAlert } from "lucide-react";
import { useMotionTask, type MotionKind } from "@/lib/hes/useMotionTask";
import { loop, stop, sting, haptic, type TrackKey } from "@/lib/hes/audio";

export function PenaltyOverlay({
  kind,
  track,
  timeoutMs,
  title,
  instruction,
  requirements,
  onResolved,
}: {
  kind: MotionKind;
  track: TrackKey;
  timeoutMs: number;
  title: string;
  instruction: string;
  requirements: string[];
  onResolved: (outcome: "passed" | "failed-through" | "denied") => void;
}) {
  const { videoRef, status } = useMotionTask({ kind, active: true, timeoutMs, onResolved });

  useEffect(() => {
    // The soundtrack only exists because the penalty exists.
    loop(track, 0.55);
    haptic([40, 60, 40]);
    sting("error");
    return () => stop(track);
  }, [track]);

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-background/95 p-4">
      <div className="hes-panel w-full max-w-4xl">
        <div className="flex items-center justify-between border-b border-border/60 bg-alarm/15 px-3 py-2">
          <span className="flex items-center gap-2 text-sm tracking-[0.3em] text-alarm">
            <TriangleAlert className="h-4 w-4" /> PENALTY PROTOCOL ENGAGED
          </span>
          <span className="text-xs tracking-widest text-muted-foreground">
            FAIL-THROUGH IN {status.secondsLeft}s
          </span>
        </div>

        <div className="grid gap-4 p-4 md:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="text-xl tracking-[0.2em] text-phosphor">{title}</h2>
            <p className="mt-2 text-sm text-foreground/85">{instruction}</p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {requirements.map((r) => (
                <li key={r}>› {r}</li>
              ))}
            </ul>

            <div className="mt-4 border border-border/60">
              <div
                className="h-2 bg-phosphor-green transition-[width] duration-100"
                style={{ width: `${Math.round(status.progress * 100)}%` }}
              />
            </div>
            <p
              className={`mt-2 flex items-center gap-2 text-sm ${
                status.phase === "denied" || status.phase === "failed-through"
                  ? "text-alarm"
                  : "text-phosphor"
              }`}
            >
              {(status.phase === "requesting" || status.phase === "loading") && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {status.detail}
            </p>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] tracking-widest">
              {Object.entries(status.telemetry).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/30">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-phosphor-green">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden border border-border/60 bg-black">
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-full w-full -scale-x-100 object-cover opacity-80 contrast-125 saturate-0"
            />
            <div className="hes-scanlines pointer-events-none absolute inset-0 opacity-50" />
            <span className="absolute left-2 top-2 flex items-center gap-1.5 text-[11px] tracking-widest text-alarm">
              <Cctv className="h-3.5 w-3.5" /> <span className="hes-blink">REC</span> LOCAL-ONLY
            </span>
            <span className="absolute bottom-2 right-2 text-[10px] tracking-widest text-muted-foreground">
              FRAMES PROCESSED IN-BROWSER · NOTHING UPLOADED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
