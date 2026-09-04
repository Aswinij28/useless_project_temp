import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Power, Terminal } from "lucide-react";
import { CrtFrame } from "@/components/hes/CrtFrame";
import { LagCursor } from "@/components/hes/LagCursor";
import { Hud } from "@/components/hes/Hud";
import { PopupSpam } from "@/components/hes/PopupSpam";
import { PenaltyOverlay } from "@/components/hes/PenaltyOverlay";
import { FoxSequence } from "@/components/hes/FoxSequence";
import { GaslightBot } from "@/components/hes/GaslightBot";
import { DefectProfile, type Defect } from "@/components/hes/DefectProfile";
import { AttentionModule, ModuleShell, SignatureModule } from "@/components/hes/Modules";
import { BOOT_LINES } from "@/lib/hes/copy";
import { haptic, preloadAudio, stopAll, sting } from "@/lib/hes/audio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Human Error Simulator | HES-9 Compliance Terminal" },
      {
        name: "description",
        content:
          "A dystopian corporate CRT terminal that audits your humanity: lagging cursors, trap modules, webcam compliance penalties and a final defect profile.",
      },
      { property: "og:title", content: "The Human Error Simulator | HES-9 Compliance Terminal" },
      {
        property: "og:description",
        content:
          "Four trap modules, GaslightBot support, mandatory morale injections and a permanent record of your defects. Satirical fiction.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Simulator,
});

type Stage = "boot" | "m1" | "m2" | "m3" | "m4" | "profile";
type Penalty = null | "tilt-touch" | "dual-wave";

const MODULE_NAMES: Record<Stage, string> = {
  boot: "BOOT",
  m1: "ATTENTION",
  m2: "SIGNATURE",
  m3: "MORALE",
  m4: "EXIT",
  profile: "REPORT",
};

