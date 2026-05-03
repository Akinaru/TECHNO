"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

type ArtistSeen = {
  id: string;
  times: number;
  artist: {
    id: string;
    name: string;
    image: string | null;
  };
};

interface ProfileArtistListProps {
  initialArtists: ArtistSeen[];
}

export function ProfileArtistList({ initialArtists }: ProfileArtistListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndGroupedArtists = useMemo(() => {
    // Filter by search query
    const filtered = initialArtists.filter((item) =>
      item.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by initial
    const groups: Record<string, ArtistSeen[]> = {};
    
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
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
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
                <h2 className="text-3xl font-black text-sunset italic pr-2">{initial}</h2>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artists.map((item) => (
                  <Link 
                    href={`/artist/${item.artist.id}`} 
                    key={item.id} 
                    className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-sunset-orange transition-all hover:scale-[1.02]"
                  >
                    <div className="absolute top-0 right-0 z-10">
                      <div className="bg-sunset w-10 h-10 flex items-center justify-center rounded-bl-2xl shadow-xl border-l border-b border-white/20">
                        <p className="text-lg font-black text-white leading-none italic">
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
                        <span className="text-4xl">🎵</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <h3 className="font-black text-lg leading-tight group-hover:text-sunset-orange transition-colors truncate pr-2">{item.artist.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
