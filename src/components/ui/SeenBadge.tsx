import { cn } from "@/lib/utils";
import { seenTier, type SeenThresholds } from "@/lib/seenTiers";

// The more you see a DJ, the more their badge levels up (shape, colour, size, holo at the top).
export function SeenBadge({ times, thresholds, className }: { times: number; thresholds: SeenThresholds; className?: string }) {
  const tier = seenTier(times, thresholds);

  return (
    // key on the count replays the pop animation each time it changes (level up)
    <span
      key={times}
      className={cn("seen", `seen--${tier.level}`, className)}
      title={`${tier.name} · vu ${times} fois`}
      aria-label={`${tier.name}, vu ${times} fois`}
    >
      {times}
    </span>
  );
}
