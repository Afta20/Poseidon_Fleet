"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Menu as MenuIcon, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary/90 hover:bg-primary rounded-lg transition-all duration-200 glow-border hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
            >
              Login
            </Link>
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
              <Link
                href="/login"
                className="block px-4 py-3 text-sm font-semibold text-white bg-primary/90 hover:bg-primary rounded-lg text-center mt-2 glow-border"
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
