"use client"
import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Ship, Route, Clock, Anchor } from 'lucide-react';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  active: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ target, suffix = '', duration = 2, active }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration * 60); // ~60fps
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [active, target, duration]);

  return (
    <span className="font-mono font-bold text-4xl sm:text-5xl lg:text-6xl gradient-text tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const STATS = [
  {
    icon: <Ship size={24} />,
    value: 500,
    suffix: '+',
    label: 'Armada Global',
    description: 'Kapal kargo aktif',
  },
  {
    icon: <Route size={24} />,
    value: 200,
    suffix: '+',
    label: 'Destinasi Negara',
    description: 'Jangkauan pelabuhan',
  },
  {
    icon: <Clock size={24} />,
    value: 10,
    suffix: 'K+',
    label: 'Pengiriman Bulanan',
    description: 'Kontainer terkirim',
  },
  {
    icon: <Anchor size={24} />,
    value: 99,
    suffix: '.9%',
    label: 'Tingkat Keamanan',
    description: 'Kargo tiba dengan selamat',
  },
];

export const StatsSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="statistik" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-[#0f0a18] to-[#0a0a0c]" />
        {/* Horizontal lines decoration */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(168,85,247,0.4) 80px)',
        }} />
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white shadow-neon-text mb-4">
            Data dalam <span className="gradient-text">Angka</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-lg">
            Kepercayaan klien dan skala operasi kami terus bertumbuh.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="relative group text-center p-6 sm:p-8 rounded-2xl bg-[#121217]/80 border border-white/5 hover:border-primary/30 backdrop-blur-sm transition-all duration-500"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  {stat.icon}
                </div>

                <div className="mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} active={isInView} />
                </div>

                <h3 className="text-sm font-semibold text-white mb-1">{stat.label}</h3>
                <p className="text-xs text-zinc-500">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
