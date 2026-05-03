"use client";

import { useState, useEffect } from "react";
import { searchAction, addArtistAction } from "@/app/actions/spotify";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Search, Plus, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Artist = {
  id: string;
  name: string;
  image: string | null;
};

export default function SearchPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        setSuccessMessage(`"${artist.name}" ajouté à ton palmarès !`);
        
        // Clear success message after 3 seconds
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
    <div className="max-w-2xl mx-auto p-4 md:p-8 pt-12 md:pt-16">
      <h1 className="text-4xl font-black mb-8 text-sunset text-center uppercase tracking-tighter italic pr-4">TROUVER UN DJ</h1>
      
      {/* Alert Success */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-full font-black shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center gap-2 whitespace-nowrap"
          >
            <Check className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-white/40" />
        </div>
        <input
          type="text"
          placeholder="Ex: Amelie Lens, Charlotte de Witte..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-lg focus:border-sunset-orange focus:ring-2 focus:ring-sunset-orange outline-none transition-all shadow-inner"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <div className="animate-spin h-5 w-5 border-2 border-sunset-orange border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {results.map((artist) => (
          <div key={artist.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all group hover:bg-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-black/50 shrink-0 border-2 border-transparent group-hover:border-sunset-purple transition-colors">
                {artist.image ? (
                  <Image src={artist.image} alt={artist.name} fill className="object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">🎵</span>
                )}
              </div>
              <h3 className="font-bold text-xl tracking-tight group-hover:text-sunset-orange transition-colors pr-2">{artist.name}</h3>
            </div>
            
            <button
              onClick={() => handleAdd(artist)}
              disabled={addingId === artist.id}
              className={`p-3 rounded-full flex items-center gap-2 transition-all font-black uppercase text-xs tracking-widest cursor-pointer ${
                addingId === artist.id 
                  ? "bg-white text-black scale-95" 
                  : "bg-sunset hover:scale-105 active:scale-95 text-white"
              }`}
            >
              {addingId === artist.id ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span className="hidden md:block">{addingId === artist.id ? "Ajout..." : "J'y étais"}</span>
            </button>
          </div>
        ))}
        {query.length > 2 && !loading && results.length === 0 && (
          <div className="text-center py-12 text-white/50 italic flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 opacity-20" />
            Aucun résultat trouvé sur Spotify pour "{query}".
          </div>
        )}
      </div>
    </div>
  );
}
