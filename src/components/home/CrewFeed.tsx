import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelative } from "@/lib/utils";
import type { getCrewFeed } from "@/lib/palmares";
import { accentStyle } from "@/lib/accent";

type Feed = Awaited<ReturnType<typeof getCrewFeed>>;

export function CrewFeed({ feed }: { feed: Feed }) {
  if (feed.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2 className="display t-h2">Le fil du crew</h2>
        <span className="tag">{feed.length}</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pt-1 pb-4 -mx-4 px-4 snap-x">
        {feed.map((entry, index) => (
          <div
            key={entry.id}
            className="shape raised row snap-start shrink-0 w-60"
            style={{ "--tilt": `${index % 2 ? 0.6 : -0.6}deg`, "--cut": `var(--cut-${"abc"[index % 3]})`, ...accentStyle(entry.user.accentColor) } as React.CSSProperties}
          >
            <Link href={`/profile/${entry.user.id}`} className="shrink-0">
              <UserAvatar image={entry.user.image} name={entry.user.name} className="w-11 h-11" />
            </Link>
            <div className="min-w-0 text-sm">
              <p className="truncate">
                <Link href={`/profile/${entry.user.id}`} className="font-bold hover:text-accent">
                  {entry.user.name}
                </Link>{" "}
                <span className="muted">a vu</span>
              </p>
              <Link
                href={`/artist/${entry.artist.id}`}
                className="block font-display uppercase text-lg leading-tight truncate text-accent hover:underline"
              >
                {entry.artist.name}
              </Link>
              <p className="text-xs muted font-semibold">
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
