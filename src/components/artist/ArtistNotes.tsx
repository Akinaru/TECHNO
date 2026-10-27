"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateArtistNotesAction } from "@/app/actions/spotify";

const MAX_LENGTH = 500;

export function ArtistNotes({ artistId, initialNotes }: { artistId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saved, setSaved] = useState(initialNotes ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      await updateArtistNotesAction(artistId, notes);
      setSaved(notes);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <div className="shape paper card on-paper tilt mb-12" style={{ "--tilt": "-0.8deg", "--cut": "var(--cut-c)" } as React.CSSProperties}>
      <label htmlFor="artist-notes" className="label ink-muted block mb-3">
        Ton avis <span className="normal-case tracking-normal font-semibold">(visible par le crew)</span>
      </label>
      <textarea
        id="artist-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder="Meilleur set, closing de folie au Rex, le drop sur..."
        className="textarea resize-none"
      />
      <div className="flex items-center justify-between gap-3 mt-4">
        <span className="t-small ink-muted font-bold">{notes.length}/{MAX_LENGTH}</span>
        <div className="flex items-center gap-3">
          {status === "error" && <span className="t-small font-bold text-danger" role="alert">Erreur</span>}
          <button
            onClick={handleSave}
            disabled={status === "saving" || notes === saved}
            className={`btn btn--sm ${status === "saving" ? "is-loading" : ""}`}
          >
            <span>
              {status === "saving" && <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />}
              {status === "saved" && <Check size={14} strokeWidth={2.5} />}
              {status === "saved" ? "Enregistré" : "Enregistrer ▸"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
