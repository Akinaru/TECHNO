import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getSpotifyArtistDetails } from "@/lib/spotify";

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      seenBy: {
        include: { user: true },
        orderBy: { times: 'desc' }
      }
    }
  });

  if (!artist) {
    notFound();
  }

  // Optional: Fetch more info from Spotify if we have the ID
  const spotifyDetails = artist.spotifyId ? await getSpotifyArtistDetails(artist.spotifyId) : null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12 bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden group">
        {/* Background decorative gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sunset/10 blur-[100px] -z-10 group-hover:bg-sunset/20 transition-all duration-1000" />
        
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shrink-0 shadow-[0_0_50px_rgba(112,0,255,0.3)] border border-white/10">
          {artist.image ? (
            <Image src={artist.image} alt={artist.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-black/50 flex items-center justify-center text-4xl sm:text-6xl">🎵</div>
          )}
        </div>
        
        <div className="text-center md:text-left flex-1 space-y-6 overflow-hidden w-full">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 text-sunset leading-tight uppercase tracking-tighter italic pr-6 break-words">{artist.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                    <span className="font-black text-sunset-orange pr-1">{artist.seenBy.length}</span>
                    <span className="text-white/50 text-[10px] uppercase font-black tracking-widest">Fans sur le site</span>
                </div>
                {spotifyDetails && (
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                        <span className="font-black text-sunset-purple pr-1">{spotifyDetails.popularity}%</span>
                        <span className="text-white/50 text-[10px] uppercase font-black tracking-widest">Popularité Spotify</span>
                    </div>
                )}
            </div>
          </div>

          {spotifyDetails && spotifyDetails.genres.length > 0 && (
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {spotifyDetails.genres.map((genre: string) => (
                    <span key={genre} className="text-[9px] font-black uppercase tracking-widest bg-sunset/20 text-sunset-orange px-3 py-1 rounded-full border border-sunset/30">
                        {genre}
                    </span>
                ))}
            </div>
          )}

          {spotifyDetails && (
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                {spotifyDetails.followers.toLocaleString()} abonnés sur Spotify
            </p>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-black mb-6 border-b border-white/10 pb-4 tracking-tighter uppercase italic pr-2">ILS L'ONT VU :</h2>
      
      <div className="grid gap-4">
        {artist.seenBy.map((entry) => (
          <Link href={`/profile/${entry.user.id}`} key={entry.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
            <div className="flex items-center gap-4">
              <UserAvatar 
                image={entry.user.image} 
                name={entry.user.name} 
                className="w-12 h-12 text-xl"
              />
              <div>
                <p className="font-bold text-lg group-hover:text-sunset-orange transition-colors pr-2">{entry.user.name}</p>
              </div>
            </div>
            
            <div className="bg-sunset w-12 h-12 flex items-center justify-center rounded-xl shadow-lg border border-white/20">
              <p className="text-xl font-black text-white leading-none italic pr-1">
                {entry.times}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
