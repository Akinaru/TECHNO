"use server";

import { searchSpotifyArtists as searchSpotify } from "@/lib/spotify";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type SpotifyArtist = { id: string; name: string; image: string | null };

// Counts and personal stats appear on most pages: refresh them all after a change
function revalidateArtistViews() {
  revalidatePath("/", "layout");
}

export async function searchAction(query: string) {
  if (!query) return [];
  const session = await getServerSession(authOptions);

  try {
    const spotifyResults: SpotifyArtist[] = await searchSpotify(query);

    // Enrich with database info (fan count + personal count) in a single query
    const dbArtists = await prisma.artist.findMany({
      where: { spotifyId: { in: spotifyResults.map((artist) => artist.id) } },
      include: {
        _count: { select: { seenBy: true } },
        seenBy: session?.user?.id ? { where: { userId: session.user.id } } : false,
      },
    });
    const bySpotifyId = new Map(dbArtists.map((artist) => [artist.spotifyId, artist]));

    return spotifyResults.map((artist) => {
      const dbArtist = bySpotifyId.get(artist.id);
      return {
        ...artist,
        localId: dbArtist?.id,
        fanCount: dbArtist?._count.seenBy || 0,
        personalCount: dbArtist?.seenBy?.[0]?.times || 0,
      };
    });
  } catch (error) {
    console.error("Erreur de recherche Spotify:", error);
    return [];
  }
}

export async function addArtistAction(spotifyId: string, name: string, image: string | null) {
  const session = await requireUser();

  // Find or create artist
  let artist = await prisma.artist.findUnique({
    where: { spotifyId }
  });

  if (!artist) {
    // If not found by spotifyId, try by name just in case
    artist = await prisma.artist.findUnique({
      where: { name }
    });

    if (!artist) {
      artist = await prisma.artist.create({
        data: {
          spotifyId,
          name,
          image
        }
      });
    } else if (!artist.spotifyId) {
      // Update with spotifyId if it was missing
      artist = await prisma.artist.update({
        where: { id: artist.id },
        data: { spotifyId, image: image || artist.image }
      });
    }
  }

  const times = await markSeen(session.user.id, artist.id);
  revalidateArtistViews();
  return { success: true, localId: artist.id, times };
}

// For artists already in the database (artist page): link by local id
export async function seeArtistAction(artistId: string) {
  const session = await requireUser();
  const times = await markSeen(session.user.id, artistId);
  revalidateArtistViews();
  return { success: true, times };
}

// Links an artist to a user, or counts one more time
async function markSeen(userId: string, artistId: string) {
  const link = await prisma.artistSeen.upsert({
    where: { userId_artistId: { userId, artistId } },
    create: { userId, artistId, times: 1 },
    update: { times: { increment: 1 } },
  });
  return link.times;
}

export async function updateArtistCountAction(artistId: string, increment: boolean) {
  const session = await requireUser();

  const existingLink = await prisma.artistSeen.findUnique({
    where: {
      userId_artistId: {
        userId: session.user.id,
        artistId: artistId
      }
    }
  });

  if (!existingLink) throw new Error("Record not found");

  const newTimes = increment ? existingLink.times + 1 : Math.max(0, existingLink.times - 1);

  if (newTimes === 0) {
    await prisma.artistSeen.delete({
      where: { id: existingLink.id }
    });
  } else {
    await prisma.artistSeen.update({
      where: { id: existingLink.id },
      data: { times: newTimes }
    });
  }

  revalidateArtistViews();
  return { success: true, times: newTimes };
}

export async function removeArtistAction(artistId: string) {
  const session = await requireUser();

  await prisma.artistSeen.deleteMany({
    where: {
      userId: session.user.id,
      artistId: artistId
    }
  });

  revalidateArtistViews();
  return { success: true };
}

export async function updateArtistNotesAction(artistId: string, notes: string) {
  const session = await requireUser();
  const trimmed = notes.trim().slice(0, 500);

  await prisma.artistSeen.update({
    where: { userId_artistId: { userId: session.user.id, artistId } },
    data: { notes: trimmed || null },
  });

  revalidatePath(`/artist/${artistId}`);
  return { success: true };
}

export async function getTrendingArtistsAction() {
  const session = await getServerSession(authOptions);

  const trending = await prisma.artist.findMany({
    include: {
      _count: {
        select: { seenBy: true }
      },
      seenBy: session?.user?.id ? {
        where: { userId: session.user.id }
      } : false
    },
    orderBy: {
      seenBy: {
        _count: 'desc'
      }
    },
    take: 10
  });

  return trending.map(artist => ({
    id: artist.spotifyId || artist.id,
    localId: artist.id,
    name: artist.name,
    image: artist.image,
    fanCount: artist._count.seenBy,
    personalCount: artist.seenBy?.[0]?.times || 0
  }));
}
