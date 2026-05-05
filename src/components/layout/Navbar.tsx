"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { 
  Users, 
  Plus, 
  Settings, 
  UserCheck, 
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  User as UserIcon,
  ChevronDown
} from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
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

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobilePanelOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobilePanelOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobilePanelOpen]);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Le Crew", icon: Users },
  ];

  const adminLinks = [
    { 
      href: "/admin/validation", 
      label: "Validations", 
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
      <span className="bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg border border-white/10 shrink-0">
        {label}
      </span>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-white/10 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full grid grid-cols-3 items-center">
          
          {/* LEFT: LOGO & BURGER */}
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-white/50 hover:text-white cursor-pointer p-1 relative"
              onClick={() => setIsMobilePanelOpen(true)}
            >
              <Menu size={24} />
              {session?.user.role === "ADMIN" && pendingCount > 0 && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black" />
              )}
            </button>
            
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 group-hover:rotate-12 transition-transform duration-500">
                <Image 
                  src="/logo.svg" 
                  alt="TechnoDex Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <span className="hidden sm:block font-black text-xl tracking-tighter text-sunset pr-2 uppercase">TechnoDex</span>
            </Link>
          </div>

          {/* CENTER: ADD BUTTON */}
          <div className="flex justify-center">
            <Link 
              href="/search" 
              className="bg-sunset hover:brightness-110 transition-all px-4 py-2 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(112,0,255,0.2)]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-white pr-1">Ajouter</span>
            </Link>
          </div>

          {/* RIGHT: DESKTOP NAV & PROFILE */}
          <div className="flex justify-end items-center gap-6">
            <div className="hidden lg:block">
              <InstallPWA />
            </div>
            <nav className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "text-xs uppercase font-black tracking-widest transition-colors pr-2",
                    pathname === link.href ? "text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 group cursor-pointer relative"
                >
                  <UserAvatar 
                    image={session.user.image} 
                    name={session.user.name} 
                    className="w-8 h-8 border border-white/10 group-hover:border-sunset-orange transition-colors"
                  />
                  {session.user.role === "ADMIN" && pendingCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-zinc-950 flex items-center justify-center">
                        <span className="text-[8px] font-black text-white">{pendingCount > 9 ? "!" : pendingCount}</span>
                    </div>
                  )}
                  <ChevronDown className={cn("hidden sm:block w-3 h-3 text-white/30 transition-transform", isDropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
                    >
                      <div className="px-3 py-2 border-b border-white/5 mb-2">
                        <p className="font-black text-sm text-white truncate pr-2">{session.user.name}</p>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-tight pr-1">{session.user.role}</p>
                      </div>

                      <Link href={`/profile/${session.user.id}`} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest text-white/60 hover:text-white">
                        <UserIcon size={14} /> Profil
                      </Link>

                      {session.user.role === "ADMIN" && (
                        <>
                          <div className="h-px bg-white/5 my-1" />
                          {adminLinks.map((link) => (
                            <Link 
                              key={link.href} 
                              href={link.href} 
                              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest text-white/60 hover:text-white"
                            >
                              <div className="flex items-center gap-3">
                                <link.icon size={14} /> {link.label}
                              </div>
                              {link.showBadge && renderBadge(pendingCount)}
                            </Link>
                          ))}
                        </>
                      )}

                      <div className="h-px bg-white/5 my-1" />
                      <button 
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors text-xs font-black uppercase tracking-widest text-red-500 cursor-pointer"
                      >
                        <LogOut size={14} /> Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest pr-2"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE PANEL (DRAWER) */}
      <AnimatePresence>
        {isMobilePanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobilePanelOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            />
            
            {/* Panel */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] w-[280px] bg-zinc-950 border-r border-white/10 md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <Link href="/" className="flex items-center gap-3">
                  <div className="relative w-8 h-8">
                    <Image 
                      src="/logo.svg" 
                      alt="TechnoDex Logo" 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  <span className="font-black text-xl tracking-tighter text-sunset pr-2 uppercase">TechnoDex</span>
                </Link>
                <button 
                  onClick={() => setIsMobilePanelOpen(false)}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="px-2">
                  <InstallPWA />
                </div>
                {/* User Info */}
                {session ? (
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <UserAvatar 
                      image={session.user.image} 
                      name={session.user.name} 
                      className="w-12 h-12"
                    />
                    <div className="overflow-hidden">
                      <p className="font-black text-white truncate pr-2">{session.user.name}</p>
                      <p className="text-[10px] text-white/40 uppercase font-black pr-1">{session.user.role}</p>
                    </div>
                  </div>
                ) : (
                  <Link href="/login" className="block p-4 bg-sunset rounded-2xl text-center font-black uppercase tracking-widest text-sm text-white">
                    Connexion
                  </Link>
                )}

                {/* Main Nav */}
                <nav className="space-y-2">
                  <p className="px-4 text-[10px] uppercase font-black text-white/30 tracking-widest">Navigation</p>
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-black uppercase tracking-widest text-xs pr-2",
                        pathname === link.href ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"
                      )}
                    >
                      <link.icon size={18} /> {link.label}
                    </Link>
                  ))}
                  <Link 
                    href={session ? `/profile/${session.user.id}` : "/login"}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-black uppercase tracking-widest text-xs pr-2",
                      pathname.startsWith("/profile") ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"
                    )}
                  >
                    <UserIcon size={18} /> Mon Profil
                  </Link>
                </nav>

                {/* Admin Nav */}
                {session?.user.role === "ADMIN" && (
                  <nav className="space-y-2">
                    <p className="px-4 text-[10px] uppercase font-black text-white/30 tracking-widest">Administration</p>
                    {adminLinks.map((link) => (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl transition-all font-black uppercase tracking-widest text-xs pr-2",
                          pathname === link.href ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-4">
                            <link.icon size={18} /> {link.label}
                        </div>
                        {link.showBadge && renderBadge(pendingCount)}
                      </Link>
                    ))}
                  </nav>
                )}
              </div>

              {/* Logout at bottom */}
              {session && (
                <div className="p-4 border-t border-white/5">
                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-xs cursor-pointer hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut size={18} /> Déconnexion
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
