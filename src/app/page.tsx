import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProfileArtistList } from "@/components/profile/ProfileArtistList";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter text-sunset italic pr-4">
          TECHNODEX
        </h1>
        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl font-bold italic uppercase tracking-tighter pr-2">
          Garde une trace de tous les DJs que tu as vu en teuf.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="bg-white text-black px-8 py-3 rounded-full font-black hover:scale-105 transition-transform uppercase tracking-widest text-sm">
            CONNEXION
          </Link>
          <Link href="/register" className="bg-sunset px-8 py-3 rounded-full font-black text-white hover:scale-105 transition-transform uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(112,0,255,0.4)]">
            S'INSCRIRE
          </Link>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      artists: {
        include: { artist: true },
        orderBy: { artist: { name: 'asc' } }
      }
    }
  });

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-5xl font-black mb-2 text-sunset uppercase tracking-tighter italic pr-4">MON PALMARÈS</h1>
          <p className="text-white/60 font-black uppercase tracking-widest text-sm italic pr-2">
            Tu as vu <span className="text-sunset-orange">{user.artists.length}</span> artistes différents.
          </p>
        </div>
      </div>

      <ProfileArtistList initialArtists={user.artists} />
    </div>
  );
}
