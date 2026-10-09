import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelative } from "@/lib/utils";
import type { getCrewFeed } from "@/lib/palmares";

type Feed = Awaited<ReturnType<typeof getCrewFeed>>;

export function CrewFeed({ feed }: { feed: Feed }) {
  if (feed.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-xs uppercase font-black tracking-[0.3em] text-white/40 italic pr-2">Le fil du crew</h2>
        <div className="h-px bg-white/5 flex-1" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
        {feed.map((entry) => (
          <div
            key={entry.id}
            className="snap-start shrink-0 w-56 bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3"
          >
            <Link href={`/profile/${entry.user.id}`} className="shrink-0">
              <UserAvatar image={entry.user.image} name={entry.user.name} className="w-10 h-10" />
            </Link>
            <div className="min-w-0 text-xs">
              <p className="truncate">
                <Link href={`/profile/${entry.user.id}`} className="font-black hover:text-sunset-orange">
                  {entry.user.name}
                </Link>{" "}
                <span className="text-white/40">a vu</span>
              </p>
              <Link
                href={`/artist/${entry.artist.id}`}
                className="block font-black uppercase italic tracking-tight truncate text-sunset-orange hover:underline pr-1"
              >
                {entry.artist.name}
              </Link>
              <p className="text-[10px] text-white/30 font-bold">
                {entry.times > 1 ? `${entry.times} fois · ` : ""}
                {formatRelative(entry.updatedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
