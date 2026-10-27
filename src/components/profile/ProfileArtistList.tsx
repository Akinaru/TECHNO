"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, Minus, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { updateArtistCountAction } from "@/app/actions/spotify";
import { ArtistPhoto } from "@/components/artist/ArtistPhoto";
import { accentStyle } from "@/lib/accent";

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
        accentColor?: string | null;
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

const TILTS = [-1.2, 0.9, -0.5, 1.4];

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
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <span className="search w-full sm:max-w-md">
          <Search strokeWidth={2.5} aria-hidden />
          <input
            type="text"
            placeholder="Rechercher un artiste..."
            aria-label="Rechercher un artiste"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
        </span>
        <div className="segmented w-full sm:w-auto shrink-0" role="group" aria-label="Trier">
          {SORT_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setSortMode(mode.value)}
              aria-pressed={sortMode === mode.value}
              className="whitespace-nowrap px-4!"
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {filteredAndGroupedArtists.length === 0 ? (
        <div className="shape panel empty">
          <span className="shape slab boil display t-h3" style={{ "--tilt": "-2deg" } as React.CSSProperties}>
            {initialArtists.length === 0 ? "Aucun DJ pour l'instant." : "Aucun artiste trouvé."}
          </span>
          {isOwnProfile && initialArtists.length === 0 && (
            <Link href="/search" className="btn btn--sm">
              <span>
                <Plus size={16} strokeWidth={2.5} /> Ajouter mon premier DJ ▸
              </span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {filteredAndGroupedArtists.map(([initial, artists]) => (
            <section key={initial || sortMode} className="space-y-5">
              {initial && (
                <div className="flex items-center gap-4">
                  <h2 className="display outlined t-h2">{initial}</h2>
                  <div className="divider flex-1 my-0!" />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {artists.map((item, index) => (
                  <article
                    key={item.id}
                    className="shape dex content-start"
                    style={{ "--tilt": `${TILTS[index % 4]}deg`, "--cut": `var(--cut-${"abc"[index % 3]})` } as React.CSSProperties}
                  >
                    <div className="relative">
                      <Link href={`/artist/${item.artist.id}`} className="block" aria-label={item.artist.name}>
                        <ArtistPhoto
                          name={item.artist.name}
                          image={item.artist.image}
                          alt={item.artist.name}
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        />
                      </Link>
                      <span className="sticker display absolute -top-2 -right-2 z-[2] w-10 h-10 text-xl pointer-events-none">
                        {item.times}
                      </span>
                    </div>

                    <h3 className="dex__name truncate">
                      <Link href={`/artist/${item.artist.id}`} className="hover:text-accent">{item.artist.name}</Link>
                    </h3>

                    {/* Social Avatars */}
                    {item.artist.seenBy && item.artist.seenBy.length > 0 && (
                      <div className="flex items-center -space-x-1.5">
                        {item.artist.seenBy.slice(0, 3).map((seen) => (
                          <Link 
                            key={seen.user.id} 
                            href={`/profile/${seen.user.id}`}
                            title={seen.user.name || "Utilisateur"}
                            style={accentStyle(seen.user.accentColor)}
                            className="hover:z-10 transition-transform duration-100 hover:-rotate-6"
                          >
                            <UserAvatar 
                              image={seen.user.image} 
                              name={seen.user.name} 
                              className="w-6 h-6 text-xs shadow-none"
                            />
                          </Link>
                        ))}
                        {item.artist.seenBy.length > 3 && (
                          <span className="w-6 h-6 bg-panel border-[0.15rem] border-ink flex items-center justify-center font-display text-[0.65rem] text-white">
                            +{item.artist.seenBy.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {isOwnProfile && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleUpdate(item.artist.id, false)}
                          aria-label={`Retirer un passage : ${item.artist.name}`}
                          disabled={!!loadingId}
                          className="sq"
                        >
                          {loadingId === item.artist.id + "-dec" ? <Loader2 className="animate-spin" strokeWidth={2.5} /> : <Minus strokeWidth={2.5} />}
                        </button>
                        <button 
                          onClick={() => handleUpdate(item.artist.id, true)}
                          aria-label={`Vu une fois de plus : ${item.artist.name}`}
                          disabled={!!loadingId}
                          className="sq sq--accent"
                        >
                          {loadingId === item.artist.id + "-inc" ? <Loader2 className="animate-spin" strokeWidth={2.5} /> : <Plus strokeWidth={2.5} />}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Missing Letters Section */}
      {!searchQuery && sortMode === "alpha" && initialArtists.length > 0 && missingLetters.length > 0 && (
        <section className="shape panel card">
          <div className="flex items-baseline justify-between gap-4 mb-5">
            <h2 className="display t-h2">L&apos;alphabet incomplet</h2>
            <span className="tag">{missingLetters.length}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {missingLetters.map((letter, index) => (
              <span
                key={letter}
                className="w-10 h-10 bg-bg grid place-items-center font-display text-xl text-ghost"
                style={{ transform: `rotate(${index % 2 ? 3 : -3}deg)`, clipPath: `var(--cut-${"abc"[index % 3]})` }}
              >
                {letter}
              </span>
            ))}
          </div>
          <p className="tag mt-5">
            Trouve des artistes commençant par ces lettres pour compléter ton TechnoDex !
          </p>
        </section>
      )}
    </div>
  );
}
