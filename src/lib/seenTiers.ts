// Badge levels for "seen N times". Thresholds are relative to the whole site: the top levels
// stay rare whatever the crew's habits (see computeSeenThresholds).

export const SEEN_LEVEL_NAMES = ["Repéré", "Habitué", "Fan", "Fidèle", "Légende"] as const;

// Minimum count for levels 1 to 5
export type SeenThresholds = [number, number, number, number, number];

// Used until the site has enough data
export const DEFAULT_SEEN_THRESHOLDS: SeenThresholds = [1, 2, 4, 7, 10];

// Share of all (member, DJ) pairs allowed at or above levels 2 to 5
const TOP_SHARES = [0.65, 0.35, 0.15, 0.05];
const MIN_SAMPLE = 20;

// distribution: how many (member, DJ) pairs have each count
export function computeSeenThresholds(distribution: { times: number; count: number }[]): SeenThresholds {
  const rows = distribution.filter((row) => row.times > 0).sort((a, b) => a.times - b.times);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total < MIN_SAMPLE) return DEFAULT_SEEN_THRESHOLDS;

  const maxTimes = rows[rows.length - 1].times;
  // Share of pairs seen at least v times
  const shareAtLeast = (v: number) => rows.reduce((sum, row) => (row.times >= v ? sum + row.count : sum), 0) / total;

  const thresholds: number[] = [1];
  for (const share of TOP_SHARES) {
    let v = thresholds[thresholds.length - 1] + 1;
    while (v <= maxTimes && shareAtLeast(v) > share) v++;
    thresholds.push(v);
  }
  return thresholds as SeenThresholds;
}

export function seenTier(times: number, thresholds: SeenThresholds) {
  let level = 1;
  for (let i = thresholds.length - 1; i > 0; i--) {
    if (times >= thresholds[i]) {
      level = i + 1;
      break;
    }
  }
  const nextMin = level < thresholds.length ? thresholds[level] : null;
  return {
    level,
    name: SEEN_LEVEL_NAMES[level - 1],
    next: nextMin === null ? null : { name: SEEN_LEVEL_NAMES[level], toGo: nextMin - times },
  };
}
