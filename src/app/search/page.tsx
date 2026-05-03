"use client";

import { useState, useEffect } from "react";
import { searchAction, addArtistAction, getTrendingArtistsAction } from "@/app/actions/spotify";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Search, Plus, Check, AlertCircle, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Artist = {
  id: string;
  name: string;
  image: string | null;
  fanCount?: number;
  personalCount?: number;
};

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
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-12 md:pt-16 pb-32">
      <h1 className="text-5xl md:text-7xl font-black mb-12 text-sunset text-center uppercase tracking-tighter italic pr-4 underline decoration-sunset-purple decoration-8 underline-offset-12">TROUVER UN DJ</h1>
      
      {/* Alert Success */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-8 py-4 rounded-2xl font-black shadow-[0_0_50px_rgba(34,197,94,0.6)] flex items-center gap-3 border border-white/20"
          >
            <Check className="w-5 h-5 text-white" />
            <span className="pr-2 uppercase tracking-tight font-black">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mb-24 group max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-sunset-orange transition-colors">
          <Search size={24} strokeWidth={3} />
        </div>
        <input
          type="text"
          placeholder="Holy Priest, Lil Texas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/5 border-b-2 border-white/10 py-8 pl-16 pr-6 text-2xl font-black uppercase tracking-tighter focus:border-sunset-orange outline-none transition-all placeholder:text-white/10 italic"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
            <div className="animate-spin h-6 w-6 border-4 border-sunset-orange border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      <div className="grid gap-12">
        {/* Search Results */}
        {query.length > 2 && (
            <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                    <p className="text-xs uppercase font-black tracking-[0.3em] text-white/30 italic pr-2">Résultats Spotify</p>
                    <div className="h-px bg-white/5 flex-1" />
                </div>
                <div className="flex flex-col gap-2">
                    {results.map((artist) => (
                        <div key={artist.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.03] transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-white/5 shadow-xl transition-transform group-hover:scale-105">
                                    {artist.image ? (
                                    <Image src={artist.image} alt={artist.name} fill className="object-cover" />
                                    ) : (
                                    <span className="absolute inset-0 flex items-center justify-center text-2xl">🎵</span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-2xl tracking-tighter group-hover:text-sunset-orange transition-colors pr-4 italic uppercase leading-none">{artist.name}</h3>
                                    <div className="flex flex-wrap items-center gap-x-3">
                                        {Number(artist.fanCount) > 0 && (
                                            <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em] italic pr-1">
                                                Vu par <span className="text-sunset-purple">{artist.fanCount}</span> {Number(artist.fanCount) > 1 ? "ravers" : "raver"}
                                            </p>
                                        )}
                                        {Number(artist.personalCount) > 0 && (
                                            <>
                                                <div className="w-1 h-1 bg-white/10 rounded-full" />
                                                <p className="text-xs font-black text-sunset-orange uppercase tracking-[0.2em] italic pr-2">
                                                    dont toi <span className="text-white font-black">{artist.personalCount}</span> fois
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => handleAdd(artist)}
                                disabled={addingId === artist.id}
                                className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest cursor-pointer ${
                                    addingId === artist.id 
                                    ? "bg-white text-black scale-95" 
                                    : "bg-white/5 hover:bg-sunset text-white border border-white/5"
                                }`}
                            >
                                {addingId === artist.id ? <Check size={16} /> : <Plus size={16} />}
                                <span className="hidden sm:block">{addingId === artist.id ? "Ajouté" : "Je l'ai vu"}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Trending Artists (Default View) */}
        {query.length <= 2 && trending.length > 0 && (
            <div className="space-y-10">
                <div className="flex items-center gap-4 px-2">
                    <TrendingUp className="w-5 h-5 text-sunset-orange" />
                    <p className="text-xs uppercase font-black tracking-[0.3em] text-white/40 italic pr-2">TOP TENDANCES</p>
                    <div className="h-px bg-white/5 flex-1" />
                </div>
                
                <div className="flex flex-col gap-8">
                    {trending.map((artist) => (
                        <div key={artist.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-8 sm:gap-12">
                                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-white/5 shrink-0 transition-all duration-700 border border-white/5 group-hover:border-sunset-orange/50 shadow-2xl">
                                    {artist.image ? (
                                    <Image src={artist.image} alt={artist.name} fill className="object-cover transition-all duration-700 group-hover:scale-110" />
                                    ) : (
                                    <span className="absolute inset-0 flex items-center justify-center text-5xl">🎵</span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-black text-4xl sm:text-6xl tracking-tighter pr-6 group-hover:text-sunset-orange transition-colors italic uppercase leading-[0.8]">{artist.name}</h3>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs font-black text-white/40 uppercase tracking-[0.3em] italic pr-2">
                                            <span className="text-sunset-purple font-black">{artist.fanCount}</span> {Number(artist.fanCount) > 1 ? "Ravers l'ont vu" : "Raver l'a vu"}
                                        </p>
                                        {Number(artist.personalCount) > 0 && (
                                            <p className="text-xs font-black text-sunset-orange uppercase tracking-[0.3em] italic pr-2">
                                                dont toi <span className="text-white font-black">{artist.personalCount}</span> fois
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => handleAdd(artist)}
                                disabled={addingId === artist.id}
                                className={`px-10 py-6 rounded-2xl flex items-center gap-3 transition-all font-black uppercase text-xs tracking-[0.3em] cursor-pointer shadow-2xl border border-white/5 ${
                                    addingId === artist.id 
                                    ? "bg-white text-black scale-95" 
                                    : "bg-white/5 hover:bg-sunset text-white hover:border-sunset-orange hover:-translate-y-1"
                                }`}
                            >
                                {addingId === artist.id ? <Check size={24} /> : <Plus size={24} />}
                                <span className="hidden md:block">{addingId === artist.id ? "DÉJÀ VU" : "JE L'AI VU"}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
