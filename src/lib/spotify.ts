import { getOption } from "./options";

// Client-credentials tokens last one hour: reuse them instead of asking Spotify on every call
let cachedToken: { value: string; expiresAt: number; credentials: string } | null = null;

async function getSpotifyAccessToken() {
  const clientId = await getOption("spotify_client_id");
  const clientSecret = await getOption("spotify_client_secret");

  if (!clientId || !clientSecret) {
    console.warn("Spotify credentials not configured in options table");
    return null;
  }

  const credentials = `${clientId}:${clientSecret}`;
  if (cachedToken && cachedToken.credentials === credentials && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(credentials).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    if (!data.access_token) return null;

    cachedToken = {
      value: data.access_token,
      // Renew one minute early to never send an expired token
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
      credentials,
    };
    return cachedToken.value;
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
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=8`,
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

    return data.artists.items.map((artist: { id: string; name: string; images?: { url: string }[] }) => ({
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
      // Spotify no longer returns every field for every app: never assume they exist
      genres: (data.genres ?? []) as string[],
      followers: (data.followers?.total ?? null) as number | null,
      popularity: (data.popularity ?? null) as number | null,
    };
  } catch (error) {
    console.error("Spotify details error:", error);
    return null;
  }
}
