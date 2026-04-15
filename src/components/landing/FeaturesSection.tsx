"use client"
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Radar, Ship, MapPin, ShieldCheck, Container, Calculator } from 'lucide-react';

const FEATURES = [
  {
    icon: <Container size={28} />,
    title: 'Layanan LCL & FCL',
    description:
      'Pesan satu kontainer penuh (FCL) atau muatan kecil (LCL) untuk efisiensi biaya pengiriman ke mancanegara.',
    accent: 'from-purple-500/20 to-violet-600/20',
  },
  {
    icon: <Radar size={28} />,
    title: 'Global Tracking',
    description:
      'Pantau posisi real-time kargo Anda kapan saja, bahkan saat berada di tengah samudra terjauh.',
    accent: 'from-blue-500/20 to-cyan-600/20',
  },
  {
    icon: <ShieldCheck size={28} />,
    title: 'Proteksi Kargo',
    description:
      'Standard keamanan internasional dengan opsi asuransi kargo untuk ketenangan pikiran Anda selama perjalanan.',
    accent: 'from-emerald-500/20 to-teal-600/20',
  },
  {
    icon: <MapPin size={28} />,
    title: 'Jaringan Pelabuhan',
    description:
      'Terhubung dengan ratusan pelabuhan utama di seluruh dunia, memastikan barang sampai ke pintu tujuan.',
    accent: 'from-orange-500/20 to-amber-600/20',
  },
  {
    icon: <Ship size={28} />,
    title: 'Armada Modern',
    description:
      'Menggunakan kapal-kapal terbaru dengan teknologi navigasi satelit untuk rute pelayaran paling optimal.',
    accent: 'from-red-500/20 to-rose-600/20',
  },
  {
    icon: <Calculator size={28} />,
    title: 'Estimasi Instan',
    description:
      'Hitung perkiraan biaya pengiriman internasional secara transparan menggunakan kalkulator logistik kami.',
    accent: 'from-indigo-500/20 to-purple-600/20',
  },
];

export const FeaturesSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="layanan" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.06)_0%,transparent_50%)]" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <Ship size={14} className="text-primary mr-2" />
            <span className="text-xs font-mono text-primary tracking-wider uppercase underline decoration-primary/40 underline-offset-4">Logistik Terintegrasi</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white shadow-neon-text mb-4 tracking-tighter">
            Layanan <span className="gradient-text">Logistik Global</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Solusi pengiriman laut komprehensif untuk menjangkau setiap pelabuhan di seluruh belahan dunia.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative bg-[#121217] rounded-3xl p-8 border border-white/5 hover:border-primary/40 transition-all duration-500 hover:bg-[#16161d] hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-zinc-400 leading-relaxed text-sm group-hover:text-zinc-300 transition-colors">
                  {feature.description}
                </p>
              </div>

              {/* Corner decoration */}
              <div className="absolute top-6 right-6 w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-full border-t-2 border-r-2 border-primary/20 rounded-tr-xl" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
