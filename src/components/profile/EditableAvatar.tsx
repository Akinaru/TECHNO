"use client";

import { UserAvatar } from "@/components/ui/UserAvatar";
import { Upload, Loader2 } from "lucide-react";
import { useAvatarUpload } from "@/components/profile/useAvatarUpload";

interface EditableAvatarProps {
  image: string | null;
  name: string | null;
  isOwnProfile: boolean;
}

export function EditableAvatar({ image, name, isOwnProfile }: EditableAvatarProps) {
  const { upload, loading, error } = useAvatarUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) upload(file);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <UserAvatar
          image={image}
          name={name}
          className="w-24 h-24 sm:w-32 sm:h-32 text-3xl sm:text-5xl shadow-[0_0_50px_rgba(112,0,255,0.3)] transition-opacity group-hover:opacity-75"
        />

        {isOwnProfile && (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-black/40 rounded-2xl">
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
              className="sr-only"
              onChange={handleFileChange}
              disabled={loading}
              aria-label="Changer la photo de profil"
            />
          </label>
        )}
      </div>
      {error && <p className="text-[10px] font-black uppercase tracking-widest text-red-400 max-w-[12rem] text-center">{error}</p>}
    </div>
  );
}
