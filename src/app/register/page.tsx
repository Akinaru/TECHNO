"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload } from "lucide-react";
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
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="tag">Rejoins le crew · validation admin</span>
          <h1 className="display outlined t-h1 a-drop mt-2" style={{ "--tilt": "1deg" } as React.CSSProperties}>
            Inscription
          </h1>
        </div>

        {error && (
          <div role="alert" className="banner banner--error mb-6">
            <span className="display">!</span>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div role="status" className="banner banner--ok mb-6">
            <span className="display">✓</span>
            <p>{success}</p>
          </div>
        )}

        <div className="shape paper card on-paper tilt a-drop" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
          <form onSubmit={handleSubmit} className="grid gap-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24 group -rotate-3">
                <div className="w-full h-full bg-paper border-[0.18rem] border-dashed border-ink flex flex-col items-center justify-center overflow-hidden transition-transform group-hover:rotate-6">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar.preview} alt="Aperçu" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="text-ink mb-1" size={24} strokeWidth={2.5} />
                      <span className="label text-ink">Photo</span>
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
              <p className="help">Clique pour ajouter ta tête</p>
            </div>

            <label className="field">
              <span className="label ink-muted">Pseudo</span>
              <input
                name="name"
                type="text"
                required
                maxLength={40}
                placeholder="Ton nom de raver"
                className="input"
              />
            </label>

            <label className="field">
              <span className="label ink-muted">Email</span>
              <input
                name="email"
                type="email"
                required
                placeholder="rave@technodex.com"
                className="input"
              />
            </label>

            <label className="field">
              <span className="label ink-muted">Mot de passe</span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••"
                className="input"
              />
              <span className="help">8 caractères minimum.</span>
            </label>

            <button
              type="submit"
              disabled={loading || !!success}
              className={`btn btn--block mt-2${loading ? " is-loading" : ""}`}
            >
              <span>{loading ? "Création…" : "Rejoindre le crew ▸"}</span>
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm ink-muted">
            Déjà un compte ?{" "}
            <Link href="/login" className="link text-ink">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
