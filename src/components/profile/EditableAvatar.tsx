"use client";

import { useState } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Upload, Loader2 } from "lucide-react";
import { updateAvatarAction } from "@/app/actions/user";
import { useRouter } from "next/navigation";

interface EditableAvatarProps {
  image: string | null;
  name: string | null;
  userId: string;
  isOwnProfile: boolean;
}

export function EditableAvatar({ image, name, userId, isOwnProfile }: EditableAvatarProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Le fichier est trop volumineux (max 1Mo)");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        await updateAvatarAction(base64);
        router.refresh();
      } catch (error) {
        alert("Erreur lors de l'upload");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative group">
      <UserAvatar 
        image={image} 
        name={name} 
        className="w-24 h-24 sm:w-32 sm:h-32 text-3xl sm:text-5xl shadow-[0_0_50px_rgba(112,0,255,0.3)] transition-opacity group-hover:opacity-75"
      />
      
      {isOwnProfile && (
        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-3xl">
          {loading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-white mb-1" />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Changer</span>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      )}
    </div>
  );
}
