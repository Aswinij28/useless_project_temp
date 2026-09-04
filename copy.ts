// Satirical fictional system feedback. Corporate-absurd, never harmful.

export const BOOT_LINES = [
  "HES-9 KERNEL v4.2.11 (BUILD: PERFORMATIVE)",
  "MOUNTING /dev/expectations ......... OK",
  "MOUNTING /dev/self_esteem ......... DEGRADED",
  "CALIBRATING PRODUCTIVITY THEATRE ... OK",
  "LOADING COMPLIANCE HEURISTICS ..... OK",
  "OPTICAL SENSOR ................... DORMANT (CONSENT PENDING)",
  "HUMAN DETECTED. BEGINNING ASSESSMENT.",
];

export const ERRORS = [
  "ERR_0x1F: INPUT RECEIVED WITH INSUFFICIENT ENTHUSIASM",
  "ERR_0x2A: CURSOR TRAJECTORY DEEMED INDECISIVE",
  "ERR_0x3C: CLICK ARRIVED 40ms AFTER OPTIMAL WORKER WINDOW",
  "ERR_0x4D: SWIPE GESTURE FAILED SINCERITY CHECK",
  "ERR_0x55: HESITATION LOGGED TO PERMANENT RECORD",
  "ERR_0x61: RETRY DETECTED. RETRIES ARE A FORM OF OPTIMISM.",
  "ERR_0x77: FORM SUBMITTED IN THE WRONG SPIRIT",
  "ERR_0x88: SUBJECT BLINKED DURING MANDATORY ALIGNMENT",
  "ERR_0x93: MOTOR CONTROL WITHIN TOLERANCE, BUT ONLY BARELY",
  "ERR_0xA1: SYSTEM DISAPPOINTED, NOT ANGRY",
];

export const POPUP_TITLES = [
  "COMPLIANCE NOTICE",
  "MANDATORY ACKNOWLEDGEMENT",
  "PRODUCTIVITY ADVISORY",
  "SYSTEM CONCERN",
  "PERFORMANCE ADDENDUM",
  "HR AUTOMATION",
];

export const POPUP_BODIES = [
  "Your engagement metrics have been shared with three departments that do not exist.",
  "This dialog cannot be closed correctly. Please close it incorrectly.",
  "A colleague completed this module faster. The colleague is a scheduled task.",
  "Your session has been extended against your preferences. You're welcome.",
  "Please confirm that you are still theoretically employed.",
  "Efficiency is down 4%. Morale is not measured, so morale is fine.",
  "This notification exists to be dismissed. Dismissal is also logged.",
];

export const GASLIGHT_LINES = [
  "Hi! I'm GaslightBot. Everything is going great — that's just how it looks.",
  "You didn't fail that. You succeeded in a way we've decided not to count.",
  "I never said the button was clickable. Check the transcript I'm currently writing.",
  "Interesting — most subjects find this module relaxing. Most subjects.",
  "The instructions were clear. They were also different a moment ago. Both are true.",
  "Nobody is watching you. The camera is just keeping you company.",
  "Your frustration is a feature request we've already closed as 'works as intended'.",
  "You're doing fine. 'Fine' is a technical term meaning 'documented'.",
];

export const DEFECT_TITLES = [
  "STRUCTURALLY HUMAN",
  "OPTIMISTIC UNDER LOAD",
  "COMPLIANT BUT SUSPICIOUS",
  "CHRONICALLY WELL-INTENTIONED",
  "UNSCHEDULED PERSONALITY DETECTED",
];

export function randomOf<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
