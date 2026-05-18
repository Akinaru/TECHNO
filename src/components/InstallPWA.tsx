"use client";

import { useEffect, useState } from "react";
import { Download, Share, PlusSquare, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    // Detect if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 5 seconds
      setTimeout(() => setShowBanner(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If it's iOS, we show the banner after 5s too (unless standalone)
    if (isIosDevice) {
      setTimeout(() => setShowBanner(true), 5000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    setIsDismissed(true);
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (!showBanner || isDismissed) return null;

  return (
    <>
      <div className="fixed bottom-24 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-96">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 relative overflow-hidden group"
        >
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sunset/10 blur-3xl -z-10 group-hover:bg-sunset/20 transition-all duration-1000" />
          
          <div className="w-12 h-12 rounded-2xl bg-sunset flex items-center justify-center shrink-0 shadow-lg shadow-sunset/20">
            <Smartphone className="text-white w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-black uppercase tracking-tighter text-sm italic">Installer TechnoDex</h4>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest truncate">Pour une expérience optimale</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Installer
            </button>
            <button 
              onClick={dismissBanner}
              className="p-2 text-white/30 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showIosInstructions && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-white uppercase tracking-widest text-sm italic">Installer TechnoDex</h3>
                <button 
                  onClick={() => setShowIosInstructions(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-white/60 text-xs font-bold leading-relaxed pr-2">
                  Pour installer l'application sur ton iPhone :
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Share size={16} className="text-sunset" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-wider pr-1">1. Clique sur le bouton "Partager"</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <PlusSquare size={16} className="text-sunset" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-wider pr-1">2. Sélectionne "Sur l'écran d'accueil"</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowIosInstructions(false)}
                  className="w-full py-4 bg-sunset rounded-2xl font-black uppercase tracking-[0.2em] text-xs text-white shadow-lg shadow-sunset/20"
                >
                  J'ai compris
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