function Simulator() {
  const [stage, setStage] = useState<Stage>("boot");
  const [bootLine, setBootLine] = useState(0);
  const [penalty, setPenalty] = useState<Penalty>(null);
  const [log, setLog] = useState<string[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [errors, setErrors] = useState(0);
  const [compliance, setCompliance] = useState(100);
  const [hesitationMs, setHesitationMs] = useState(0);
  const [uptimeMs, setUptimeMs] = useState(0);
  const [glitching, setGlitching] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [popups, setPopups] = useState(false);
  const [foxRunning, setFoxRunning] = useState(false);
  const [m3Ack, setM3Ack] = useState(false);
  const [passed, setPassed] = useState(0);
  const [timedOut, setTimedOut] = useState(0);
  const startedAt = useRef(Date.now());
  const lastInput = useRef(Date.now());

  const pushLog = useCallback((line: string) => {
    setLog((l) => [...l.slice(-7), line]);
  }, []);

  const addDefect = useCallback((code: string, label: string) => {
    setDefects((d) => (d.some((x) => x.code === code) ? d : [...d, { code, label }]));
  }, []);

  // uptime + hesitation telemetry
  useEffect(() => {
    const id = window.setInterval(() => {
      setUptimeMs(Date.now() - startedAt.current);
      const idle = Date.now() - lastInput.current;
      if (idle > 1200) setHesitationMs((h) => h + 250);
    }, 250);
    const mark = () => {
      lastInput.current = Date.now();
    };
    window.addEventListener("pointermove", mark);
    window.addEventListener("keydown", mark);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("pointermove", mark);
      window.removeEventListener("keydown", mark);
    };
  }, []);

  // random interface hostility
  useEffect(() => {
    if (stage === "boot" || stage === "profile") return;
    const id = window.setInterval(() => {
      const roll = Math.random();
      if (roll < 0.35) {
        setGlitching(true);
        sting("glitch");
        window.setTimeout(() => setGlitching(false), 320);
      } else if (roll < 0.5) {
        setInverted(true);
        window.setTimeout(() => setInverted(false), 140);
      } else if (roll < 0.6) {
        setFrozen(true);
        haptic([60, 40, 60]);
        window.setTimeout(() => setFrozen(false), 1400);
      }
    }, 9000);
    return () => window.clearInterval(id);
  }, [stage]);

  useEffect(() => () => stopAll(), []);

  const registerError = useCallback(
    (msg: string) => {
      setErrors((e) => e + 1);
      setCompliance((c) => Math.max(3, c - 7));
      pushLog(msg);
    },
    [pushLog],
  );

  const beginBoot = () => {
    preloadAudio();
    sting("beep");
    setStage("boot");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setBootLine(i);
      sting("beep");
      if (i >= BOOT_LINES.length) {
        window.clearInterval(id);
        window.setTimeout(() => setStage("m1"), 700);
      }
    }, 420);
  };

  const resolvePenalty = (outcome: "passed" | "failed-through" | "denied") => {
    const wasModule1 = penalty === "tilt-touch";
    setPenalty(null);
    if (outcome === "passed") {
      setPassed((p) => p + 1);
      setCompliance((c) => Math.min(100, c + 9));
      pushLog("PENALTY SATISFIED. SUSPICION RETAINED.");
      addDefect(wasModule1 ? "HD-15" : "WV-05", wasModule1
        ? "Complied with an absurd posture demand without asking why"
        : "Waved both hands at a computer in perfect synchronisation");
    } else if (outcome === "denied") {
      setTimedOut((t) => t + 1);
      setCompliance((c) => Math.max(3, c - 18));
      pushLog("SENSOR CONSENT WITHHELD. FILED UNDER 'BOUNDARIES'.");
      addDefect("PRV-01", "Declined optical surveillance (rare, encouraging)");
    } else {
      setTimedOut((t) => t + 1);
      setCompliance((c) => Math.max(3, c - 12));
      pushLog("FAIL-THROUGH. THE SYSTEM MOVES ON WITHOUT FORGIVING.");
      addDefect(wasModule1 ? "TO-15" : "TO-12", "Allowed a countdown to expire while thinking");
    }
    setStage((s) => (s === "m1" ? "m2" : s === "m2" ? "m3" : s));
  };

  const restart = () => {
    stopAll();
    startedAt.current = Date.now();
    setStage("boot");
    setBootLine(0);
    setDefects([]);
    setErrors(0);
    setCompliance(100);
    setHesitationMs(0);
    setLog([]);
    setPassed(0);
    setTimedOut(0);
    setPopups(false);
    setFoxRunning(false);
    setM3Ack(false);
    beginBoot();
  };

  return (
    <CrtFrame glitching={glitching} frozen={frozen} inverted={inverted}>
      <LagCursor severity={stage === "boot" ? 0.6 : compliance < 50 ? 2 : 1.2} />
      <Hud
        t={{
          module: MODULE_NAMES[stage],
          moduleIndex: stage === "profile" ? 4 : Math.max(1, Number(stage.replace("m", "")) || 0),
          compliance,
          errors,
          hesitationMs,
          sensor: penalty ? "ACTIVE" : "DORMANT",
          uptimeMs,
        }}
      />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8">
        {stage === "boot" && bootLine === 0 && (
          <section className="hes-panel mx-auto max-w-2xl p-8 text-center">
            <Terminal className="mx-auto h-8 w-8 text-phosphor" />
            <h2 className="mt-3 text-3xl tracking-[0.2em] text-phosphor">THE HUMAN ERROR SIMULATOR</h2>
            <p className="mt-3 text-sm text-foreground/80">
              A mandatory four-module evaluation of your suitability for continued participation.
              Audio, haptics and — during penalties only — your camera may be used. Camera frames are
              processed entirely in your browser and never leave this device.
            </p>
            <p className="mt-2 text-xs tracking-widest text-muted-foreground">
              THIS IS SATIRE. NO REAL EMPLOYER IS EVALUATING YOU.
            </p>
            <button
              onClick={beginBoot}
              className="hes-no-cursor mt-6 inline-flex items-center gap-2 border border-phosphor/70 px-6 py-3 text-sm tracking-[0.3em] text-phosphor hover:bg-secondary"
            >
              <Power className="h-4 w-4" /> BEGIN ASSESSMENT
            </button>
          </section>
        )}

        {stage === "boot" && bootLine > 0 && (
          <pre className="mx-auto max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-phosphor-green">
            {BOOT_LINES.slice(0, bootLine).join("\n")}
            <span className="hes-blink">_</span>
          </pre>
        )}

        {stage === "m1" && (
          <ModuleShell
            index={1}
            code="TRAP-ATT"
            title="ATTENTION CALIBRATION"
            brief="Click CONFIRM PRESENCE. The button is calibrated to your reflexes, which are wrong. Three failed confirmations trigger a corrective penalty."
          >
            <AttentionModule
              onError={registerError}
              onPenalty={() => {
                addDefect("ATT-03", "Failed to confirm presence three times in a row");
                setPenalty("tilt-touch");
              }}
            />
          </ModuleShell>
        )}

        {stage === "m2" && (
          <ModuleShell
            index={2}
            code="TRAP-SIG"
            title="IDENTITY ATTESTATION"
            brief="Swipe to attest. The track is intentionally miscalibrated; two rejected attestations escalate to a synchronised motion penalty."
          >
            <SignatureModule
              onError={registerError}
              onPenalty={() => {
                addDefect("SIG-02", "Signature lacked conviction on two consecutive attempts");
                setPenalty("dual-wave");
              }}
            />
          </ModuleShell>
        )}

        {stage === "m3" && (
          <ModuleShell
            index={3}
            code="TRAP-MOR"
            title="MANDATORY MORALE INJECTION"
            brief="Company culture will now be administered. The sting must complete before the clip begins, and the clip plays three times. Acknowledgement is required afterwards."
          >
            {!foxRunning && !m3Ack && (
              <button
                onClick={() => {
                  setFoxRunning(true);
                  sting("beep");
                }}
                className="hes-no-cursor border border-phosphor/70 px-5 py-3 text-sm tracking-[0.3em] text-phosphor hover:bg-secondary"
              >
                RECEIVE CULTURE
              </button>
            )}
            {m3Ack && (
              <div>
                <p className="text-sm text-phosphor-green">MORALE ADMINISTERED. EFFECT: UNCLEAR.</p>
                <button
                  onClick={() => {
                    addDefect("MOR-03", "Endured three consecutive morale injections without leaving");
                    setStage("m4");
                    setPopups(true);
                  }}
                  className="hes-no-cursor mt-4 border border-border px-5 py-2 text-xs tracking-[0.3em] hover:bg-secondary"
                >
                  ACKNOWLEDGE (MANDATORY)
                </button>
              </div>
            )}
          </ModuleShell>
        )}

        {stage === "m4" && (
          <ModuleShell
            index={4}
            code="TRAP-EXT"
            title="EXIT INTERVIEW"
            brief="Speak with GaslightBot three times. It will remember the conversation differently. Notices will continue to arrive; they are load-bearing."
          >
            <GaslightBot
              onSatisfied={() => {
                addDefect("EXT-04", "Attempted to reason with an automated support persona");
                setPopups(false);
                setStage("profile");
              }}
            />
          </ModuleShell>
        )}

        {stage === "profile" && (
          <DefectProfile
            data={{
              defects: defects.length
                ? defects
                : [{ code: "GEN-00", label: "Present, breathing, insufficiently optimised" }],
              compliance,
              errors,
              hesitationMs,
              penaltiesPassed: passed,
              penaltiesTimedOut: timedOut,
              durationMs: Date.now() - startedAt.current,
            }}
            onRestart={restart}
          />
        )}

        {log.length > 0 && stage !== "profile" && (
          <pre className="mx-auto mt-8 max-w-3xl whitespace-pre-wrap border-t border-border/40 pt-3 text-[11px] leading-relaxed text-alarm/80">
            {log.join("\n")}
          </pre>
        )}
      </main>

      <PopupSpam active={popups} intensity={2} max={5} />

      {penalty === "tilt-touch" && (
        <PenaltyOverlay
          kind="tilt-touch"
          track="ruby"
          timeoutMs={15000}
          title="POSTURE CORRECTION 15-A"
          instruction="Tilt your head more than 15° and rest a hand on your cheek or chin. Hold the pose for 2 continuous seconds. Breaking the pose resets the timer."
          requirements={[
            "HEAD TILT > 15°",
            "HAND CONTACT WITH CHEEK OR CHIN",
            "2.0s CONTINUOUS HOLD",
            "FAIL-THROUGH AFTER 15s",
          ]}
          onResolved={resolvePenalty}
        />
      )}

      {penalty === "dual-wave" && (
        <PenaltyOverlay
          kind="dual-wave"
          track="sixtyseven"
          timeoutMs={12000}
          title="ENTHUSIASM VERIFICATION 12-B"
          instruction="Raise both hands and wave them up and down together, across at least 30% of the frame height, for five synchronised cycles. Pausing longer than 500ms resets the count."
          requirements={[
            "BOTH HANDS SYNCHRONISED WITHIN 200ms",
            "VERTICAL AMPLITUDE ≥ 30%",
            "5 COMPLETE UP-DOWN CYCLES",
            "RESET AFTER 500ms PAUSE · FAIL-THROUGH AFTER 12s",
          ]}
          onResolved={resolvePenalty}
        />
      )}

      {foxRunning && (
        <FoxSequence
          onComplete={() => {
            setFoxRunning(false);
            setM3Ack(true);
          }}
        />
      )}
    </CrtFrame>
  );
}
