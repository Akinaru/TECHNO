"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { resizeImageToSquare } from "@/lib/resizeImage";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<{ file: File; preview: string } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resized = await resizeImageToSquare(file);
      if (avatar) URL.revokeObjectURL(avatar.preview);
      setAvatar({ file: resized, preview: URL.createObjectURL(resized) });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image invalide");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    if (avatar) {
      formData.append("image", avatar.file);
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Une erreur est survenue");
      }

      setSuccess(json.message);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-2xl"
      >
        <h1 className="text-4xl font-black mb-2 text-sunset text-center italic uppercase tracking-tighter pr-4">INSCRIPTION</h1>
        <p className="text-center text-white/50 mb-8 font-bold text-xs uppercase tracking-widest">Rejoins le crew (validation admin)</p>

        {error && (
          <div className="bg-red-500/20 text-red-200 p-4 rounded-2xl text-sm mb-6 border border-red-500/50 flex gap-3 items-center">
            <X className="shrink-0" size={18} />
            <p className="pr-2">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 text-green-200 p-4 rounded-2xl text-sm mb-6 border border-green-500/50 flex gap-3 items-center">
            <CheckCircle2 className="shrink-0" size={18} />
            <p className="pr-2">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
             <div className="relative w-24 h-24 group">
                <div className="w-full h-full rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-sunset-orange">
                    {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar.preview} alt="Aperçu" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <>
                            <Upload className="text-white/20 mb-1" size={24} />
                            <span className="text-[8px] font-black uppercase text-white/40">Photo</span>
                        </>
                    )}
                </div>
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    aria-label="Photo de profil"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
             </div>
             <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Clique pour ajouter une photo</p>
          </div>

          <div className="space-y-4">
            <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">Pseudo</label>
                <input 
                name="name" 
                type="text" 
                required 
                maxLength={40}
                placeholder="Ton nom de raver"
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white focus:border-sunset-orange focus:ring-4 focus:ring-sunset-orange/10 transition-all outline-none placeholder:text-white/10"
                />
            </div>

            <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">Email</label>
                <input 
                name="email" 
                type="email" 
                required 
                placeholder="rave@technodex.com"
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white focus:border-sunset-orange focus:ring-4 focus:ring-sunset-orange/10 transition-all outline-none placeholder:text-white/10"
                />
            </div>
            
            <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 ml-1">Mot de passe</label>
                <input 
                name="password" 
                type="password" 
                required 
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white focus:border-sunset-orange focus:ring-4 focus:ring-sunset-orange/10 transition-all outline-none placeholder:text-white/10"
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !!success}
            className="w-full bg-sunset text-white font-black py-4 rounded-2xl hover:opacity-90 transition-opacity mt-2 disabled:opacity-50 cursor-pointer shadow-xl uppercase tracking-widest text-sm"
          >
            {loading ? "Création..." : "S'INSCRIRE AU CREW"}
          </button>
        </form>

        <p className="text-center text-[10px] font-black text-white/30 uppercase tracking-widest mt-8">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-sunset-orange hover:underline pr-1">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
