"use client";

import { useState } from "react";
import { Plus, Minus, Check, Loader2 } from "lucide-react";
import { addArtistAction, updateArtistCountAction } from "@/app/actions/spotify";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ArtistActionProps {
  artistId: string;
  artistName: string;
  artistImage: string | null;
  initialCount: number;
}

export function ArtistAction({ artistId, artistName, artistImage, initialCount }: ArtistActionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(initialCount);

  const handleAdd = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      await addArtistAction(artistId, artistName, artistImage);
      setCount(prev => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (increment: boolean) => {
    setLoading(true);
    try {
      await updateArtistCountAction(artistId, increment);
      setCount(prev => increment ? prev + 1 : Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (count === 0) {
    return (
      <button
        onClick={handleAdd}
        disabled={loading}
        className="w-full md:w-auto px-8 py-4 bg-sunset hover:bg-sunset-orange text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-sunset/20 flex items-center justify-center gap-3 group"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        )}
        <span>Je l'ai vu !</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <button
          onClick={() => handleUpdate(false)}
          disabled={loading}
          className="p-4 hover:bg-white/5 text-white/50 hover:text-white transition-colors border-r border-white/10"
          title="Diminuer"
        >
          <Minus size={20} />
        </button>
        
        <div className="px-8 py-4 flex items-center gap-3">
          <span className="text-2xl font-black text-sunset italic leading-none">{count}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">fois vu</span>
        </div>

        <button
          onClick={() => handleUpdate(true)}
          disabled={loading}
          className="p-4 hover:bg-white/5 text-white/50 hover:text-white transition-colors border-l border-white/10"
          title="Augmenter"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
        <Check size={16} strokeWidth={3} />
        <span className="text-[10px] font-black uppercase tracking-widest">Dans ton TechnoDex</span>
      </div>
    </div>
  );
}
