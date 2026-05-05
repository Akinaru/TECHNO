"use client";

import { useEffect, useState } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If it's iOS, we show the button by default (unless standalone)
    if (isIosDevice) {
      setIsVisible(true);
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
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border border-white/5"
      >
        <Download size={14} />
        Installer
      </button>

      <AnimatePresence>
        {showIosInstructions && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-white uppercase tracking-widest text-sm">Installer TechnoDex</h3>
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
