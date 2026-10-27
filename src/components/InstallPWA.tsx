"use client";

import { useEffect, useState } from "react";
import { Share, PlusSquare, X, Smartphone } from "lucide-react";
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
      <div className="fixed bottom-28 left-4 right-4 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-96">
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -1.5 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          className="shape paper on-paper flex items-center gap-4 p-4"
        >
          <span className="sticker">
            <Smartphone strokeWidth={2.5} />
          </span>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-display uppercase text-lg leading-none">Installer TechnoDex</h4>
            <p className="text-xs ink-muted font-semibold truncate mt-1">Ton dex direct sur l&apos;écran d&apos;accueil</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleInstallClick} className="btn btn--sm min-w-0! px-4!">
              <span>Installer</span>
            </button>
            <button onClick={dismissBanner} aria-label="Fermer" className="sq sq--light">
              <X strokeWidth={3} />
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showIosInstructions && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-ink/85">
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 1.05 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: -1 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 420, damping: 20 }}
              className="shape paper card on-paper w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="display t-h2">Installer TechnoDex</h3>
                <button 
                  onClick={() => setShowIosInstructions(false)}
                  aria-label="Fermer"
                  className="sq sq--light"
                >
                  <X strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-6">
                <p className="m-0">Pour installer l&apos;application sur ton iPhone :</p>
                
                <ul className="diamonds diamonds--prose font-bold">
                  <li className="flex! items-center gap-3">
                    <Share size={18} strokeWidth={2.5} className="text-accent shrink-0" />
                    1. Clique sur le bouton « Partager »
                  </li>
                  <li className="flex! items-center gap-3">
                    <PlusSquare size={18} strokeWidth={2.5} className="text-accent shrink-0" />
                    2. Sélectionne « Sur l&apos;écran d&apos;accueil »
                  </li>
                </ul>

                <button onClick={() => setShowIosInstructions(false)} className="btn btn--block">
                  <span>J&apos;ai compris ▸</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
