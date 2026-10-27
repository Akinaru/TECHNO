// Podium medal drawn in the DA style: ink outline, hard offset shadow, scissor-cut shapes.
const METALS = [
  { face: "var(--r-legend)", ribbon: "var(--accent)" }, // or
  { face: "#d4d7e3", ribbon: "var(--r-rare)" }, // argent
  { face: "#e08a4f", ribbon: "var(--r-epic)" }, // bronze
];

export function Medal({ rank, className }: { rank: 1 | 2 | 3; className?: string }) {
  const metal = METALS[rank - 1];

  return (
    <svg viewBox="0 0 44 52" className={className} role="img" aria-label={`${rank}${rank === 1 ? "er" : "e"}`}>
      {/* Ruban : deux bandes découpées */}
      <g stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M8 1.5 L19 2.5 L24.5 22 L14 23.5 Z" fill={metal.ribbon} />
        <path d="M36.5 2 L25 1.5 L19.5 22.5 L30 23 Z" fill={metal.ribbon} />
      </g>
      {/* Ombre dure décalée */}
      <path d="M23 21.5 L36.5 26 L41 38.5 L33 49.5 L19.5 50.5 L8.5 43 L6.5 29 L13 22.5 Z" fill="var(--ink)" transform="translate(2.5 2)" />
      {/* Médaille : polygone irrégulier, contour encre */}
      <path
        d="M23 21.5 L36.5 26 L41 38.5 L33 49.5 L19.5 50.5 L8.5 43 L6.5 29 L13 22.5 Z"
        fill={metal.face}
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Reflet */}
      <path d="M12 30 L16 25.5 L19 26.5 L14.5 33 Z" fill="#ffffff" opacity="0.7" />
      <text
        x="23.5"
        y="44"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="17"
        fill="var(--ink)"
        transform="rotate(-6 23.5 38)"
      >
        {rank}
      </text>
    </svg>
  );
}
