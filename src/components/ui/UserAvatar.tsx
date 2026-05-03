import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  className?: string;
}

export function UserAvatar({ image, name, className }: UserAvatarProps) {
  const fallback = "/avatars/default.png";
  
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br from-sunset-purple to-sunset-orange flex items-center justify-center font-black text-white shrink-0 shadow-lg", className)}>
      {image ? (
        <Image 
          src={image} 
          alt={name || "Utilisateur"} 
          fill 
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/40">
           {name ? name[0].toUpperCase() : "?"}
        </div>
      )}
      
      {/* Overlay fallback logic: If the image fails to load, we could use an <img> with an onError, 
          but for simplicity we start with the initials or the image */}
    </div>
  );
}
