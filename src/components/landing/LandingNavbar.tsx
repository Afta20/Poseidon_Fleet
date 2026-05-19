"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu as MenuIcon, X, User, LogOut, Lock, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from '@/hooks/useSession';

const NAV_LINKS = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Tentang Kami', href: '#tentang' },
  { label: 'Layanan Logistik', href: '#layanan' },
  { label: 'Lacak Kargo', href: '#hero' },
  { label: 'Cek Tarif', href: '/calculator' },
];

export const LandingNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { session, loading: sessionLoading } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!session) return '/login';
    if (session.role === 'ADMIN') return '/admin';
    if (session.role === 'MONITORING') return '/dashboard';
    return '/customer';
  };

  // Get initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-primary/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            >
              <Image src="/favico.png" alt="Poseidon Fleet Logo" width={32} height={32} className="glow-border rounded-full" />
            </motion.div>
            <span className="font-sans font-bold text-xl tracking-widest text-[#f4f4f5] shadow-neon-text">
              POSEIDON<span className="text-primary font-mono ml-1">FLEET</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4 h-full relative">
            <div className="group h-full flex items-center px-4 cursor-pointer">
              <span className="font-semibold text-gray-300 group-hover:text-primary flex items-center transition-colors">
                Menu Utama <ChevronDown size={14} className="ml-1 transition-transform group-hover:rotate-180" />
              </span>
              
              <div className="absolute top-[100%] right-32 w-56 bg-[#121217] border border-primary/40 rounded-lg p-2 glow-border shadow-[0_4px_30px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <ul className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        className="block px-4 py-3 text-sm font-mono text-zinc-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Auth Section */}
            {sessionLoading ? (
              <div className="w-20 h-9 bg-zinc-800/50 rounded-lg animate-pulse" />
            ) : session ? (
              /* User Profile Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  onMouseEnter={() => setUserDropdownOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-white/10 hover:border-primary/50 transition-all duration-200 group"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary text-xs font-bold font-mono">
                    {getInitials(session.name)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-white leading-tight truncate max-w-[120px]">{session.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{session.role}</p>
                  </div>
                  <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className="absolute top-[calc(100%+8px)] right-0 w-56 bg-[#121217] border border-primary/40 rounded-xl glow-border shadow-[0_4px_30px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-bold text-white truncate">{session.name}</p>
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{session.role}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href={getDashboardLink()}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard size={14} className="mr-3 text-zinc-500" />
                          Dashboard
                        </Link>
                        <Link
                          href="/change-password"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Lock size={14} className="mr-3 text-zinc-500" />
                          Ubah Password
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-white/10 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={14} className="mr-3" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Login Button (not logged in) */
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary/90 hover:bg-primary rounded-lg transition-all duration-200 glow-border hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-4 pb-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile Auth */}
              {sessionLoading ? (
                <div className="h-11 bg-zinc-800/50 rounded-lg animate-pulse mt-2" />
              ) : session ? (
                <>
                  {/* User info */}
                  <div className="flex items-center space-x-3 px-4 py-3 mt-2 border-t border-white/10">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary text-xs font-bold font-mono">
                      {getInitials(session.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{session.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase">{session.role}</p>
                    </div>
                  </div>
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    <LayoutDashboard size={14} className="mr-3 text-zinc-500" />
                    Dashboard
                  </Link>
                  <Link
                    href="/change-password"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-3 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg"
                  >
                    <Lock size={14} className="mr-3 text-zinc-500" />
                    Ubah Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                  >
                    <LogOut size={14} className="mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block px-4 py-3 text-sm font-semibold text-white bg-primary/90 hover:bg-primary rounded-lg text-center mt-2 glow-border"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
