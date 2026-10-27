"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="tag">Accède à ton TechnoDex</span>
          <h1 className="display outlined t-h1 a-drop mt-2" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
            Connexion
          </h1>
        </div>

        {error && (
          <div role="alert" className="banner banner--error mb-6">
            <span className="display">!</span>
            <p>{error}</p>
          </div>
        )}

        <div className="shape paper card on-paper tilt a-drop" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <label className="field">
              <span className="label ink-muted">Email</span>
              <input name="email" type="email" required className="input" />
            </label>

            <label className="field">
              <span className="label ink-muted">Mot de passe</span>
              <input name="password" type="password" required className="input" />
            </label>

            <button type="submit" disabled={loading} className={`btn btn--block mt-2${loading ? " is-loading" : ""}`}>
              <span>{loading ? "Connexion…" : "Se connecter ▸"}</span>
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm ink-muted">
            Pas encore de compte ?{" "}
            <Link href="/register" className="link text-ink">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
