import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Copy, RotateCcw, ScrollText, Check } from "lucide-react";
import { DEFECT_TITLES, randomOf } from "@/lib/hes/copy";
import { loop, sting, stopAll } from "@/lib/hes/audio";

export type Defect = { code: string; label: string };

export type ProfileData = {
  defects: Defect[];
  compliance: number;
  errors: number;
  hesitationMs: number;
  penaltiesPassed: number;
  penaltiesTimedOut: number;
  durationMs: number;
};

function buildReport(d: ProfileData, title: string) {
  const lines = [
    "=== HES-9 DEFECT PROFILE ===",
    `CLASSIFICATION : ${title}`,
    `COMPLIANCE     : ${d.compliance}%`,
    `LOGGED ERRORS  : ${d.errors}`,
    `HESITATION     : ${(d.hesitationMs / 1000).toFixed(1)}s`,
    `PENALTIES MET  : ${d.penaltiesPassed}`,
    `FAIL-THROUGHS  : ${d.penaltiesTimedOut}`,
    `SESSION LENGTH : ${(d.durationMs / 1000).toFixed(0)}s`,
    "",
    "DEFECTS:",
    ...d.defects.map((x) => ` - [${x.code}] ${x.label}`),
    "",
    "VERDICT: Irreversibly human. No patch scheduled.",
  ];
  return lines.join("\n");
}

export function DefectProfile({ data, onRestart }: { data: ProfileData; onRestart: () => void }) {
  const [copied, setCopied] = useState(false);
  const titleRef = useRef(randomOf(DEFECT_TITLES));
  const report = buildReport(data, titleRef.current);

  useEffect(() => {
    stopAll();
    sting("glitch");
    const fire = () =>
      confetti({
        particleCount: 70,
        spread: 100,
        startVelocity: 32,
        ticks: 220,
        origin: { y: 0.35 },
        colors: ["#ffb000", "#ff3b30", "#39ff14", "#f5f5dc"],
        disableForReducedMotion: true,
      });
    fire();
    const t1 = window.setTimeout(fire, 700);
    // Post-credit playback: the terminal refuses to end in silence.
    const t2 = window.setTimeout(() => loop("ruby", 0.4), 2500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      stopAll();
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      sting("beep");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="hes-panel mx-auto w-full max-w-3xl p-6">
      <p className="text-[10px] tracking-[0.4em] text-muted-foreground">ASSESSMENT COMPLETE</p>
      <h2 className="mt-1 flex items-center gap-2 text-3xl tracking-[0.15em] text-phosphor">
        <ScrollText className="h-6 w-6" /> DEFECT PROFILE
      </h2>
      <p className="mt-2 text-lg tracking-[0.3em] text-alarm">{titleRef.current}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["COMPLIANCE", `${data.compliance}%`],
          ["ERRORS", String(data.errors)],
          ["HESITATION", `${(data.hesitationMs / 1000).toFixed(1)}s`],
          ["PENALTIES MET", String(data.penaltiesPassed)],
          ["FAIL-THROUGHS", String(data.penaltiesTimedOut)],
          ["SESSION", `${(data.durationMs / 1000).toFixed(0)}s`],
        ].map(([k, v]) => (
          <div key={k} className="border border-border/60 p-3">
            <p className="text-[10px] tracking-[0.25em] text-muted-foreground">{k}</p>
            <p className="text-xl text-phosphor-green">{v}</p>
          </div>
        ))}
      </div>

      <ul className="mt-5 space-y-1 text-sm">
        {data.defects.map((d) => (
          <li key={d.code + d.label} className="border-b border-border/30 py-1">
            <span className="text-alarm">[{d.code}]</span>{" "}
            <span className="text-foreground/85">{d.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm text-muted-foreground">
        Verdict: irreversibly human. This is a fictional evaluation by a fictional employer. You are
        fine.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={copy}
          className="hes-no-cursor flex items-center gap-2 border border-phosphor/70 px-4 py-2 text-xs tracking-[0.25em] text-phosphor hover:bg-secondary"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "COPIED TO CLIPBOARD" : "COPY DEFECT REPORT"}
        </button>
        <button
          onClick={onRestart}
          className="hes-no-cursor flex items-center gap-2 border border-border px-4 py-2 text-xs tracking-[0.25em] hover:bg-secondary"
        >
          <RotateCcw className="h-3.5 w-3.5" /> RUN ASSESSMENT AGAIN
        </button>
      </div>
    </section>
  );
}
