"use client"
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Monitor, Layers, Zap } from 'lucide-react';
import Link from 'next/link';

export const PreviewSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="preview" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08)_0%,transparent_60%)]" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <Monitor size={14} className="text-primary mr-2" />
            <span className="text-xs font-mono text-primary tracking-wider uppercase">Dashboard Preview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white shadow-neon-text mb-4">
            Dashboard <span className="gradient-text">Interaktif</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Kontrol penuh atas seluruh armada dalam satu tampilan yang intuitif dan responsif.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto max-w-5xl"
        >
          <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl" />

          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0c] shadow-2xl shadow-primary/10">
            <div className="flex items-center px-4 py-3 bg-[#121217] border-b border-white/5">
              <div className="flex space-x-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-white/5 text-xs font-mono text-zinc-500">
                  poseidon-fleet.vercel.app/dashboard
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary/30 animate-pulse" />
                  <div className="h-3 w-40 rounded bg-white/10" />
                </div>
                <div className="flex space-x-2">
                  <div className="h-7 w-16 rounded-md bg-white/5" />
                  <div className="h-7 w-16 rounded-md bg-white/5" />
                  <div className="h-7 w-16 rounded-md bg-primary/20" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-56 rounded-xl bg-gradient-to-br from-[#121217] to-[#1a1a24] border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `linear-gradient(rgba(168,85,247,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.2) 1px, transparent 1px)`,
                    backgroundSize: '30px 30px',
                  }} />
                  {[
                    { x: '25%', y: '35%', c: 'bg-green-400' },
                    { x: '45%', y: '50%', c: 'bg-primary' },
                    { x: '65%', y: '30%', c: 'bg-blue-400' },
                    { x: '35%', y: '65%', c: 'bg-yellow-400' },
                    { x: '75%', y: '55%', c: 'bg-red-400' },
                  ].map((d, i) => (
                    <motion.div key={i} className={`absolute w-2.5 h-2.5 rounded-full ${d.c}`}
                      style={{ left: d.x, top: d.y }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/50 backdrop-blur-sm text-xs font-mono text-zinc-400">LIVE MAP</div>
                </div>
                <div className="space-y-4">
                  <div className="h-26 rounded-xl bg-[#121217] border border-white/5 p-4">
                    <div className="h-2 w-20 rounded bg-white/10 mb-3" />
                    <div className="flex items-end space-x-1.5 h-14">
                      {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                        <motion.div key={i} className="flex-1 rounded-t bg-primary/40"
                          initial={{ height: 0 }}
                          animate={isInView ? { height: `${h}%` } : {}}
                          transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="h-26 rounded-xl bg-[#121217] border border-white/5 p-4">
                    <div className="h-2 w-24 rounded bg-white/10 mb-3" />
                    <div className="space-y-2">
                      {[['w-16', 'bg-green-500/30'], ['w-20', 'bg-primary/30'], ['w-14', 'bg-yellow-500/30']].map(([w, c], i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className={`h-2 ${w} rounded bg-white/5`} />
                          <div className={`h-2 w-10 rounded ${c}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-[#121217] border border-white/5 p-3 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex-shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 w-full rounded bg-white/10" />
                      <div className="h-1.5 w-2/3 rounded bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {[
            { icon: <Monitor size={18} />, text: 'Tampilan Responsif' },
            { icon: <Layers size={18} />, text: 'Multi-Layer Map' },
            { icon: <Zap size={18} />, text: 'Update Real-Time' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-center space-x-3 text-zinc-400">
              <span className="text-primary">{item.icon}</span>
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 text-center"
        >
          <Link href="/dashboard"
            className="group inline-flex items-center px-8 py-4 text-base font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all duration-300 glow-border hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-[1.02]"
          >
            Buka Dashboard Sekarang
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
