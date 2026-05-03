import { getOption } from "./options";

async function getSpotifyAccessToken() {
  const clientId = await getOption("spotify_client_id");
  const clientSecret = await getOption("spotify_client_secret");

  if (!clientId || !clientSecret) {
    console.warn("Spotify credentials not configured in options table");
    return null;
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error("Failed to get Spotify access token:", error);
    return null;
  }
}

export async function searchSpotifyArtists(query: string) {
  const token = await getSpotifyAccessToken();
  
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    
    if (!data.artists || !data.artists.items) {
      return [];
    }

    return data.artists.items.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      image: artist.images?.[0]?.url || null,
    }));
  } catch (error) {
    console.error("Spotify search error:", error);
    return [];
  }
}

export async function getSpotifyArtistDetails(spotifyId: string) {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`https://api.spotify.com/v1/artists/${spotifyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      genres: data.genres,
      followers: data.followers.total,
      popularity: data.popularity,
    };
  } catch (error) {
    console.error("Spotify details error:", error);
    return null;
  }
}
