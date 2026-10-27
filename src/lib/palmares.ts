import { prisma } from "@/lib/prisma";
import { computeSeenThresholds } from "@/lib/seenTiers";

// A user's seen artists, each with a few other crew members who also saw them
export async function getPalmares(userId: string) {
  return prisma.artistSeen.findMany({
    where: { userId },
    include: {
      artist: {
        include: {
          seenBy: {
            where: { NOT: { userId }, user: { isApproved: true } },
            select: {
              user: { select: { id: true, name: true, image: true, accentColor: true } },
            },
            take: 6,
          },
        },
      },
    },
    orderBy: { artist: { name: "asc" } },
  });
}

export type Palmares = Awaited<ReturnType<typeof getPalmares>>;

export function computeStats(palmares: Palmares) {
  const totalSets = palmares.reduce((sum, item) => sum + item.times, 0);
  const top = [...palmares].sort((a, b) => b.times - a.times).slice(0, 3);
  const letters = new Set(
    palmares
      .map((item) => item.artist.name[0]?.toUpperCase())
      .filter((letter) => letter && letter >= "A" && letter <= "Z")
  );

  return {
    uniqueArtists: palmares.length,
    totalSets,
    top,
    lettersCompleted: letters.size,
  };
}

// Artists two users have both seen, and a Jaccard score of how close their taste is
export async function getCompatibility(userId: string, otherUserId: string) {
  const [mine, theirs] = await Promise.all([
    prisma.artistSeen.findMany({ where: { userId }, select: { artistId: true } }),
    prisma.artistSeen.findMany({
      where: { userId: otherUserId },
      select: { artist: { select: { id: true, name: true, image: true } } },
    }),
  ]);

  const mineIds = new Set(mine.map((item) => item.artistId));
  const common = theirs.map((item) => item.artist).filter((artist) => mineIds.has(artist.id));
  const union = mineIds.size + theirs.length - common.length;

  return {
    common: common.sort((a, b) => a.name.localeCompare(b.name)),
    score: union === 0 ? 0 : Math.round((common.length / union) * 100),
  };
}

// What the rest of the crew has been adding lately
export async function getCrewFeed(excludeUserId: string, take = 12) {
  return prisma.artistSeen.findMany({
    where: { userId: { not: excludeUserId }, user: { isApproved: true } },
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      times: true,
      updatedAt: true,
      user: { select: { id: true, name: true, image: true, accentColor: true } },
      artist: { select: { id: true, name: true, image: true } },
    },
  });
}

// Badge thresholds from how often the whole crew sees its DJs
export async function getSeenThresholds() {
  const rows = await prisma.artistSeen.groupBy({
    by: ["times"],
    where: { user: { isApproved: true } },
    _count: { _all: true },
  });
  return computeSeenThresholds(rows.map((row) => ({ times: row.times, count: row._count._all })));
}
