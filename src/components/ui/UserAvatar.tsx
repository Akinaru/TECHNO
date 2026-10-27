import Image from "next/image";
import { cn } from "@/lib/utils";
import { accentStyle } from "@/lib/accent";

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  className?: string;
  // Member's own colour; without it the avatar inherits the surrounding --accent
  accentColor?: string | null;
}

export function UserAvatar({ image, name, className, accentColor }: UserAvatarProps) {
  // Our own avatars are already resized and immutably cached: no need for the optimizer
  const isLocalUpload = image?.startsWith("/");
  
  return (
    <div className={cn("relative overflow-hidden bg-accent text-on-accent border-[0.15rem] border-ink shadow-[var(--shadow-sm)] flex items-center justify-center font-display shrink-0", className)} style={accentStyle(accentColor)}>
      {image ? (
        isLocalUpload ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={image} 
            alt={name || "Utilisateur"} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Image 
            src={image} 
            alt={name || "Utilisateur"} 
            fill 
            className="object-cover"
            sizes="(max-width: 768px) 128px, 256px"
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center">
           {name ? name[0].toUpperCase() : "?"}
        </div>
      )}
    </div>
  );
}
