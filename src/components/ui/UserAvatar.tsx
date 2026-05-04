import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  className?: string;
}

export function UserAvatar({ image, name, className }: UserAvatarProps) {
  const fallback = "/avatars/default.png";
  const isLocalUpload = image?.startsWith("/uploads/");
  
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br from-sunset-purple to-sunset-orange flex items-center justify-center font-black text-white shrink-0 shadow-lg", className)}>
      {image ? (
        isLocalUpload ? (
          /* Use standard img tag for local uploads to bypass Next.js Image Optimization 400 errors in prod */
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={image} 
            alt={name || "Utilisateur"} 
            className="w-full h-full object-cover"
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
        <div className="w-full h-full flex items-center justify-center bg-black/40">
           {name ? name[0].toUpperCase() : "?"}
        </div>
      )}
    </div>
  );
}
