"use client"
import React, { useState, useMemo } from 'react';
import { Megamenu } from '@/components/layout/Megamenu';
import { Calculator, ArrowRight, Ship, MapPin, Weight, Zap, Package, ChevronRight, TrendingUp, Search, Anchor, ChevronDown, ChevronUp } from 'lucide-react';
import { PORT_DATABASE } from '@/lib/ports';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Pricing Engine ────────────────────────────────────────────────────
const DELIVERY_OPTS = [
  { value: 'BIASA', label: 'Reguler', desc: '7–14 hari kerja', multiplier: 1.0, color: 'border-zinc-700 text-zinc-300 bg-zinc-800/40', activeColor: 'border-zinc-400 bg-zinc-700/60 text-white' },
  { value: 'CEPAT', label: 'Express', desc: '3–5 hari kerja', multiplier: 1.5, color: 'border-amber-800/40 text-amber-400/70 bg-amber-900/10', activeColor: 'border-amber-500 bg-amber-900/30 text-amber-300' },
  { value: 'VVIP',  label: 'Priority', desc: '1–2 hari kerja', multiplier: 2.5, color: 'border-purple-800/40 text-purple-400/70 bg-purple-900/10', activeColor: 'border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(168,85,247,0.2)]' },
];

const CARGO_TYPES = [
  { value: 'LCL', label: 'LCL', sub: 'Less than Container Load', base: 1_500_000 },
  { value: 'FCL', label: 'FCL', sub: 'Full Container Load', base: 8_000_000 },
];

function calcCost(weight: number, type: string, delivery: string): number {
  if (!weight || weight <= 0) return 0;
  const cargoBase = CARGO_TYPES.find(c => c.value === type)?.base ?? 1_500_000;
  const weightCost = weight * 6_500;
  const multiplier = DELIVERY_OPTS.find(d => d.value === delivery)?.multiplier ?? 1;
  return Math.round((cargoBase + weightCost) * multiplier);
}

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

const BREAKDOWN_ITEMS = (weight: number, type: string, delivery: string) => {
  const cargoBase = CARGO_TYPES.find(c => c.value === type)?.base ?? 1_500_000;
  const weightCost = weight * 6_500;
  const subtotal = cargoBase + Math.max(weightCost, 0);
  const multiplier = DELIVERY_OPTS.find(d => d.value === delivery)?.multiplier ?? 1;
  return [
    { label: 'Base Tarif ' + type, value: cargoBase },
    { label: `Biaya Berat (${weight.toLocaleString('id-ID')} kg × Rp 6.500)`, value: weightCost },
    { label: 'Sub-total', value: subtotal, bold: true },
    { label: `Multiplier Layanan ×${multiplier}`, value: null, note: `×${multiplier}` },
    { label: 'TOTAL ESTIMASI', value: Math.round(subtotal * multiplier), highlight: true },
  ];
};

const inputCls = "w-full bg-[#0d0d12] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary/60 transition-all placeholder:text-zinc-700";

