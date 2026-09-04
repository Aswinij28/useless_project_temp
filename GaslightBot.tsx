import { useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { GASLIGHT_LINES, randomOf } from "@/lib/hes/copy";
import { sting } from "@/lib/hes/audio";

type Msg = { id: number; from: "bot" | "you"; text: string };

let seq = 0;

const REBUTTALS = [
  "That's not what happened, but I've saved your version in a folder called 'feelings'.",
  "Noted. I've marked this conversation as 'resolved to my satisfaction'.",
  "You agreed to this in a checkbox you never saw. Legally, that's a handshake.",
  "I'm going to record that as enthusiasm. It'll be easier for both of us.",
  "Let's circle back to this never.",
];

export function GaslightBot({ onSatisfied }: { onSatisfied: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [exchanges, setExchanges] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let i = 0;
    const push = () => {
      setMsgs((m) => [...m, { id: ++seq, from: "bot", text: GASLIGHT_LINES[i]! }]);
      sting("beep");
      i += 1;
    };
    push();
    const id = window.setInterval(() => {
      if (i >= 3) return window.clearInterval(id);
      push();
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMsgs((m) => [...m, { id: ++seq, from: "you", text }]);
    const next = exchanges + 1;
    setExchanges(next);
    window.setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          id: ++seq,
          from: "bot",
          text: next >= 3 ? "Great chat. I've closed your ticket as 'user recalibrated'." : randomOf([...GASLIGHT_LINES, ...REBUTTALS]),
        },
      ]);
      sting("glitch");
      if (next >= 3) window.setTimeout(onSatisfied, 1600);
    }, 700);
  };

  return (
    <div className="hes-panel mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-2 border-b border-border/60 bg-secondary/60 px-3 py-2">
        <Bot className="h-4 w-4 text-phosphor-green" />
        <span className="text-sm tracking-[0.3em] text-phosphor">GASLIGHTBOT™ · SUPPORT</span>
        <span className="ml-auto text-[10px] tracking-widest text-muted-foreground">
          ALWAYS RIGHT · RETROACTIVELY
        </span>
      </div>
      <div className="h-72 space-y-2 overflow-y-auto p-3">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] border px-2.5 py-1.5 text-sm ${
              m.from === "bot"
                ? "border-border/60 bg-secondary/40 text-foreground"
                : "ml-auto border-phosphor/50 bg-background text-phosphor"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-border/60 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Defend yourself (optional, ineffective)"
          className="hes-no-cursor flex-1 bg-transparent px-2 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={send}
          className="hes-no-cursor flex items-center gap-1.5 border border-border px-2.5 py-1 text-xs tracking-widest hover:bg-secondary"
        >
          <Send className="h-3 w-3" /> SEND
        </button>
      </div>
    </div>
  );
}
