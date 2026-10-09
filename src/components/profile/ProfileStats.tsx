import Link from "next/link";
import Image from "next/image";
import type { computeStats } from "@/lib/palmares";

const MEDALS = ["🥇", "🥈", "🥉"];

export function ProfileStats({ stats }: { stats: ReturnType<typeof computeStats> }) {
  if (stats.uniqueArtists === 0) return null;

  const tiles = [
    { value: stats.uniqueArtists, label: "DJs différents" },
    { value: stats.totalSets, label: "Sets au total" },
    { value: `${stats.lettersCompleted}/26`, label: "Lettres" },
  ];

  return (
    <div className="space-y-4 mb-12">
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-4xl font-black text-sunset italic leading-none pr-1">{tile.value}</p>
            <p className="mt-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40">{tile.label}</p>
          </div>
        ))}
      </div>

      {stats.top.length > 0 && stats.top[0].times > 1 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic mb-3 pr-2">Le podium</p>
          <div className="grid gap-2">
            {stats.top.map((item, index) => (
              <Link
                key={item.id}
                href={`/artist/${item.artist.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <span className="text-xl w-7 text-center" aria-hidden>{MEDALS[index]}</span>
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/50 shrink-0">
                  {item.artist.image ? (
                    <Image src={item.artist.image} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center">🎵</span>
                  )}
                </div>
                <p className="flex-1 font-black uppercase tracking-tight italic truncate group-hover:text-sunset-orange transition-colors pr-2">
                  {item.artist.name}
                </p>
                <p className="text-sm font-black text-sunset-orange pr-1">{item.times}×</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