export default function CalculatorPage() {
  const [form, setForm] = useState({ origin: '', destination: '', type: 'LCL', delivery: 'BIASA', weight: '', volume: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [calculated, setCalculated] = useState(false);

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setCalculated(false); };

  const [showPorts, setShowPorts] = useState(false);
  const [portSearch, setPortSearch] = useState('');
  const [portTarget, setPortTarget] = useState<'origin' | 'destination'>('origin');

  const filteredPorts = useMemo(() => {
    if (!portSearch) return PORT_DATABASE;
    const q = portSearch.toLowerCase();
    return PORT_DATABASE.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      p.alias.some(a => a.includes(q))
    );
  }, [portSearch]);

  const pickPort = (portName: string) => {
    set(portTarget, portName);
    setShowPorts(false);
    setPortSearch('');
  };

  const result = useMemo(() => calcCost(Number(form.weight), form.type, form.delivery), [form.weight, form.type, form.delivery]);
  const breakdown = useMemo(() => BREAKDOWN_ITEMS(Number(form.weight), form.type, form.delivery), [form.weight, form.type, form.delivery]);

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!form.origin.trim()) errors.origin = "Pelabuhan asal wajib diisi";
    if (!form.destination.trim()) errors.destination = "Pelabuhan tujuan wajib diisi";
    if (!form.weight) errors.weight = "Berat muatan wajib diisi";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setCalculated(false);
      return;
    }

    setCalculated(true);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden">
      <Megamenu />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.08),transparent)]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/4 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-blue-600/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-xs font-mono text-primary uppercase tracking-widest mb-6">
            <Calculator size={11} /> Kalkulator Biaya Logistik
          </motion.div>

          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl font-bold font-sans tracking-tight mb-4">
            Hitung Biaya
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-blue-400">
              Pengiriman Kargo
            </span>
          </motion.h1>

          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-zinc-500 text-lg max-w-xl mx-auto">
            Estimasi biaya logistik maritime secara instan. Transparan & akurat untuk muatan FCL/LCL.
          </motion.p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── Form (3/5) ── */}
          <div className="lg:col-span-3">
            <form onSubmit={handleCalc} noValidate className="space-y-5">

              {/* Route */}
              <div className="bg-[#121217] rounded-2xl border border-white/8 p-6 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <MapPin size={12} className="text-primary" /> Rute Pengiriman
                  </h2>
                  <button type="button" onClick={() => setShowPorts(p => !p)}
                    className="flex items-center gap-1.5 text-[10px] font-mono text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-all">
                    <Anchor size={10} />
                    {showPorts ? 'Sembunyikan' : 'Lihat Pelabuhan'}
                    {showPorts ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">Asal</label>
                    <div className="relative">
                      <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                      <input required type="text" className={`${inputCls} pl-9 ${formErrors.origin ? 'border-red-500/50 bg-red-500/5' : ''}`} placeholder="Tanjung Priok, Jakarta"
                        value={form.origin} onChange={e => { setFormErrors(prev => ({...prev, origin: ''})); set('origin', e.target.value); }}
                        onFocus={() => { setPortTarget('origin'); setShowPorts(true); }} />
                    </div>
                    {formErrors.origin && <p className="text-[11px] text-red-400 mt-1 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.origin}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">Tujuan</label>
                    <div className="relative">
                      <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                      <input required type="text" className={`${inputCls} pl-9 ${formErrors.destination ? 'border-red-500/50 bg-red-500/5' : ''}`} placeholder="Tanjung Perak, Surabaya"
                        value={form.destination} onChange={e => { setFormErrors(prev => ({...prev, destination: ''})); set('destination', e.target.value); }}
                        onFocus={() => { setPortTarget('destination'); setShowPorts(true); }} />
                    </div>
                    {formErrors.destination && <p className="text-[11px] text-red-400 mt-1 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.destination}</p>}
                  </div>
                </div>

                {/* Port Picker Panel */}
                {showPorts && (
                  <div className="border border-primary/20 bg-black/40 rounded-xl p-4 space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                        Pilih untuk: <span className={portTarget === 'origin' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                          {portTarget === 'origin' ? '🟢 Asal' : '🔴 Tujuan'}
                        </span>
                      </span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setPortTarget('origin')}
                          className={`text-[10px] font-mono px-2 py-1 rounded transition-all ${portTarget === 'origin' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-white/5 text-zinc-500 hover:text-zinc-300'}`}>
                          Asal
                        </button>
                        <button type="button" onClick={() => setPortTarget('destination')}
                          className={`text-[10px] font-mono px-2 py-1 rounded transition-all ${portTarget === 'destination' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/5 text-zinc-500 hover:text-zinc-300'}`}>
                          Tujuan
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-white text-xs placeholder:text-zinc-700 focus:outline-none focus:border-primary/40 transition-colors"
                        placeholder="Cari nama pelabuhan, kota, atau wilayah..."
                        value={portSearch} onChange={e => setPortSearch(e.target.value)} />
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                      {filteredPorts.map(port => (
                        <button key={port.name} type="button" onClick={() => pickPort(port.name)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-primary/10 hover:border-primary/30 border border-transparent text-left transition-all group">
                          <div className="flex items-center gap-2 min-w-0">
                            <Ship size={11} className="text-zinc-600 group-hover:text-primary shrink-0 transition-colors" />
                            <div className="min-w-0">
                              <span className="text-xs text-zinc-300 group-hover:text-white font-medium transition-colors truncate block">{port.name}</span>
                              <span className="text-[10px] text-zinc-600 font-mono">{port.region}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono shrink-0 ml-2 px-1.5 py-0.5 rounded ${
                            portTarget === 'origin' ? 'text-green-500 bg-green-500/10' : 'text-red-400 bg-red-500/10'
                          }`}>+ {portTarget === 'origin' ? 'Asal' : 'Tujuan'}</span>
                        </button>
                      ))}
                      {filteredPorts.length === 0 && (
                        <p className="text-center text-zinc-600 text-[10px] py-4 font-mono">Pelabuhan tidak ditemukan.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cargo Type */}
              <div className="bg-[#121217] rounded-2xl border border-white/8 p-6">
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
                  <Package size={12} className="text-primary" /> Tipe Kargo
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {CARGO_TYPES.map(ct => (
                    <button key={ct.value} type="button" onClick={() => set('type', ct.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        form.type === ct.value
                          ? 'border-primary/60 bg-primary/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                          : 'border-white/8 bg-black/30 hover:border-white/15'
                      }`}>
                      <div className={`font-mono font-bold text-sm mb-1 ${form.type === ct.value ? 'text-primary' : 'text-zinc-300'}`}>{ct.label}</div>
                      <div className="text-[10px] text-zinc-600">{ct.sub}</div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-2">Base: {formatRp(ct.base)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight & Volume */}
              <div className="bg-[#121217] rounded-2xl border border-white/8 p-6">
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
                  <Weight size={12} className="text-primary" /> Detail Muatan
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">Berat (Kg) *</label>
                    <div className="relative">
                      <input required type="number" min="1" className={`${inputCls} pr-10 ${formErrors.weight ? 'border-red-500/50 bg-red-500/5' : ''}`}
                        placeholder="5000" value={form.weight} onChange={e => { setFormErrors(prev => ({...prev, weight: ''})); set('weight', e.target.value); }} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-700 font-mono">Kg</span>
                    </div>
                    {formErrors.weight && <p className="text-[11px] text-red-400 mt-1 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.weight}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">Volume (m³)</label>
                    <div className="relative">
                      <input type="number" step="0.1" min="0" className={inputCls + " pr-10"}
                        placeholder="1.5" value={form.volume} onChange={e => set('volume', e.target.value)} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-700 font-mono">m³</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Speed */}
              <div className="bg-[#121217] rounded-2xl border border-white/8 p-6">
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-4">
                  <Zap size={12} className="text-primary" /> Kecepatan Layanan
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {DELIVERY_OPTS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => set('delivery', opt.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        form.delivery === opt.value ? opt.activeColor : opt.color
                      }`}>
                      <Zap size={13} className="mb-2 opacity-70" />
                      <div className="font-bold text-sm">{opt.label}</div>
                      <div className="text-[10px] mt-1 opacity-60 font-mono">{opt.desc}</div>
                      <div className="text-[10px] mt-1.5 font-mono opacity-70">×{opt.multiplier}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit"
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:shadow-[0_0_35px_rgba(168,85,247,0.4)] transition-all">
                <Calculator size={16} /> Hitung Estimasi Biaya <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* ── Result Panel (2/5) ── */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 space-y-4">
              <AnimatePresence mode="wait">
                {calculated && result > 0 ? (
                  <motion.div key="result"
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="relative bg-[#121217] rounded-2xl border border-primary/30 overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.12)]">

                    {/* Glow bar */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-widest mb-5">
                        <TrendingUp size={12} /> Hasil Kalkulasi
                      </div>

                      {/* Main cost display */}
                      <div className="text-center mb-6 py-4 bg-primary/5 rounded-xl border border-primary/15">
                        <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">Estimasi Total</div>
                        <div className="text-4xl font-bold font-mono text-white">
                          {formatRp(result)}
                        </div>
                        <div className="text-[10px] text-zinc-600 mt-2">*Harga final ditentukan Admin</div>
                      </div>

                      {/* Route summary */}
                      <div className="flex items-center gap-2 text-sm mb-5 bg-black/30 rounded-xl px-4 py-3">
                        <MapPin size={12} className="text-green-500 shrink-0" />
                        <span className="text-zinc-400 truncate">{form.origin}</span>
                        <ChevronRight size={12} className="text-zinc-700 shrink-0" />
                        <MapPin size={12} className="text-red-400 shrink-0" />
                        <span className="text-zinc-400 truncate">{form.destination}</span>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3">Rincian Biaya</div>
                        {breakdown.map((row, i) => (
                          row.value !== null ? (
                            <div key={i} className={`flex justify-between text-xs py-1.5 ${row.highlight ? 'border-t border-primary/20 mt-2 pt-3' : ''}`}>
                              <span className={row.highlight ? 'text-primary font-bold font-mono' : row.bold ? 'text-zinc-300 font-medium' : 'text-zinc-600 font-mono'}>
                                {row.label}
                              </span>
                              <span className={row.highlight ? 'text-white font-bold font-mono' : row.bold ? 'text-zinc-200 font-mono' : 'text-zinc-400 font-mono'}>
                                {formatRp(row.value)}
                              </span>
                            </div>
                          ) : (
                            <div key={i} className="flex justify-between text-xs py-1">
                              <span className="text-zinc-600 font-mono">{row.label}</span>
                              <span className="text-amber-400 font-mono font-bold">{row.note}</span>
                            </div>
                          )
                        ))}
                      </div>

                      {/* CTA */}
                      <Link href="/customer/booking"
                        className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-zinc-100 text-black font-bold rounded-xl text-sm uppercase tracking-widest transition-colors">
                        Pesan Sekarang <Ship size={14} />
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-[#121217] rounded-2xl border border-white/8 p-8 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-5">
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-zinc-800 animate-spin" style={{ animationDuration: '8s' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calculator size={28} className="text-zinc-700" />
                      </div>
                    </div>
                    <h3 className="text-zinc-500 font-bold mb-2">Siap Menghitung</h3>
                    <p className="text-zinc-700 text-xs font-mono leading-relaxed">
                      Isi form di sebelah kiri dan tekan<br />
                      <span className="text-primary">"Hitung Estimasi Biaya"</span>
                    </p>

                    <div className="mt-6 space-y-3 text-left">
                      {[['LCL', 'Base Rp 1.500.000'], ['FCL', 'Base Rp 8.000.000'], ['Per Kg', 'Rp 6.500 / Kg']].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs bg-black/40 rounded-lg px-3 py-2">
                          <span className="text-zinc-600 font-mono">{k}</span>
                          <span className="text-zinc-400 font-mono">{v}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info box */}
              <div className="bg-[#0d0d12] rounded-2xl border border-white/5 p-5 space-y-3">
                <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Catatan Penting</h4>
                {[
                  'Estimasi bersifat indikatif, harga final ditetapkan Admin.',
                  'Biaya belum termasuk asuransi & handling fee.',
                  'Harga dapat berubah sesuai kondisi laut & cuaca.',
                ].map((note, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-primary text-xs mt-0.5 shrink-0">•</span>
                    <span className="text-zinc-600 text-xs leading-relaxed">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
