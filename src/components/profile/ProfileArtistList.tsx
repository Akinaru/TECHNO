"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Plus, Minus, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { updateArtistCountAction } from "@/app/actions/spotify";

type ArtistSeen = {
  id: string;
  times: number;
  updatedAt: Date;
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
  isOwnProfile?: boolean;
}

type SortMode = "alpha" | "times" | "recent";

const SORT_MODES: { value: SortMode; label: string }[] = [
  { value: "alpha", label: "A-Z" },
  { value: "times", label: "Les + vus" },
  { value: "recent", label: "Récents" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function ProfileArtistList({ initialArtists, isOwnProfile }: ProfileArtistListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdate = async (artistId: string, increment: boolean) => {
    setLoadingId(artistId + (increment ? "-inc" : "-dec"));
    try {
      await updateArtistCountAction(artistId, increment);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const { filteredAndGroupedArtists, missingLetters } = useMemo(() => {
    // Filter by search query
    const filtered = initialArtists.filter((item) =>
      item.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Non alphabetical sorts are a single flat list
    if (sortMode !== "alpha") {
      const sorted = [...filtered].sort((a, b) =>
        sortMode === "times"
          ? b.times - a.times || a.artist.name.localeCompare(b.artist.name)
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      return {
        filteredAndGroupedArtists: sorted.length ? [["", sorted]] as [string, ArtistSeen[]][] : [],
        missingLetters: [],
      };
    }

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
  }, [initialArtists, searchQuery, sortMode]);

  return (
    <div className="space-y-8">
      {/* Search Bar + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
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
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 self-center sm:self-auto" role="group" aria-label="Trier">
          {SORT_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setSortMode(mode.value)}
              aria-pressed={sortMode === mode.value}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                sortMode === mode.value ? "bg-sunset text-white" : "text-white/40 hover:text-white"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {filteredAndGroupedArtists.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 space-y-6">
          <p className="text-xl text-white/50 italic">
            {initialArtists.length === 0 ? "Aucun DJ pour l'instant." : "Aucun artiste trouvé."}
          </p>
          {isOwnProfile && initialArtists.length === 0 && (
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-sunset px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs text-white"
            >
              <Plus size={14} /> Ajouter mon premier DJ
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {filteredAndGroupedArtists.map(([initial, artists]) => (
            <section key={initial || sortMode} className="space-y-4">
              {initial && (
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-sunset italic pr-2">{initial}</h2>
                  <div className="h-px bg-white/10 flex-1" />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artists.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div 
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-sunset-orange transition-all hover:scale-[1.02] block"
                    >
                      <Link href={`/artist/${item.artist.id}`} className="absolute inset-0 z-0">
                        {item.artist.image ? (
                          <Image 
                            src={item.artist.image} 
                            alt={item.artist.name} 
                            fill
                            className="object-cover opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black/50 text-white/20">
                            <span className="text-3xl sm:text-4xl">🎵</span>
                          </div>
                        )}
                      </Link>

                      <div className="absolute top-0 right-0 z-10 flex flex-col">
                        <div className="bg-sunset min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 flex items-center justify-center rounded-bl-2xl shadow-xl border-l border-b border-white/20">
                          <p className="text-base sm:text-lg font-black text-white leading-none italic pr-1">
                            {item.times}
                          </p>
                        </div>
                        
                        {isOwnProfile && (
                          <div className="flex flex-col gap-1 mt-1 items-end pr-1">
                            <button 
                              onClick={() => handleUpdate(item.artist.id, true)}
                              aria-label={`Vu une fois de plus : ${item.artist.name}`}
                              disabled={!!loadingId}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-sunset text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            >
                              {loadingId === item.artist.id + "-inc" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            </button>
                            <button 
                              onClick={() => handleUpdate(item.artist.id, false)}
                              aria-label={`Retirer un passage : ${item.artist.name}`}
                              disabled={!!loadingId}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all hover:scale-110 active:scale-95 cursor-pointer"
                            >
                              {loadingId === item.artist.id + "-dec" ? <Loader2 size={14} className="animate-spin" /> : <Minus size={14} />}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4 pointer-events-none">
                        <h3 className="font-black text-sm sm:text-lg leading-tight group-hover:text-sunset-orange transition-colors truncate pr-2">{item.artist.name}</h3>
                      </div>
                    </div>

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
      {!searchQuery && sortMode === "alpha" && initialArtists.length > 0 && missingLetters.length > 0 && (
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
