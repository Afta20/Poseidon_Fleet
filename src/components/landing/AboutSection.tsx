"use client"
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Globe, Target, Eye, Shield, Users, Anchor } from 'lucide-react';

const COMPANY_VALUES = [
  {
    icon: <Shield size={22} />,
    title: 'Keamanan Kargo',
    description: 'Menjamin keselamatan muatan Anda dengan standar kontainer internasional dan asuransi penuh.',
  },
  {
    icon: <Users size={22} />,
    title: 'Konektivitas Global',
    description: 'Jaringan agen logistik di ratusan pelabuhan utama dunia untuk kelancaran distibusi.',
  },
  {
    icon: <Globe size={22} />,
    title: 'Inovasi Digital',
    description: 'Platform tracking berbasis satelit yang memberikan visibilitas total di tengah samudra.',
  },
];

export const AboutSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="tentang" className="relative py-24 sm:py-32 overflow-hidden bg-[#050507]">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.06)_0%,transparent_50%)]" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <Anchor size={14} className="text-primary mr-2" />
            <span className="text-xs font-mono text-primary tracking-wider uppercase">Visi Dunia</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white shadow-neon-text mb-4">
            Tentang <span className="gradient-text">Poseidon Fleet</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Menghubungkan Benua, Menggerakkan Ekonomi Dunia Melalui Jalur Maritim.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Company Description */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-[#121217] rounded-2xl p-8 border border-white/5 hover:border-primary/20 transition-colors duration-500">
              <p className="text-zinc-300 leading-relaxed text-base">
                <span className="text-white font-semibold">Poseidon Fleet</span> adalah gerbang Anda menuju pasar global. 
                Berawal dari operator armada lokal, kini kami telah berevolusi menjadi raksasa logistik maritim yang melayani 
                pengiriman kargo lintas benua. Kami memahami bahwa setiap peti kemas adalah masa depan bisnis Anda.
              </p>
              <div className="my-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <p className="text-zinc-400 leading-relaxed text-base">
                Dengan armada kapal modern dan sistem pelacakan satelit tercanggih, kami memastikan barang Anda melintasi 
                samudra dengan rute paling efisien. Jangkauan kami mencakup pelabuhan utama di Asia, Eropa, Amerika, dan Australia, 
                menjadikan jarak bukan lagi hambatan bagi pertumbuhan bisnis internasional Anda.
              </p>
            </div>

            {/* Visi & Misi Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-[#121217] rounded-xl p-6 border border-white/5 group hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
                    <Eye size={18} />
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Visi</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Menjadi penyedia logistik maritim paling terintegrasi dan berkelanjutan di dunia.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-[#121217] rounded-xl p-6 border border-white/5 group hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
                    <Target size={18} />
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">Misi</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Menyediakan layanan pengiriman laut yang cepat, transparan, dan aman untuk menjembatani perdagangan global.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Values */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-5"
          >
            <h3 className="text-lg font-semibold text-white mb-2 font-mono tracking-widest uppercase">Global Standards</h3>
            {COMPANY_VALUES.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                className="group bg-[#121217] rounded-xl p-6 border border-white/5 hover:border-primary/30 transition-all duration-300 hover:bg-[#16161d]"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                    {value.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{value.title}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Global highlight stats row */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { num: '50+', label: 'Negara' },
                { num: '200+', label: 'Pelabuhan' },
                { num: '1M+', label: 'Ton Kargo' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
                  className="text-center p-4 rounded-xl bg-[#121217] border border-white/5"
                >
                  <div className="text-2xl font-bold font-mono text-primary">{stat.num}</div>
                  <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
