"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Ship } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const HeroSection: React.FC = () => {
  const [trackingId, setTrackingId] = React.useState('');
  const router = useRouter();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Local Video Background Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />
        
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-60 scale-[1.05]"
        >
          <source src="/ship-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md mb-8"
        >
          <Globe size={14} className="text-primary mr-2 animate-pulse" />
          <span className="text-xs font-mono text-primary tracking-widest uppercase">
            Global Maritime Logistics Portal
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tighter mb-6 text-white"
        >
          Kirim Barang <br />
          <span className="gradient-text drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Ke Seluruh Dunia</span>
        </motion.h1>

        {/* Tagline & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="space-y-4 mb-10"
        >
          <p className="text-primary font-mono text-sm tracking-[0.3em] uppercase font-bold">
            "Menavigasi Cakrawala Dunia, Mengantar Keunggulan Tanpa Batas"
          </p>
          <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Poseidon Fleet menyediakan jaringan logistik maritim terluas. Dari kontainer tunggal 
            hingga kargo industri, kami mengantarkannya ke pelabuhan mana saja di bumi ini.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link
            href="/login"
            className="group inline-flex items-center px-10 py-4 text-base font-bold text-white bg-primary rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-[1.05]"
          >
            Mulai Pengiriman
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
             href="/calculator"
             className="inline-flex items-center px-10 py-4 text-base font-bold text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 backdrop-blur-md"
          >
            Cek Estimasi Biaya
          </Link>
        </motion.div>

        {/* Tracking Input Container */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.7, delay: 0.6 }}
           className="relative group max-w-xl mx-auto"
        >
           <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
           <div className="relative bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row items-center gap-2">
              <input 
                 type="text" 
                 placeholder="MASUKKAN NOMOR RESI (CONTOH: PF123456)..." 
                 value={trackingId}
                 onChange={(e) => setTrackingId(e.target.value)}
                 onKeyDown={(e) => { if (e.key === 'Enter' && trackingId) router.push(`/track/${trackingId}`) }}
                 className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 px-4 py-3 placeholder-zinc-600 font-mono text-xs tracking-widest text-center sm:text-left"
              />
              <button 
                 onClick={() => { if (trackingId) router.push(`/track/${trackingId}`) }}
                 className="w-full sm:w-auto px-8 py-3 bg-white text-black font-black uppercase tracking-tighter text-sm rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
              >
                 Lacak Kargo
              </button>
           </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Scroll Explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-8 rounded-full border border-zinc-700 flex justify-center pt-1.5"
            >
              <motion.div className="w-1 h-1 rounded-full bg-primary" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #a855f7 50%, #fff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: shine 5s linear infinite;
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
};
