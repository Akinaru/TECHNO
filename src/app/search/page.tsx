"use client";

import { useState, useEffect } from "react";
import { searchAction, addArtistAction, getTrendingArtistsAction } from "@/app/actions/spotify";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, Plus, Check, TrendingUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ArtistPhoto } from "@/components/artist/ArtistPhoto";

type Artist = {
  id: string;
  name: string;
  image: string | null;
  localId?: string;
  fanCount?: number;
  personalCount?: number;
};

const TILTS = [-1.2, 0.9, -0.5, 1.4];
const CUTS = ["a", "b", "c"];

export default function SearchPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Artist[]>([]);
  const [trending, setTrending] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch trending on mount
  useEffect(() => {
    async function fetchTrending() {
      const data = await getTrendingArtistsAction();
      setTrending(data);
    }
    fetchTrending();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        const data = await searchAction(query);
        setResults(data);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  async function handleAdd(artist: Artist) {
    if (!session) {
      router.push("/login");
      return;
    }
    
    setAddingId(artist.id);
    try {
        await addArtistAction(artist.id, artist.name, artist.image);
        setSuccessMessage(`"${artist.name}" ajouté !`);
        
        // Refresh trending/results local data after add
        if (query.length > 2) {
            const data = await searchAction(query);
            setResults(data);
        } else {
            const data = await getTrendingArtistsAction();
            setTrending(data);
        }

        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    } catch (error) {
        console.error("Erreur lors de l'ajout:", error);
    } finally {
        setAddingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
      <div className="mb-8">
        <span className="tag">Capture-les tous</span>
        <h1 className="display outlined t-h1 a-drop mt-2" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
          Trouver un DJ
        </h1>
      </div>

      {/* Alert Success */}
      {successMessage && (
        <div className="toast shape paper" role="status">
          <span className="sticker" aria-hidden>
            <Check strokeWidth={2.5} />
          </span>
          <b className="display text-xl">{successMessage}</b>
        </div>
      )}

      <div className="relative mb-12 max-w-2xl">
        <label className="field">
          <span className="label">Artiste</span>
          <span className="search">
            <Search strokeWidth={2.5} aria-hidden />
            <input
              type="text"
              placeholder="Holy Priest, Lil Texas..."
              aria-label="Rechercher un DJ"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input text-lg py-3! pr-12!"
            />
          </span>
        </label>
        {loading && (
          <Loader2
            strokeWidth={2.5}
            className="absolute right-3 bottom-3 w-6 h-6 text-ink animate-spin pointer-events-none"
            aria-hidden
          />
        )}
      </div>

      <div className="grid gap-12">
        {/* Search Results */}
        {query.length > 2 && (
            <section>
                <div className="flex items-baseline justify-between gap-4 mb-4">
                    <h2 className="display t-h2">Résultats Spotify</h2>
                    {results.length > 0 && <span className="tag">{results.length}</span>}
                </div>
                <div className="grid gap-4">
                    {!loading && results.length === 0 && (
                        <div className="empty">
                            <span className="shape slab boil display t-h3" style={{ "--tilt": "-2deg" } as React.CSSProperties}>
                                Aucun DJ trouvé
                            </span>
                            <p className="muted m-0">Vérifie l&apos;orthographe ?</p>
                        </div>
                    )}
                    {results.map((artist, index) => (
                        <div
                            key={artist.id}
                            className="shape raised row"
                            style={{ "--tilt": `${index % 2 ? 0.4 : -0.4}deg`, "--cut": `var(--cut-${CUTS[index % 3]})` } as React.CSSProperties}
                        >
                            <ArtistPhoto
                                name={artist.name}
                                image={artist.image}
                                alt={artist.name}
                                sizes="64px"
                                className="w-14 h-14 md:w-16 md:h-16 shrink-0"
                                style={{ clipPath: "var(--cut-b)" }}
                                initialsClassName="text-lg"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-display uppercase text-lg md:text-xl leading-tight truncate">
                                    {artist.localId ? <Link href={`/artist/${artist.localId}`} className="hover:text-accent">{artist.name}</Link> : artist.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-2 text-xs font-semibold muted">
                                    {Number(artist.fanCount) > 0 && (
                                        <p>
                                            Vu par <span className="text-white font-bold">{artist.fanCount}</span> {Number(artist.fanCount) > 1 ? "ravers" : "raver"}
                                        </p>
                                    )}
                                    {Number(artist.personalCount) > 0 && (
                                        <p>
                                            · dont toi <span className="accent font-bold">{artist.personalCount}</span> fois
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <button
                                onClick={() => handleAdd(artist)}
                                disabled={addingId === artist.id}
                                className={`btn btn--sm btn--dark shrink-0 min-w-0! px-4! ${addingId === artist.id ? "is-loading" : ""}`}
                            >
                                <span>
                                    {addingId === artist.id ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                                    {addingId === artist.id ? "Ajouté" : "Je l'ai vu"}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Trending Artists (Default View) */}
        {query.length <= 2 && trending.length > 0 && (
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <TrendingUp className="w-7 h-7 text-accent shrink-0" strokeWidth={2.5} aria-hidden />
                    <h2 className="display t-h2">Top tendances</h2>
                    <span className="tag ml-auto">{trending.length}</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {trending.map((artist, index) => (
                        <article
                            key={artist.id}
                            className="shape dex"
                            style={{ "--tilt": `${TILTS[index % 4]}deg`, "--cut": `var(--cut-${CUTS[index % 3]})` } as React.CSSProperties}
                        >
                            <div className="dex__top">
                                <span className="dex__num">#{String(index + 1).padStart(2, "0")}</span>
                            </div>
                            <Link href={`/artist/${artist.localId}`} className="block" aria-label={artist.name}>
                                <ArtistPhoto
                                    name={artist.name}
                                    image={artist.image}
                                    alt={artist.name}
                                    sizes="(max-width: 768px) 50vw, 240px"
                                />
                            </Link>
                            <h3 className="dex__name truncate">
                                <Link href={`/artist/${artist.localId}`} className="hover:text-accent">{artist.name}</Link>
                            </h3>
                            <div className="dex__meta">
                                <p>
                                    <span className="text-white font-bold">{artist.fanCount}</span> {Number(artist.fanCount) > 1 ? "Ravers l'ont vu" : "Raver l'a vu"}
                                </p>
                                {Number(artist.personalCount) > 0 && (
                                    <p>
                                        dont toi <span className="accent font-bold">{artist.personalCount}</span> fois
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => handleAdd(artist)}
                                disabled={addingId === artist.id}
                                className={`btn btn--sm btn--dark btn--block min-w-0! ${addingId === artist.id ? "is-loading" : ""}`}
                            >
                                <span>
                                    {addingId === artist.id ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                                    {addingId === artist.id ? "Vu" : "Vu !"}
                                </span>
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        )}
      </div>
    </div>
  );
}
