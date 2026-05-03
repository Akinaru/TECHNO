"use server";

import { searchSpotifyArtists as searchSpotify } from "@/lib/spotify";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function searchAction(query: string) {
  if (!query) return [];
  const session = await getServerSession(authOptions);
  
  try {
    const spotifyResults = await searchSpotify(query);
    
    // Enrich with database info (fan count + personal count)
    const enrichedResults = await Promise.all(spotifyResults.map(async (artist: any) => {
      const dbArtist = await prisma.artist.findUnique({
        where: { spotifyId: artist.id },
        include: {
          _count: {
            select: { seenBy: true }
          },
          seenBy: session?.user?.id ? {
            where: { userId: session.user.id }
          } : false
        }
      });

      return {
        ...artist,
        fanCount: dbArtist?._count.seenBy || 0,
        personalCount: dbArtist?.seenBy?.[0]?.times || 0
      };
    }));

    return enrichedResults;
  } catch (error) {
    console.error("Erreur de recherche Spotify:", error);
    return [];
  }
}

export async function addArtistAction(spotifyId: string, name: string, image: string | null) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error("Non autorisé");
  }

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
    } else {
      // Update with spotifyId if it was missing
      artist = await prisma.artist.update({
        where: { id: artist.id },
        data: { spotifyId, image: image || artist.image }
      });
    }
  }

  // Link artist to user
  const existingLink = await prisma.artistSeen.findUnique({
    where: {
      userId_artistId: {
        userId: session.user.id,
        artistId: artist.id
      }
    }
  });

  if (existingLink) {
    // Increment times seen
    await prisma.artistSeen.update({
      where: { id: existingLink.id },
      data: { times: existingLink.times + 1 }
    });
  } else {
    await prisma.artistSeen.create({
      data: {
        userId: session.user.id,
        artistId: artist.id,
        times: 1
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/search"); // To update trending/search counts
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
