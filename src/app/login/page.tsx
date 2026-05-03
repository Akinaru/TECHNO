"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl"
      >
        <h1 className="text-4xl font-black mb-2 text-sunset text-center">CONNEXION</h1>
        <p className="text-center text-white/50 mb-8">Accède à ton tracker techno</p>

        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm mb-6 border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white/70 mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-sunset-orange focus:ring-1 focus:ring-sunset-orange transition-all outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-white/70 mb-1">Mot de passe</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-sunset-orange focus:ring-1 focus:ring-sunset-orange transition-all outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-sunset text-white font-black py-3 rounded-xl hover:opacity-90 transition-opacity mt-4 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "SE CONNECTER"}
          </button>
        </form>

        <p className="text-center text-sm text-white/50 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-sunset-orange font-bold hover:underline">
            S'inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
