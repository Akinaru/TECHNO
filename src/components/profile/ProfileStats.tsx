import Link from "next/link";
import Image from "next/image";
import type { computeStats } from "@/lib/palmares";
import { Medal } from "@/components/ui/Medal";


export function ProfileStats({ stats }: { stats: ReturnType<typeof computeStats> }) {
  if (stats.uniqueArtists === 0) return null;

  const rows = [
    { value: stats.totalSets, label: "Sets au total" },
    { value: `${stats.lettersCompleted}/26`, label: "Lettres" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 mb-12">
      <div className="shape paper card on-paper tilt" style={{ "--tilt": "-1.2deg" } as React.CSSProperties}>
        <span className="tag ink-muted">Ta collection</span>
        <div className="stat-big mt-1">
          {stats.uniqueArtists} <span className="text-2xl">DJ</span>
        </div>
        <ul className="diamonds display mt-5 text-lg">
          {rows.map((row) => (
            <li key={row.label}>
              {row.label} <span className="ml-auto">{row.value}</span>
            </li>
          ))}
        </ul>
        <div className="gauge mt-5" style={{ "--v": `${(stats.lettersCompleted / 26) * 100}%` } as React.CSSProperties}>
          <b />
          <span>{stats.lettersCompleted} / 26 lettres</span>
        </div>
      </div>

      {stats.top.length > 0 && stats.top[0].times > 1 && (
        <div className="shape panel card">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display t-h2">Le podium</h2>
            <span className="tag">Top {stats.top.length}</span>
          </div>
          <div className="grid gap-3 mt-4">
            {stats.top.map((item, index) => (
              <Link
                key={item.id}
                href={`/artist/${item.artist.id}`}
                className="shape raised row"
                style={{ "--tilt": `${index % 2 ? 0.35 : -0.35}deg` } as React.CSSProperties}
              >
                <Medal rank={(index + 1) as 1 | 2 | 3} className="w-10 h-12 shrink-0 -rotate-6" />
                <div className="relative w-10 h-10 overflow-hidden border-[0.15rem] border-ink bg-ink shrink-0">
                  {item.artist.image ? (
                    <Image src={item.artist.image} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center">🎵</span>
                  )}
                </div>
                <p className="flex-1 min-w-0 font-bold truncate">{item.artist.name}</p>
                <p className="display accent text-xl">{item.times}×</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
