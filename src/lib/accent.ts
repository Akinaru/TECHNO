import type { CSSProperties } from "react";

export const DEFAULT_ACCENT = "#ff7a2f";

export const ACCENT_PRESETS: [hex: string, name: string][] = [
  ["#ff7a2f", "Orange fluo"],
  ["#c7ff72", "Vert citron"],
  ["#ff5fa2", "Rose bonbon"],
  ["#fec83e", "Jaune pièce"],
  ["#5b7cff", "Bleu électrique"],
  ["#a66bff", "Violet rave"],
  ["#3ef0d0", "Cyan laser"],
  ["#ff3b3b", "Rouge stroboscope"],
];

// Only the DA's proposed colours can be picked
export function isValidAccent(value: unknown): value is string {
  return typeof value === "string" && ACCENT_PRESETS.some(([hex]) => hex === value);
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Ink on a light accent, white on a dark one: whichever contrasts most (same rule as the DA guide).
export function onAccent(hex: string) {
  const l = luminance(hex);
  return (l + 0.05) / (0.0067 + 0.05) >= 1.05 / (l + 0.05) ? "#11121a" : "#ffffff";
}

// Scopes the DA's --accent / --on-accent to an element (a user's own colour).
export function accentStyle(color: string | null | undefined): CSSProperties | undefined {
  if (!isValidAccent(color)) return undefined;
  return { "--accent": color, "--on-accent": onAccent(color) } as CSSProperties;
}
