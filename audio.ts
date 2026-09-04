// Audio bus for The Human Error Simulator.
// All clips live in /public/bgmusic and are addressed by key.

export type TrackKey = "ruby" | "sixtyseven" | "frog";

const SOURCES: Record<TrackKey, string> = {
  ruby: "/bgmusic/ruby_chan.mp3",
  sixtyseven: "/bgmusic/67.mp3",
  frog: "/bgmusic/crazy_frog.mp3",
};

const elements = new Map<TrackKey, HTMLAudioElement>();

function el(key: TrackKey): HTMLAudioElement {
  let node = elements.get(key);
  if (!node) {
    node = new Audio(SOURCES[key]);
    node.preload = "auto";
    elements.set(key, node);
  }
  return node;
}

export function preloadAudio() {
  if (typeof window === "undefined") return;
  try {
    (Object.keys(SOURCES) as TrackKey[]).forEach((k) => el(k).load());
  } catch {
    /* ignore */
  }
}

export function loop(key: TrackKey, volume = 0.6) {
  if (typeof window === "undefined") return;
  const node = el(key);
  node.loop = true;
  node.volume = volume;
  node.currentTime = 0;
  void node.play().catch(() => undefined);
}

export function stop(key: TrackKey) {
  const node = elements.get(key);
  if (!node) return;
  node.pause();
  node.currentTime = 0;
}

export function stopAll() {
  elements.forEach((node) => {
    node.pause();
    node.currentTime = 0;
  });
}

/** Plays a clip exactly once and resolves only after it has finished. */
export function playOnce(key: TrackKey, volume = 0.8): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const node = el(key);
  node.loop = false;
  node.volume = volume;
  node.currentTime = 0;
  return new Promise<void>((resolve) => {
    const done = () => {
      node.removeEventListener("ended", done);
      node.removeEventListener("error", done);
      resolve();
    };
    node.addEventListener("ended", done);
    node.addEventListener("error", done);
    void node.play().catch(done);
  });
}

/** Short synthesized UI stings so the terminal always has a voice. */
let ctx: AudioContext | null = null;
function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    void ctx.resume().catch(() => undefined);
    return ctx;
  } catch {
    return null;
  }
}

export function sting(kind: "error" | "beep" | "deny" | "glitch" = "beep") {
  try {
    stingUnsafe(kind);
  } catch {
    /* audio hardware is also disappointed in you */
  }
}

function stingUnsafe(kind: "error" | "beep" | "deny" | "glitch") {
  const c = audioCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain).connect(c.destination);
  const t = c.currentTime;
  const table: Record<string, [OscillatorType, number, number, number]> = {
    beep: ["square", 880, 660, 0.08],
    error: ["sawtooth", 220, 90, 0.35],
    deny: ["square", 160, 110, 0.22],
    glitch: ["triangle", 1400, 120, 0.18],
  };
  const [type, from, to, dur] = table[kind]!;
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.14, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function haptic(pattern: number | number[] = 40) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}
