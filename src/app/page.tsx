import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ProfileArtistList } from "@/components/profile/ProfileArtistList";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { CrewFeed } from "@/components/home/CrewFeed";
import { getPalmares, getCrewFeed, computeStats } from "@/lib/palmares";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <span className="tag">Le pokédex des DJs</span>
        <h1 className="display outlined t-hero a-drop mt-4" style={{ "--tilt": "-1.5deg" } as React.CSSProperties}>
          Techno<span className="accent">Dex</span>
        </h1>
        <p className="text-lg md:text-xl mt-6 mb-10 max-w-xl">
          Garde une trace de tous les DJs que tu as vus en teuf.{" "}
          <span className="shape slab boil display" style={{ "--tilt": "-2deg" } as React.CSSProperties}>Capture-les tous</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="btn btn--lg">
            <span>S&apos;inscrire ▸</span>
          </Link>
          <Link href="/login" className="btn btn--dark btn--lg">
            <span>Connexion</span>
          </Link>
        </div>
      </div>
    );
  }

  const [palmares, feed] = await Promise.all([
    getPalmares(session.user.id),
    getCrewFeed(session.user.id),
  ]);
  const stats = computeStats(palmares);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
      <div className="mb-10">
        <span className="tag">Salut {session.user.name}, prêt pour la prochaine teuf ?</span>
        <h1 className="display outlined t-h1 a-drop mt-2" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
          Mon palmarès
        </h1>
      </div>

      <ProfileStats stats={stats} />
      <CrewFeed feed={feed} />

      <ProfileArtistList initialArtists={palmares} isOwnProfile />
    </div>
  );
}
