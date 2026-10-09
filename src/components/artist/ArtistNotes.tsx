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
    <div className="mb-12 bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6">
      <label htmlFor="artist-notes" className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic mb-3 pr-2">
        Ton avis <span className="normal-case tracking-normal font-bold text-white/20">(visible par le crew)</span>
      </label>
      <textarea
        id="artist-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder="Meilleur set, closing de folie au Rex, le drop sur..."
        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:border-sunset-orange outline-none transition-colors resize-none placeholder:text-white/15"
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-white/30 font-bold">{notes.length}/{MAX_LENGTH}</span>
        <div className="flex items-center gap-3">
          {status === "error" && <span className="text-[10px] font-black uppercase text-red-400">Erreur</span>}
          <button
            onClick={handleSave}
            disabled={status === "saving" || notes === saved}
            className="inline-flex items-center gap-2 bg-sunset disabled:opacity-40 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer disabled:cursor-default"
          >
            {status === "saving" && <Loader2 size={12} className="animate-spin" />}
            {status === "saved" && <Check size={12} />}
            {status === "saved" ? "Enregistré" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
