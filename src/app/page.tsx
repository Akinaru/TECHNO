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
        <h1 className="text-5xl md:text-8xl font-black mb-4 tracking-tighter text-sunset italic pr-4">
          TECHNODEX
        </h1>
        <p className="text-lg md:text-2xl text-white/70 mb-12 max-w-2xl font-bold italic uppercase tracking-tighter pr-2">
          Garde une trace de tous les DJs que tu as vu en teuf.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login" className="bg-white text-black px-8 py-3 rounded-full font-black hover:scale-105 transition-transform uppercase tracking-widest text-sm">
            CONNEXION
          </Link>
          <Link href="/register" className="bg-sunset px-8 py-3 rounded-full font-black text-white hover:scale-105 transition-transform uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(112,0,255,0.4)]">
            S&apos;INSCRIRE
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
      <div className="mb-8">
        <h1 className="text-3xl sm:text-5xl font-black mb-2 text-sunset uppercase tracking-tighter italic pr-4">MON PALMARÈS</h1>
        <p className="text-white/60 font-black uppercase tracking-widest text-xs sm:text-sm italic pr-2">
          Salut {session.user.name}, prêt pour la prochaine teuf ?
        </p>
      </div>

      <ProfileStats stats={stats} />
      <CrewFeed feed={feed} />

      <ProfileArtistList initialArtists={palmares} isOwnProfile />
    </div>
  );
}
