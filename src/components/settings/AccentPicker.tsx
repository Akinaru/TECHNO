"use client";

import { useState, useTransition } from "react";
import { ACCENT_PRESETS, DEFAULT_ACCENT, accentStyle, isValidAccent } from "@/lib/accent";
import { updateAccentColorAction } from "@/app/actions/user";

// Applies a colour to the whole page right away, before the server confirms it.
function preview(color: string) {
  const style = accentStyle(color) as Record<string, string>;
  for (const [name, value] of Object.entries(style)) document.documentElement.style.setProperty(name, value);
}

export function AccentPicker({ initial }: { initial: string | null }) {
  const [color, setColor] = useState(isValidAccent(initial) ? initial : DEFAULT_ACCENT);
  const [saved, setSaved] = useState(color);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const name = ACCENT_PRESETS.find(([hex]) => hex === color)?.[1];

  function save(next: string) {
    setColor(next);
    setError(null);
    preview(next);
    startTransition(async () => {
      const result = await updateAccentColorAction(next);
      if (result.success) {
        setSaved(next);
      } else {
        setColor(saved);
        preview(saved);
        setError(result.error);
      }
    });
  }

  return (
    <section className="shape panel card grid gap-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="display t-h2">Ta couleur</h2>
        {name && <span className="tag">{name}</span>}
      </div>
      <p className="muted m-0">
        Elle colore toute ton appli, et c&apos;est la couleur que le crew voit sur ton profil et ton avatar.
      </p>
      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Couleurs proposées">
        {ACCENT_PRESETS.map(([hex, label], index) => (
          <button
            key={hex}
            type="button"
            className="swatch"
            title={label}
            aria-label={label}
            aria-pressed={color === hex}
            disabled={pending}
            onClick={() => save(hex)}
            style={{ "--c": hex, "--r": `${index % 2 ? 4 : -4}deg` } as React.CSSProperties}
          />
        ))}
      </div>
      {error && <p role="alert" className="help is-error">{error}</p>}
    </section>
  );
}
