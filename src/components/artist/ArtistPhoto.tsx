import Image from "next/image";
import { cn } from "@/lib/utils";

// Initiales façon DA : « I Hate Models » -> « IHM »
export function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "?"
  );
}

interface ArtistPhotoProps {
  name: string;
  image: string | null;
  sizes: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  initialsClassName?: string;
}

/** Photo d'artiste DA (`.photo`) : vraie image si on l'a, sinon initiales géantes. */
export function ArtistPhoto({ name, image, sizes, alt = "", className, style, initialsClassName }: ArtistPhotoProps) {
  return (
    <div className={cn("photo", className)} style={style}>
      {image ? (
        <Image src={image} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <span className={initialsClassName} aria-hidden>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
