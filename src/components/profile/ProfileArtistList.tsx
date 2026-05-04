"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";

type ArtistSeen = {
  id: string;
  times: number;
  artist: {
    id: string;
    name: string;
    image: string | null;
    seenBy?: {
      user: {
        id: string;
        name: string | null;
        image: string | null;
      };
    }[];
  };
};

interface ProfileArtistListProps {
  initialArtists: ArtistSeen[];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function ProfileArtistList({ initialArtists }: ProfileArtistListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { filteredAndGroupedArtists, missingLetters } = useMemo(() => {
    // Filter by search query
    const filtered = initialArtists.filter((item) =>
      item.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by initial
    const groups: Record<string, ArtistSeen[]> = {};
    const presentLetters = new Set<string>();
    
    // Sort all first to ensure consistency
    const sorted = [...filtered].sort((a, b) => 
      a.artist.name.localeCompare(b.artist.name)
    );

    sorted.forEach((item) => {
      const initial = item.artist.name[0].toUpperCase();
      if (!groups[initial]) {
        groups[initial] = [];
      }
      groups[initial].push(item);
      if (ALPHABET.includes(initial)) {
        presentLetters.add(initial);
      }
    });

    const missing = ALPHABET.filter(letter => !presentLetters.has(letter));

    return {
      filteredAndGroupedArtists: Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)),
      missingLetters: missing
    };
  }, [initialArtists, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto sm:mx-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-white/30" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un artiste..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-sunset-orange focus:ring-1 focus:ring-sunset-orange outline-none transition-all"
        />
      </div>

      {filteredAndGroupedArtists.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
          <p className="text-xl text-white/50 italic">Aucun artiste trouvé.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredAndGroupedArtists.map(([initial, artists]) => (
            <section key={initial} className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl sm:text-3xl font-black text-sunset italic pr-2">{initial}</h2>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artists.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <Link 
                      href={`/artist/${item.artist.id}`} 
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-sunset-orange transition-all hover:scale-[1.02] block"
                    >
                      <div className="absolute top-0 right-0 z-10">
                        <div className="bg-sunset w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-bl-2xl shadow-xl border-l border-b border-white/20">
                          <p className="text-base sm:text-lg font-black text-white leading-none italic">
                            {item.times}
                          </p>
                        </div>
                      </div>
                      
                      {item.artist.image ? (
                        <Image 
                          src={item.artist.image} 
                          alt={item.artist.name} 
                          fill
                          className="object-cover opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/50 text-white/20">
                          <span className="text-3xl sm:text-4xl">🎵</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4">
                        <h3 className="font-black text-sm sm:text-lg leading-tight group-hover:text-sunset-orange transition-colors truncate pr-2">{item.artist.name}</h3>
                      </div>
                    </Link>

                    {/* Social Avatars */}
                    {item.artist.seenBy && item.artist.seenBy.length > 0 && (
                      <div className="flex items-center -space-x-2 px-1">
                        {item.artist.seenBy.slice(0, 3).map((seen) => (
                          <Link 
                            key={seen.user.id} 
                            href={`/profile/${seen.user.id}`}
                            title={seen.user.name || "Utilisateur"}
                            className="hover:z-10 transition-transform hover:scale-110"
                          >
                            <UserAvatar 
                              image={seen.user.image} 
                              name={seen.user.name} 
                              className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black rounded-full"
                            />
                          </Link>
                        ))}
                        {item.artist.seenBy.length > 3 && (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center z-0">
                            <span className="text-[8px] sm:text-[10px] font-black text-white/50">+{item.artist.seenBy.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Missing Letters Section */}
      {!searchQuery && missingLetters.length > 0 && (
        <section className="pt-12 border-t border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-white/30 uppercase tracking-tighter italic">L&apos;alphabet incomplet</h2>
            <div className="h-px bg-white/5 flex-1" />
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {missingLetters.map(letter => (
              <div 
                key={letter}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center"
              >
                <span className="text-lg sm:text-xl font-black text-white/10 italic">{letter}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-sunset-orange/50 italic">
            Trouve des artistes commençant par ces lettres pour compléter ton TechnoDex !
          </p>
        </section>
      )}
    </div>
  );
}

