"use client";

import { useState } from "react";
import { Plus, Minus, Check, Loader2 } from "lucide-react";
import { seeArtistAction, updateArtistCountAction } from "@/app/actions/spotify";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SeenBadge } from "@/components/ui/SeenBadge";
import { seenTier, type SeenThresholds } from "@/lib/seenTiers";

interface ArtistActionProps {
  artistId: string;
  initialCount: number;
  seenThresholds: SeenThresholds;
}

export function ArtistAction({ artistId, initialCount, seenThresholds }: ArtistActionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(initialCount);

  const handleAdd = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const result = await seeArtistAction(artistId);
      setCount(result.times);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (increment: boolean) => {
    setLoading(true);
    try {
      const result = await updateArtistCountAction(artistId, increment);
      setCount(result.times);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tier = seenTier(count, seenThresholds);

  if (count === 0) {
    return (
      <button
        onClick={handleAdd}
        disabled={loading}
        className={`btn btn--lg btn--block md:w-auto ${loading ? "is-loading" : ""}`}
      >
        <span>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
          ) : (
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          )}
          Je l&apos;ai vu ! ▸
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <div className="stepper">
        <button
          onClick={() => handleUpdate(false)}
          disabled={loading}
          className="sq sq--lg"
          title="Diminuer"
          aria-label="Diminuer"
        >
          <Minus strokeWidth={2.5} />
        </button>
        
        <div className="grid justify-items-center gap-2 leading-none" aria-live="polite">
          <SeenBadge times={count} thresholds={seenThresholds} className="text-[1.6rem]! [--seen-size:4rem]!" />
          <span className="label">{tier.name}</span>
        </div>

        <button
          onClick={() => handleUpdate(true)}
          disabled={loading}
          className="sq sq--lg sq--accent"
          title="Augmenter"
          aria-label="Augmenter"
        >
          {loading ? <Loader2 className="animate-spin" strokeWidth={2.5} /> : <Plus strokeWidth={2.5} />}
        </button>
      </div>

      <div className="grid gap-2 justify-items-start">
        <span className="stamp stamp--green a-slam text-sm inline-flex! items-center gap-2" style={{ "--tilt": "-6deg" } as React.CSSProperties}>
          <Check size={16} strokeWidth={2.5} />
          Dans ton TechnoDex
        </span>
        <span className="t-small muted">
          {tier.next ? `Encore ${tier.next.toGo} fois pour passer ${tier.next.name}` : "Niveau max : légende de ton dex"}
        </span>
      </div>
    </div>
  );
}
