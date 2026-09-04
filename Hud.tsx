import { Activity, Cctv, CircuitBoard, Gauge, ShieldAlert, Timer } from "lucide-react";

export type Telemetry = {
  module: string;
  moduleIndex: number;
  compliance: number;
  errors: number;
  hesitationMs: number;
  sensor: string;
  uptimeMs: number;
};

function Cell({
  icon: Icon,
  label,
  value,
  alarm,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  alarm?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 border-r border-border/40 px-3 py-1.5 last:border-r-0">
      <Icon className={`h-3.5 w-3.5 ${alarm ? "text-alarm" : "text-phosphor-green"}`} />
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className={`text-sm ${alarm ? "text-alarm" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

export function Hud({ t }: { t: Telemetry }) {
  const mins = Math.floor(t.uptimeMs / 60000)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor((t.uptimeMs % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-[2px]">
      <div className="flex flex-wrap items-center justify-between gap-y-1">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <CircuitBoard className="h-4 w-4 text-phosphor" />
          <h1 className="text-sm tracking-[0.35em] text-phosphor">THE HUMAN ERROR SIMULATOR</h1>
          <span className="text-[10px] tracking-widest text-muted-foreground">HES-9 / OPERATOR TERMINAL</span>
        </div>
        <div className="flex flex-wrap items-center">
          <Cell icon={Gauge} label="module" value={`${t.moduleIndex}/4 ${t.module}`} />
          <Cell icon={Activity} label="compliance" value={`${t.compliance}%`} alarm={t.compliance < 40} />
          <Cell icon={ShieldAlert} label="errors" value={String(t.errors)} alarm={t.errors > 0} />
          <Cell icon={Timer} label="hesitation" value={`${(t.hesitationMs / 1000).toFixed(1)}s`} />
          <Cell icon={Cctv} label="sensor" value={t.sensor} alarm={t.sensor === "ACTIVE"} />
          <Cell icon={Timer} label="uptime" value={`${mins}:${secs}`} />
        </div>
      </div>
    </header>
  );
}
