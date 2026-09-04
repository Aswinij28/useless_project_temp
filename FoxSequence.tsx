import { useEffect, useRef, useState } from "react";
import { playOnce } from "@/lib/hes/audio";

/**
 * Crazy Frog sting must FINISH before the fox clip is allowed to run, and the
 * fox clip runs exactly three times. Nothing may be skipped.
 */
export function FoxSequence({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [plays, setPlays] = useState(0);
  const [stage, setStage] = useState<"frog" | "fox">("frog");
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void playOnce("frog", 0.9).then(() => {
      if (cancelled) return;
      setStage("fox");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (stage !== "fox") return;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => undefined);
  }, [stage, plays]);

  const handleEnded = () => {
    const next = plays + 1;
    if (next >= 3) {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete();
      return;
    }
    setPlays(next);
  };

  return (
    <div className="fixed inset-0 z-[66] flex flex-col items-center justify-center gap-3 bg-background/97 p-4">
      <p className="text-xs tracking-[0.35em] text-muted-foreground">
        MANDATORY MORALE INJECTION · SKIPPING DISABLED
      </p>
      <div className="hes-panel relative w-full max-w-3xl overflow-hidden">
        {stage === "frog" ? (
          <div className="flex h-64 items-center justify-center">
            <p className="hes-blink text-center text-xl tracking-[0.3em] text-phosphor">
              BUFFERING CULTURAL ASSET…
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src="/bgmusic/fox.mp4"
            playsInline
            autoPlay
            onEnded={handleEnded}
            className="h-auto w-full"
          />
        )}
        <div className="hes-scanlines pointer-events-none absolute inset-0 opacity-40" />
      </div>
      <p className="text-sm tracking-[0.25em] text-phosphor-green">
        {stage === "frog" ? "STING 1/1" : `PLAYBACK ${Math.min(plays + 1, 3)} OF 3`}
      </p>
    </div>
  );
}
