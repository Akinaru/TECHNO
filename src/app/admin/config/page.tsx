import { getOption, setOption } from "@/lib/options";
import { revalidatePath } from "next/cache";

export default async function AdminConfigPage() {
  const spotifyClientId = await getOption("spotify_client_id") || "";
  const spotifyClientSecret = await getOption("spotify_client_secret") || "";

  async function updateConfig(formData: FormData) {
    "use server";
    const clientId = formData.get("clientId") as string;
    const clientSecret = formData.get("clientSecret") as string;

    await setOption("spotify_client_id", clientId);
    await setOption("spotify_client_secret", clientSecret);
    
    revalidatePath("/admin/config");
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-sunset">Configuration Admin</h1>
      
      <form action={updateConfig} className="space-y-6 bg-white/5 p-6 rounded-xl border border-white/10">
        <div>
          <label className="block text-sm font-medium mb-2">Spotify Client ID</label>
          <input 
            name="clientId"
            type="text" 
            defaultValue={spotifyClientId}
            className="w-full bg-black/50 border border-white/20 rounded-lg p-2 focus:border-sunset-orange outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Spotify Client Secret</label>
          <input 
            name="clientSecret"
            type="password" 
            defaultValue={spotifyClientSecret}
            className="w-full bg-black/50 border border-white/20 rounded-lg p-2 focus:border-sunset-orange outline-none transition-colors"
          />
        </div>

        <button 
          type="submit"
          className="bg-sunset px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Sauvegarder la configuration
        </button>
      </form>
    </div>
  );
}
