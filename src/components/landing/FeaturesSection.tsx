"use client"
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Radar, BarChart3, Users, Ship, MapPin, Fuel } from 'lucide-react';

const FEATURES = [
  {
    icon: <Radar size={28} />,
    title: 'Pelacakan Real-Time',
    description:
      'Pantau posisi seluruh armada secara langsung dengan teknologi satelit dan pembaruan data setiap 5 detik.',
    accent: 'from-purple-500/20 to-violet-600/20',
  },
  {
    icon: <Fuel size={28} />,
    title: 'Analitik Bahan Bakar',
    description:
      'Monitor konsumsi BBM setiap kapal, identifikasi pemborosan, dan optimalkan efisiensi operasional hingga 30%.',
    accent: 'from-blue-500/20 to-cyan-600/20',
  },
  {
    icon: <Users size={28} />,
    title: 'Manajemen Kru',
    description:
      'Kelola jadwal kru, log aktivitas, dan laporan perjalanan dalam satu platform yang terintegrasi.',
    accent: 'from-emerald-500/20 to-teal-600/20',
  },
  {
    icon: <MapPin size={28} />,
    title: 'Pemetaan Rute',
    description:
      'Visualisasi rute pelayaran dengan overlay cuaca dan kepadatan lalu lintas maritim secara real-time.',
    accent: 'from-orange-500/20 to-amber-600/20',
  },
  {
    icon: <Ship size={28} />,
    title: 'Status Armada',
    description:
      'Pantau status setiap kapal — mulai dari En Route, In Port, Maintenance, hingga deteksi Signal Lost.',
    accent: 'from-red-500/20 to-rose-600/20',
  },
  {
    icon: <BarChart3 size={28} />,
    title: 'Laporan & Dashboard',
    description:
      'Dashboard interaktif dengan chart analytics, megamenu navigasi, dan panel monitoring yang komprehensif.',
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
            <Radar size={14} className="text-primary mr-2" />
            <span className="text-xs font-mono text-primary tracking-wider uppercase">Layanan Kami</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white shadow-neon-text mb-4">
            Fitur <span className="gradient-text">Unggulan</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Platform monitoring armada lengkap dengan fitur-fitur canggih untuk menunjang operasi maritim Anda.
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
              className="group relative bg-[#121217] rounded-2xl p-7 border border-white/5 hover:border-primary/30 transition-all duration-500 hover:bg-[#16161d]"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className="inline-flex p-3.5 rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Corner decoration */}
              <div className="absolute top-4 right-4 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-full border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
