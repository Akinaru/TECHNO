"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  Disc, 
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

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Le Crew", icon: Users },
  ];

  const adminLinks = [
    { href: "/admin/validation", label: "Validations", icon: UserCheck },
    { href: "/admin/config", label: "Configuration", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-white/10 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full grid grid-cols-3 items-center">
        
        {/* GAUCHE : LOGO / TITRE */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-sunset p-1 rounded-lg group-hover:rotate-12 transition-transform">
              <Disc className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-sunset">TECHNO</span>
          </Link>
          
          {/* Mobile Menu Toggle (Tablette/Mobile) */}
          <button 
            className="md:hidden text-white/50 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* CENTRE : BOUTON AJOUTER */}
        <div className="flex justify-center">
          <Link 
            href="/search" 
            className="bg-sunset hover:brightness-110 transition-all px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(112,0,255,0.2)]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-white">Ajouter</span>
          </Link>
        </div>

        {/* DROITE : NAVIGATION & COMPTE */}
        <div className="flex justify-end items-center gap-6">
          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-xs uppercase font-black tracking-widest transition-colors",
                  pathname === link.href ? "text-white" : "text-white/40 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Dropdown */}
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <UserAvatar 
                  image={session.user.image} 
                  name={session.user.name} 
                  className="w-8 h-8 border border-white/10 group-hover:border-sunset-orange transition-colors"
                />
                <ChevronDown className={cn("w-3 h-3 text-white/30 transition-transform", isDropdownOpen && "rotate-180")} />
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
                      <p className="font-black text-sm text-white truncate">{session.user.name}</p>
                      <p className="text-[10px] text-white/40 uppercase font-bold tracking-tight">{session.user.role}</p>
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
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-xs font-black uppercase tracking-widest text-white/60 hover:text-white"
                          >
                            <link.icon size={14} /> {link.label}
                          </Link>
                        ))}
                      </>
                    )}

                    <div className="h-px bg-white/5 my-1" />
                    <button 
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors text-xs font-black uppercase tracking-widest text-red-500"
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
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE NAV DROPDOWN */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-950 border-b border-white/10 overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-sm font-black uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-3"
                >
                  <link.icon size={16} /> {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
