import type { ReactNode } from "react";

export function CrtFrame({
  children,
  glitching,
  frozen,
  inverted,
}: {
  children: ReactNode;
  glitching?: boolean;
  frozen?: boolean;
  inverted?: boolean;
}) {
  return (
    <div
      className={[
        "hes-crt relative min-h-screen overflow-hidden bg-background font-terminal text-foreground hes-no-cursor",
        glitching ? "hes-glitch" : "",
        inverted ? "hes-invert-flash" : "",
        frozen ? "saturate-50" : "",
      ].join(" ")}
    >
      <div className="relative z-10">{children}</div>

      {/* scanlines */}
      <div className="hes-scanlines pointer-events-none fixed inset-0 z-40 opacity-25" aria-hidden />
      {/* rolling bar */}
      <div
        className="pointer-events-none fixed inset-x-0 z-40 h-24 bg-gradient-to-b from-transparent via-phosphor/8 to-transparent"
        style={{ animation: "hes-scan 7s linear infinite" }}
        aria-hidden
      />
      {/* vignette */}
      <div className="hes-vignette pointer-events-none fixed inset-0 z-40" aria-hidden />
      {frozen && (
        <div className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-background/70">
          <p className="hes-blink font-terminal text-3xl tracking-[0.4em] text-alarm">
            INTERFACE FROZEN — DO NOT STRUGGLE
          </p>
        </div>
      )}
    </div>
  );
}
