import { useCallback, useEffect, useRef, useState } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";

export type MotionKind = "tilt-touch" | "dual-wave";

export type MotionStatus = {
  phase: "idle" | "requesting" | "denied" | "loading" | "tracking" | "passed" | "failed-through";
  detail: string;
  /** 0..1 progress toward compliance */
  progress: number;
  /** seconds left before the terminal gives up on you */
  secondsLeft: number;
  /** live readouts for the HUD */
  telemetry: Record<string, string>;
};

type Options = {
  kind: MotionKind;
  active: boolean;
  timeoutMs: number;
  onResolved: (outcome: "passed" | "failed-through" | "denied") => void;
};

const MODEL_URL = "/models/pose_landmarker_lite.task";
const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";

// BlazePose landmark indices
const NOSE = 0;
const L_EAR = 7;
const R_EAR = 8;
const L_MOUTH = 9;
const R_MOUTH = 10;
const L_WRIST = 15;
const R_WRIST = 16;
const L_INDEX = 19;
const R_INDEX = 20;

type Pt = { x: number; y: number; visibility?: number };

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function useMotionTask({ kind, active, timeoutMs, onResolved }: Options) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const resolvedRef = useRef(false);
  const onResolvedRef = useRef(onResolved);
  onResolvedRef.current = onResolved;

  const [status, setStatus] = useState<MotionStatus>({
    phase: "idle",
    detail: "AWAITING BIOMETRIC CONSENT",
    progress: 0,
    secondsLeft: Math.round(timeoutMs / 1000),
    telemetry: {},
  });

  const finish = useCallback((outcome: "passed" | "failed-through" | "denied") => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    onResolvedRef.current(outcome);
  }, []);

  useEffect(() => {
    if (!active) return;
    resolvedRef.current = false;
    let cancelled = false;
    const startedAt = performance.now();

    // ---- compliance state ----
    let holdStart: number | null = null; // module 1
    type HandState = {
      lastY: number | null;
      dir: 0 | 1 | -1;
      extreme: number;
      lastMoveAt: number;
      reversals: number[];
    };
    const hands: Record<"L" | "R", HandState> = {
      L: { lastY: null, dir: 0, extreme: 0, lastMoveAt: startedAt, reversals: [] },
      R: { lastY: null, dir: 0, extreme: 0, lastMoveAt: startedAt, reversals: [] },
    };
    let syncedCycleHalves = 0;

    const resetWave = (now: number) => {
      (["L", "R"] as const).forEach((k) => {
        hands[k].dir = 0;
        hands[k].extreme = hands[k].lastY ?? 0;
        hands[k].reversals = [];
        hands[k].lastMoveAt = now;
      });
      syncedCycleHalves = 0;
    };

    const run = async () => {
      setStatus((s) => ({ ...s, phase: "requesting", detail: "REQUESTING OPTICAL SENSOR ACCESS" }));
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
      } catch {
        if (cancelled) return;
        setStatus((s) => ({
          ...s,
          phase: "denied",
          detail: "SENSOR REFUSED. NON-COMPLIANCE LOGGED.",
        }));
        finish("denied");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }

      setStatus((s) => ({ ...s, phase: "loading", detail: "LOADING POSTURE INFERENCE KERNEL" }));
      const vision = await import("@mediapipe/tasks-vision");
      const fileset = await vision.FilesetResolver.forVisionTasks(WASM_PATH);
      if (cancelled) return;
      const landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1,
      });
      if (cancelled) {
        landmarker.close();
        return;
      }
      landmarkerRef.current = landmarker;
      setStatus((s) => ({ ...s, phase: "tracking", detail: "TRACKING SUBJECT" }));

      const tick = () => {
        if (cancelled) return;
        const now = performance.now();
        const elapsed = now - startedAt;
        const secondsLeft = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));

        const v = videoRef.current;
        if (v && v.readyState >= 2 && landmarkerRef.current) {
          const result = landmarkerRef.current.detectForVideo(v, now);
          const lm = result.landmarks?.[0] as Pt[] | undefined;

          if (!lm) {
            if (kind === "tilt-touch") holdStart = null;
            setStatus((s) => ({
              ...s,
              secondsLeft,
              detail: "SUBJECT NOT DETECTED IN FRAME",
              progress: 0,
              telemetry: { SUBJECT: "LOST" },
            }));
          } else if (kind === "tilt-touch") {
            const le = lm[L_EAR]!;
            const re = lm[R_EAR]!;
            const nose = lm[NOSE]!;
            const mouth = { x: (lm[L_MOUTH]!.x + lm[R_MOUTH]!.x) / 2, y: (lm[L_MOUTH]!.y + lm[R_MOUTH]!.y) / 2 };
            const tilt = Math.abs((Math.atan2(re.y - le.y, re.x - le.x) * 180) / Math.PI);
            const tiltDeg = tilt > 90 ? 180 - tilt : tilt;
            const headScale = Math.max(0.05, dist(le, re));
            const candidates = [lm[L_WRIST]!, lm[R_WRIST]!, lm[L_INDEX]!, lm[R_INDEX]!];
            const targets = [mouth, nose, le, re];
            let best = Infinity;
            candidates.forEach((c) => {
              if ((c.visibility ?? 1) < 0.3) return;
              targets.forEach((t) => {
                best = Math.min(best, dist(c, t) / headScale);
              });
            });
            const touching = best < 1.15;
            const ok = tiltDeg > 15 && touching;
            if (ok) {
              if (holdStart === null) holdStart = now;
            } else {
              holdStart = null;
            }
            const held = holdStart === null ? 0 : now - holdStart;
            const progress = Math.min(1, held / 2000);
            setStatus({
              phase: "tracking",
              detail: ok
                ? `POSE ACCEPTED — HOLD ${(2 - held / 1000).toFixed(1)}s`
                : tiltDeg > 15
                  ? "TILT OK — HAND NOT ON CHEEK/CHIN"
                  : "INSUFFICIENT HEAD TILT",
              progress,
              secondsLeft,
              telemetry: {
                TILT: `${tiltDeg.toFixed(1)}°`,
                "HAND→FACE": best === Infinity ? "—" : best.toFixed(2),
                HOLD: `${(held / 1000).toFixed(1)}s`,
              },
            });
            if (held >= 2000) {
              setStatus((s) => ({ ...s, phase: "passed", detail: "COMPLIANCE CONFIRMED", progress: 1 }));
              finish("passed");
              return;
            }
          } else {
            // dual-wave
            const wr: Record<"L" | "R", Pt> = { L: lm[L_WRIST]!, R: lm[R_WRIST]! };
            let movingBoth = true;
            (["L", "R"] as const).forEach((k) => {
              const h = hands[k];
              const y = wr[k]!.y;
              if (h.lastY === null) {
                h.lastY = y;
                h.extreme = y;
                return;
              }
              const dy = y - h.lastY;
              if (Math.abs(dy) > 0.004) h.lastMoveAt = now;
              const dir: 0 | 1 | -1 = dy > 0.004 ? 1 : dy < -0.004 ? -1 : h.dir;
              if (dir !== 0 && h.dir !== 0 && dir !== h.dir) {
                const amplitude = Math.abs(y - h.extreme);
                if (amplitude >= 0.3) {
                  h.reversals.push(now);
                  if (h.reversals.length > 12) h.reversals.shift();
                }
                h.extreme = y;
              }
              if (dir !== 0 && (h.dir === 0 || dir === h.dir)) {
                h.extreme = dir === 1 ? Math.min(h.extreme, y) : Math.max(h.extreme, y);
              }
              if (dir !== 0) h.dir = dir;
              h.lastY = y;
              if (now - h.lastMoveAt > 500) movingBoth = false;
            });

            if (!movingBoth) resetWave(now);

            // pair reversals across hands within 200ms
            const L = hands.L.reversals;
            const R = hands.R.reversals;
            let halves = 0;
            const usedR = new Set<number>();
            L.forEach((lt) => {
              const idx = R.findIndex((rt, i) => !usedR.has(i) && Math.abs(rt - lt) <= 200);
              if (idx >= 0) {
                usedR.add(idx);
                halves += 1;
              }
            });
            syncedCycleHalves = halves;
            const cycles = Math.floor(syncedCycleHalves / 2);
            const progress = Math.min(1, cycles / 5);
            setStatus({
              phase: "tracking",
              detail: movingBoth
                ? `SYNCHRONISED CYCLES ${cycles}/5`
                : "MOTION PAUSED — SEQUENCE RESET",
              progress,
              secondsLeft,
              telemetry: {
                "L WRIST": hands.L.lastY?.toFixed(2) ?? "—",
                "R WRIST": hands.R.lastY?.toFixed(2) ?? "—",
                SYNC: `${halves} HALF-CYCLES`,
                AMPLITUDE: "≥30% REQUIRED",
              },
            });
            if (cycles >= 5) {
              setStatus((s) => ({ ...s, phase: "passed", detail: "COMPLIANCE CONFIRMED", progress: 1 }));
              finish("passed");
              return;
            }
          }
        }

        if (elapsed >= timeoutMs) {
          setStatus((s) => ({
            ...s,
            phase: "failed-through",
            detail: "TIMEOUT. DEFECT RECORDED. PROCEEDING ANYWAY.",
            secondsLeft: 0,
          }));
          finish("failed-through");
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    void run();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [active, kind, timeoutMs, finish]);

  return { videoRef, status };
}
