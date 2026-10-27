"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Users,
  Plus,
  Settings,
  UserCheck,
  LogOut,
  LayoutGrid,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Logo } from "@/components/ui/Logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getPendingUserCountAction } from "@/app/actions/admin";
import { InstallPWA } from "@/components/InstallPWA";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPendingCount() {
      if (session?.user.role === "ADMIN") {
        const count = await getPendingUserCountAction();
        setPendingCount(count);
      }
    }
    fetchPendingCount();

    // Refresh count on focus or navigation
    const interval = setInterval(fetchPendingCount, 60000); // every minute
    return () => clearInterval(interval);
  }, [session, pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on navigation (adjusting state during render, no effect needed)
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsDropdownOpen(false);
    setIsMobilePanelOpen(false);
  }

  useEffect(() => {
    if (isMobilePanelOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobilePanelOpen]);

  const profileHref = session ? `/profile/${session.user.id}` : "/login";
  const isAdmin = session?.user.role === "ADMIN";

  const navLinks = [
    { href: "/", label: "Dex", icon: LayoutGrid, active: pathname === "/" },
    { href: "/users", label: "Le Crew", icon: Users, active: pathname === "/users" },
  ];

  const accountLinks = [
    { href: profileHref, label: "Profil", icon: UserIcon, active: pathname.startsWith("/profile") },
    { href: "/settings", label: "Réglages", icon: Settings, active: pathname === "/settings" },
  ];

  const adminLinks = [
    {
      href: "/admin/validation",
      label: "Membres",
      icon: UserCheck,
      showBadge: true
    },
    {
      href: "/admin/config",
      label: "Configuration",
      icon: Settings
    },
  ];

  const renderBadge = (count: number) => {
    if (count <= 0) return null;
    const label = count > 9 ? "9+" : count.toString();
    return (
      <span className="font-display bg-danger text-ink text-[11px] min-w-5 h-5 px-1 flex items-center justify-center border-2 border-ink -rotate-6 shrink-0">
        {label}
      </span>
    );
  };

  const menuLinkClass = "flex items-center justify-between gap-3 px-3 py-2.5 font-display uppercase text-ink hover:bg-ink hover:text-accent transition-colors";

  const logo = (
    <Link href="/" className="flex items-center gap-3 group">
      <Logo className="w-10 h-10 -rotate-3 group-hover:rotate-6 group-hover:scale-110 transition-transform" />
      <span className="display outlined text-2xl sm:text-3xl">TechnoDex</span>
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-bg/90 backdrop-blur-sm border-b-[0.18rem] border-ink">
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              aria-label="Ouvrir le menu"
              className="sq md:hidden relative"
              onClick={() => setIsMobilePanelOpen(true)}
            >
              <Menu />
              {isAdmin && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger border-2 border-ink" />
              )}
            </button>
            {logo}
          </div>

          {/* DESKTOP: mots fantômes, l'actif sur un slab */}
          <nav className="hidden md:flex ghost-nav">
            {navLinks.map((link) =>
              link.active ? (
                <span key={link.href} className="shape slab boil display" style={{ "--tilt": "-2.5deg", fontSize: "1.9rem" } as React.CSSProperties}>
                  {link.label}
                </span>
              ) : (
                <Link key={link.href} href={link.href}>{link.label}</Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/search" className="btn btn--sm hidden md:inline-flex">
              <span><Plus size={18} strokeWidth={3} /> Ajouter</span>
            </Link>

            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-label="Menu du compte"
                  aria-expanded={isDropdownOpen}
                  className="flex items-center group cursor-pointer relative"
                >
                  <UserAvatar
                    image={session.user.image}
                    name={session.user.name}
                    className="w-10 h-10 -rotate-3 group-hover:rotate-3 transition-transform"
                  />
                  {isAdmin && pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2">{renderBadge(pendingCount)}</span>
                  )}
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -16, rotate: 0, scale: 1.05 }}
                      animate={{ opacity: 1, y: 0, rotate: -1, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="shape paper on-paper absolute right-0 mt-4 w-60 p-2"
                    >
                      <div className="px-3 py-2 mb-1 border-b-2 border-dashed border-[#cfd1da]">
                        <p className="font-display uppercase text-lg truncate">{session.user.name}</p>
                        <p className="tag ink-muted">{session.user.role}</p>
                      </div>

                      {accountLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={menuLinkClass}>
                          <span className="flex items-center gap-3"><link.icon size={16} strokeWidth={2.5} /> {link.label}</span>
                        </Link>
                      ))}

                      {isAdmin && (
                        <>
                          <div className="divider my-1!" />
                          {adminLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={menuLinkClass}>
                              <span className="flex items-center gap-3"><link.icon size={16} strokeWidth={2.5} /> {link.label}</span>
                              {link.showBadge && renderBadge(pendingCount)}
                            </Link>
                          ))}
                        </>
                      )}

                      <div className="divider my-1!" />
                      <button
                        onClick={() => signOut()}
                        className={cn(menuLinkClass, "w-full text-danger hover:text-danger")}
                      >
                        <span className="flex items-center gap-3"><LogOut size={16} strokeWidth={2.5} /> Déconnexion</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="btn btn--dark btn--sm">
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE: barre d'onglets en bas avec bouton central « Ajouter » */}
      {session && (
        <nav className="tabbar fixed! z-40 md:hidden" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} aria-current={link.active ? "page" : undefined}>
              <link.icon strokeWidth={2.5} />
              {link.label}
            </Link>
          ))}
          <span className="fab-wrap">
            <Link href="/search" className="fab" aria-label="Ajouter un DJ">
              <Plus strokeWidth={4} strokeLinecap="square" />
            </Link>
          </span>
          {accountLinks.map((link) => (
            <Link key={link.label} href={link.href} aria-current={link.active ? "page" : undefined}>
              <link.icon strokeWidth={2.5} />
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {/* MOBILE PANEL (DRAWER) */}
      <AnimatePresence>
        {isMobilePanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobilePanelOpen(false)}
              className="fixed inset-0 z-[60] bg-ink/85 md:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "-105%" }}
              animate={{ x: 0 }}
              exit={{ x: "-105%" }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="shape panel fixed inset-y-0 left-0 z-[70] w-[290px] md:hidden flex flex-col"
              style={{ "--cut": "polygon(0 0, 100% 0, 97% 100%, 0 100%)" } as React.CSSProperties}
            >
              <div className="p-5 flex items-center justify-between">
                {logo}
                <button
                  aria-label="Fermer le menu"
                  onClick={() => setIsMobilePanelOpen(false)}
                  className="sq"
                >
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
                {session ? (
                  <div className="shape raised row" style={{ "--tilt": "-0.6deg" } as React.CSSProperties}>
                    <UserAvatar
                      image={session.user.image}
                      name={session.user.name}
                      className="w-12 h-12"
                    />
                    <div className="min-w-0">
                      <p className="font-display uppercase text-lg truncate">{session.user.name}</p>
                      <p className="tag">{session.user.role}</p>
                    </div>
                  </div>
                ) : (
                  <Link href="/login" className="btn btn--block">
                    <span>Connexion ▸</span>
                  </Link>
                )}

                <nav className="grid gap-1">
                  <p className="label text-white/70! px-2 mb-1">Navigation</p>
                  {[...navLinks, ...(session ? accountLinks : [])].map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-4 px-3 py-3 font-display uppercase text-xl transition-colors",
                        link.active ? "bg-accent text-on-accent -rotate-1 shadow-[var(--shadow-sm)]" : "text-white hover:text-accent"
                      )}
                    >
                      <link.icon size={20} strokeWidth={2.5} className={link.active ? undefined : "text-muted"} /> {link.label}
                    </Link>
                  ))}
                </nav>

                {isAdmin && (
                  <nav className="grid gap-1">
                    <p className="label text-white/70! px-2 mb-1">Administration</p>
                    {adminLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center justify-between px-3 py-3 font-display uppercase text-xl transition-colors",
                          pathname === link.href ? "bg-accent text-on-accent -rotate-1 shadow-[var(--shadow-sm)]" : "text-white hover:text-accent"
                        )}
                      >
                        <span className="flex items-center gap-4">
                          <link.icon size={20} strokeWidth={2.5} className={pathname === link.href ? undefined : "text-muted"} /> {link.label}
                        </span>
                        {link.showBadge && renderBadge(pendingCount)}
                      </Link>
                    ))}
                  </nav>
                )}
              </div>

              {session && (
                <div className="p-4">
                  <button
                    onClick={() => signOut()}
                    className="btn btn--danger btn--block"
                  >
                    <span><LogOut size={18} strokeWidth={2.5} /> Déconnexion</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <InstallPWA />
    </>
  );
}
