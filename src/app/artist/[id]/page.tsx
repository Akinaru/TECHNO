import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      seenBy: {
        include: { user: true },
        orderBy: { times: 'desc' }
      }
    }
  });

  if (!artist) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12 bg-white/5 p-8 rounded-3xl border border-white/10">
        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shrink-0 shadow-[0_0_50px_rgba(112,0,255,0.3)] border border-white/10">
          {artist.image ? (
            <Image src={artist.image} alt={artist.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-black/50 flex items-center justify-center text-6xl">🎵</div>
          )}
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-sunset leading-tight uppercase tracking-tighter italic pr-6">{artist.name}</h1>
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <span className="font-bold text-sunset-orange">{artist.seenBy.length}</span>
            <span className="text-white/70 text-sm uppercase font-black pr-2">personnes l'ont vu</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-black mb-6 border-b border-white/10 pb-4 tracking-tighter uppercase italic pr-2">ILS Y ÉTAIENT :</h2>
      
      <div className="grid gap-4">
        {artist.seenBy.map((entry) => (
          <Link href={`/profile/${entry.user.id}`} key={entry.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
            <div className="flex items-center gap-4">
              <UserAvatar 
                image={entry.user.image} 
                name={entry.user.name} 
                className="w-12 h-12 text-xl"
              />
              <div>
                <p className="font-bold text-lg group-hover:text-sunset-orange transition-colors pr-2">{entry.user.name}</p>
                <p className="text-xs text-white/50 uppercase font-bold tracking-widest pr-2">Vu le {new Date(entry.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-sunset-orange text-2xl">{entry.times}x</p>
              <p className="text-[10px] text-white/50 uppercase font-black">Vu</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
