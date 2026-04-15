"use client"
import React, { useState } from 'react';
import { Megamenu } from '@/components/layout/Megamenu';
import { Calculator, ArrowRight, Ship, Anchor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    type: 'LCL',
    weight: 0,
    volume: 0
  });

  const [result, setResult] = useState<number | null>(null);

  const calculateCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.origin || !formData.destination) return;
    
    // Mock Calculation Logic
    let basePrice = formData.type === 'FCL' ? 5000000 : 500000;
    let distanceFactor = Math.random() * 0.5 + 1; // Random factor between 1x and 1.5x
    
    let weightCost = formData.weight * 5000; // 5000 IDR per kg
    let volumeCost = formData.volume * 500000; // 500000 IDR per m3
    
    // Total is calculated using base + max of weight/volume cost * distance
    let total = basePrice + (Math.max(weightCost, volumeCost) * distanceFactor);
    
    setResult(Math.round(total));
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <motion.div 
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4 glow-border"
          >
             <Calculator size={32} />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 font-sans tracking-wide shadow-neon-text">Kalkulator Biaya Logistik</h1>
          <p className="text-zinc-400">Hitung estimasi pengiriman muatan Kargo atau Kontainer (FCL/LCL) secara instan.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#121217] p-8 rounded-2xl border border-white/10 glow-border">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Ship className="mr-2 text-primary" size={20} />
              Detail Pengiriman
            </h2>
            <form onSubmit={calculateCost} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-zinc-400 mb-1">Pelabuhan Asal</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white focus:outline-none focus:border-primary"
                  placeholder="Misal: Tanjung Priok, Jakarta"
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-zinc-400 mb-1">Pelabuhan Tujuan</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white focus:outline-none focus:border-primary"
                  placeholder="Misal: Tanjung Perak, Surabaya"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-zinc-400 mb-1">Tipe Kargo</label>
                <select 
                  className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white focus:outline-none focus:border-primary"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="LCL">LCL (Less than Container Load) - Muatan Kecil</option>
                  <option value="FCL">FCL (Full Container Load) - Sewa 1 Kontainer</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono text-zinc-400 mb-1">Berat (Kg)</label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white focus:outline-none focus:border-primary"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-zinc-400 mb-1">Volume (CBM/m³)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.1"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white focus:outline-none focus:border-primary"
                    value={formData.volume || ''}
                    onChange={(e) => setFormData({...formData, volume: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full mt-6 bg-primary hover:bg-primary/80 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center glow-border uppercase tracking-widest"
              >
                Hitung Estimasi
                <ArrowRight size={18} className="ml-2" />
              </button>
            </form>
          </div>

          <div>
             <AnimatePresence>
                {result !== null && (
                   <motion.div 
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="bg-primary/10 p-8 rounded-2xl border border-primary/30 h-full flex flex-col justify-center text-center relative overflow-hidden"
                   >
                     <div className="absolute top-0 left-0 w-full h-1 bg-primary glow-border" />
                     <Anchor size={48} className="mx-auto text-primary mb-6 opacity-80" />
                     <h3 className="text-xl font-bold mb-2">Estimasi Biaya</h3>
                     <p className="text-3xl sm:text-4xl font-bold font-mono text-white mb-2 shadow-neon-text">
                        Rp {result.toLocaleString('id-ID')}
                     </p>
                     <p className="text-zinc-400 text-sm mb-6">
                        *Harga sewaktu-waktu dapat berubah tergantung cuaca dan ketersediaan kapal.
                     </p>
                     
                     <Link 
                        href="/login" 
                        className="inline-block py-3 px-6 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 uppercase tracking-widest text-sm"
                     >
                        Pesan Sekarang (Login)
                     </Link>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
