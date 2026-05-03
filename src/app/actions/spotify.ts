"use server";

import { searchSpotifyArtists as searchSpotify } from "@/lib/spotify";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function searchAction(query: string) {
  if (!query) return [];
  try {
    return await searchSpotify(query);
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
  return { success: true };
}
