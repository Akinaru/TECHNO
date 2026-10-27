"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User closed the share sheet
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={handleShare} className="btn btn--dark btn--sm">
      <span>
        {copied ? <Check size={16} strokeWidth={2.5} /> : <Share2 size={16} strokeWidth={2.5} />}
        {copied ? "Lien copié" : "Partager ▸"}
      </span>
    </button>
  );
}
