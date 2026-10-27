import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getSpotifyArtistDetails } from "@/lib/spotify";
import { ArtistAction } from "@/components/artist/ArtistAction";
import { ArtistNotes } from "@/components/artist/ArtistNotes";
import { ArtistPhoto } from "@/components/artist/ArtistPhoto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { accentStyle } from "@/lib/accent";

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      seenBy: {
        where: { user: { isApproved: true } },
        include: { user: { select: { id: true, name: true, image: true, accentColor: true } } },
        orderBy: { times: 'desc' }
      }
    }
  });

  if (!artist) {
    notFound();
  }

  const personalSeen = artist.seenBy.find(entry => entry.userId === session?.user?.id);

  // Optional: Fetch more info from Spotify if we have the ID
  const spotifyDetails = artist.spotifyId ? await getSpotifyArtistDetails(artist.spotifyId) : null;

  const popularityBlocks = spotifyDetails?.popularity != null ? Math.round(spotifyDetails.popularity / 10) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
      <div className="grid gap-8 md:grid-cols-[minmax(0,20rem)_1fr] md:items-start mb-12">
        <div className="shape dex" style={{ "--tilt": "-1.5deg", padding: "0.6rem" } as React.CSSProperties}>
          <ArtistPhoto
            name={artist.name}
            image={artist.image}
            alt={artist.name}
            sizes="(max-width: 768px) 100vw, 320px"
            style={{ aspectRatio: "4 / 3" }}
            initialsClassName="text-7xl"
          />
        </div>

        <div className="grid gap-6 min-w-0">
          <div>
            <span className="tag">Fiche DJ</span>
            <h1 className="display outlined t-h1 mt-2 break-words a-drop" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
              {artist.name}
            </h1>
          </div>

          {spotifyDetails && spotifyDetails.genres.length > 0 && (
            <div className="chips">
                {spotifyDetails.genres.map((genre: string) => (
                    <span key={genre} className="chip chip--genre">
                        {genre}
                    </span>
                ))}
            </div>
          )}

          <div className="shape paper card on-paper tilt p-5!" style={{ "--tilt": "0.8deg", "--cut": "var(--cut-b)" } as React.CSSProperties}>
            <div className="kv items-end">
              <span className="label ink-muted">Fans sur le site</span>
              <span className="display text-3xl leading-none">{artist.seenBy.length}</span>
            </div>
            {spotifyDetails?.popularity != null && (
              <>
                <div className="divider my-4!" />
                <span className="label ink-muted">Popularité Spotify</span>
                <div className="stats mt-2">
                  <div className="stat">
                    <span className="stat__name">Spotify</span>
                    <span className="blocks" aria-hidden>
                      {Array.from({ length: 10 }, (_, i) => (
                        <i key={i} className={i < popularityBlocks ? "on" : undefined} />
                      ))}
                    </span>
                    <span className="stat__val">{spotifyDetails.popularity}%</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <ArtistAction 
            artistId={artist.id}
            initialCount={personalSeen?.times || 0}
          />
        </div>
      </div>

      {personalSeen && <ArtistNotes artistId={artist.id} initialNotes={personalSeen.notes} />}

      <div className="flex items-baseline justify-between gap-4 mb-5">
        <h2 className="display t-h2">Ils l&apos;ont vu</h2>
        <span className="tag">{artist.seenBy.length}</span>
      </div>
      
      <div className="grid gap-4">
        {artist.seenBy.map((entry, index) => (
          <Link
            href={`/profile/${entry.user.id}`}
            key={entry.id}
            className="shape raised row group"
            style={{ "--tilt": `${index % 2 ? 0.4 : -0.4}deg`, "--cut": `var(--cut-${"abc"[index % 3]})`, ...accentStyle(entry.user.accentColor) } as React.CSSProperties}
          >
            <UserAvatar 
              image={entry.user.image} 
              name={entry.user.name} 
              className="w-12 h-12 text-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-lg group-hover:text-accent">
                {entry.user.name}
                {entry.userId === session?.user?.id && <span className="muted text-sm"> (toi)</span>}
              </p>
              {entry.notes && (
                <p className="t-small muted line-clamp-2">&ldquo;{entry.notes}&rdquo;</p>
              )}
            </div>
            
            <span className="sticker display text-2xl">
              {entry.times}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
