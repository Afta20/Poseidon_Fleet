"use client"
import React from 'react';
import { Compass, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/5 bg-[#08080a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Compass className="text-primary" size={24} />
              <span className="font-bold text-xl text-white shadow-neon-text tracking-widest">
                POSEIDON<span className="text-primary font-mono ml-1">FLEET</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Solusi monitoring armada kapal terdepan di Indonesia. Pantau, analisa, dan kelola seluruh armada Anda dari satu platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-3">
              {[
                { label: 'Beranda', href: '#hero' },
                { label: 'Tentang Kami', href: '#tentang' },
                { label: 'Layanan', href: '#layanan' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-zinc-500 hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-zinc-500 text-sm">
                <MapPin size={14} className="text-primary flex-shrink-0" />
                <span>Jl. Babarsari</span>
              </li>
              <li className="flex items-center space-x-3 text-zinc-500 text-sm">
                <Phone size={14} className="text-primary flex-shrink-0" />
                <span>+62 21 1234 5678</span>
              </li>
              <li className="flex items-center space-x-3 text-zinc-500 text-sm">
                <Mail size={14} className="text-primary flex-shrink-0" />
                <span>info@poseidon-fleet.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs">
            &copy; {new Date().getFullYear()} Poseidon Fleet. Seluruh hak dilindungi.
          </p>
          <div className="flex items-center space-x-1 text-zinc-600 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
