import { cn } from "@/lib/utils";

// TechnoDex "Slab" logo: hand-cut TD on an accent slab. Reads --accent, so it follows the member's colour.
// Keep in sync with public/logo.svg (same shapes, colours frozen to the default accent).
export const TD_LETTERS = {
  t: "M7 20 L52 17 L53 37 L39 38 L41 82 L22 83 L21 39 L8 40 Z",
  d: "M54 18 L70 17 C88 16 96 31 96 50 C96 69 87 83 70 83 L55 84 Z M69 36 L70 65 C77 65 80 58 80 50 C80 42 77 36 69 36 Z",
};

export function Logo({ className, title = "TechnoDex" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("shrink-0", className)} role="img" aria-label={title}>
      <polygon points="10,16 92,9 88,90 7,84" fill="var(--ink)" transform="translate(4 5)" />
      <polygon points="10,16 92,9 88,90 7,84" fill="var(--accent)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      <g
        transform="translate(50 51) scale(.72) translate(-50 -50)"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth="10"
        strokeLinejoin="round"
        paintOrder="stroke fill"
      >
        <g transform="rotate(-6 50 50)">
          <path d={TD_LETTERS.t} />
          <path d={TD_LETTERS.d} fillRule="evenodd" />
        </g>
      </g>
    </svg>
  );
}
