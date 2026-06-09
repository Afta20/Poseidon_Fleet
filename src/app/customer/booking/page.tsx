"use client"
import React, { useState, useMemo } from 'react';
import { Megamenu } from '@/components/layout/Megamenu';
import { ArrowLeft, Send, Package, MapPin, User, Phone, Weight, Zap, Ship, Calculator, Anchor, Search, ChevronDown, ChevronUp, Banknote, CreditCard, Wallet, Navigation, Info, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PORT_DATABASE } from '@/lib/ports';
import { getHaversineDistance, resolvePortCoords, getDistanceMultiplier, getRouteDescription } from '@/lib/navigation';

// ─── Pricing logic (distance-aware) ─────────────────────────────────
const DELIVERY_MULTIPLIERS: Record<string, number> = {
  BIASA: 1.0,
  CEPAT: 1.5,
  VVIP: 2.5,
};

const PAYMENT_FEES: Record<string, { label: string; fee: number }> = {
  TRANSFER_BANK: { label: 'Transfer Bank (VA)', fee: 0 },
  E_WALLET: { label: 'QRIS / E-Wallet', fee: 2500 },
  COD: { label: 'Cash on Port', fee: 5000 },
};

interface PricingBreakdown {
  baseCost: number;
  weightCost: number;
  distanceCost: number;
  distanceMultiplierValue: number;
  distanceMultiplierLabel: string;
  deliveryMultiplier: number;
  paymentFee: number;
  subtotal: number;
  total: number;
  distanceKm: number;
}

function calcAdvancedCost(
  weight: number,
  type: string,
  deliveryType: string,
  origin: string,
  destination: string,
  paymentMethod: string
): PricingBreakdown {
  const baseCost = type === 'FCL' ? 8_000_000 : 1_500_000;
  const weightCost = weight > 0 ? weight * 6_500 : 0;

  // Distance calculation
  const originCoords = resolvePortCoords(origin);
  const destCoords = resolvePortCoords(destination);
  let distanceKm = 0;
  if (originCoords && destCoords) {
    distanceKm = getHaversineDistance(originCoords, destCoords);
  }
  const distanceCost = distanceKm * 2_500;
  const { multiplier: distanceMultiplierValue, label: distanceMultiplierLabel } = getDistanceMultiplier(distanceKm);

  const deliveryMultiplier = DELIVERY_MULTIPLIERS[deliveryType] ?? 1;
  const paymentFee = PAYMENT_FEES[paymentMethod]?.fee ?? 0;

  const subtotal = (baseCost + weightCost + distanceCost) * distanceMultiplierValue;
  const total = Math.round(subtotal * deliveryMultiplier + paymentFee);

  return {
    baseCost,
    weightCost,
    distanceCost,
    distanceMultiplierValue,
    distanceMultiplierLabel,
    deliveryMultiplier,
    paymentFee,
    subtotal,
    total,
    distanceKm,
  };
}

const DELIVERY_OPTS = [
  { value: 'BIASA', label: 'Reguler', icon: Ship },
  { value: 'CEPAT', label: 'Express', icon: Zap },
  { value: 'VVIP', label: 'Priority', icon: Zap },
];

// Dynamic delivery time estimation based on distance
function getDeliveryTime(deliveryType: string, distanceKm: number): string {
  if (distanceKm <= 0) {
    return deliveryType === 'BIASA' ? '7–14 hari' : deliveryType === 'CEPAT' ? '3–5 hari' : '1–2 hari';
  }
  // avg cargo speed ~37 km/h = 888 km/day
  const baseDays = Math.max(1, Math.ceil(distanceKm / 888));
  if (deliveryType === 'BIASA') return `${baseDays + 3}–${baseDays + 7} hari`;
  if (deliveryType === 'CEPAT') return `${baseDays + 1}–${baseDays + 3} hari`;
  return `${baseDays}–${baseDays + 1} hari`;
}

export default function BookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPorts, setShowPorts] = useState(false);
  const [portSearch, setPortSearch] = useState('');
  const [portTarget, setPortTarget] = useState<'origin' | 'destination'>('origin');
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    senderName: '',
    receiverName: '',
    phone: '',
    origin: '',
    destination: '',
    type: 'LCL',
    deliveryType: 'BIASA',
    weight: '',
    volume: '',
    paymentMethod: 'TRANSFER_BANK',
  });

  const set = (key: string, val: string) => setFormData(p => ({ ...p, [key]: val }));

  const pricing = useMemo(() => {
    const w = Number(formData.weight);
    return calcAdvancedCost(w, formData.type, formData.deliveryType, formData.origin, formData.destination, formData.paymentMethod);
  }, [formData.weight, formData.type, formData.deliveryType, formData.origin, formData.destination, formData.paymentMethod]);

  const routeDescription = useMemo(() => {
    if (!formData.origin || !formData.destination || pricing.distanceKm <= 0) return null;
    return getRouteDescription(formData.origin, formData.destination, pricing.distanceKm);
  }, [formData.origin, formData.destination, pricing.distanceKm]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Custom validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = "Nama/Judul Barang wajib diisi";
    if (!formData.weight || Number(formData.weight) <= 0) errors.weight = "Berat muatan wajib diisi";
    if (!formData.origin) errors.origin = "Pilih pelabuhan asal";
    if (!formData.destination) errors.destination = "Pilih pelabuhan tujuan";
    if (!formData.senderName.trim()) errors.senderName = "Nama pengirim wajib diisi";
    if (!formData.receiverName.trim()) errors.receiverName = "Nama penerima wajib diisi";
    const phoneRegex = /^[0-9+\-\s]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) errors.phone = "Masukkan nomor telepon valid (10-15 digit angka)";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to top or just let user see red borders
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          weight: Number(formData.weight),
          volume: formData.volume ? Number(formData.volume) : null,
          cost: pricing.total > 0 ? pricing.total : null,
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (formData.paymentMethod === 'TRANSFER_BANK' || formData.paymentMethod === 'E_WALLET') {
           router.push(`/customer/payment/${data.shipment.id}`);
        } else {
           router.push('/customer');
        }
        router.refresh();
      } else {
        toast.error('Gagal membuat pesanan pengiriman.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary/60 focus:bg-black/60 transition-all placeholder:text-zinc-600";
  const labelCls = "block text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2";

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Back */}
        <Link href="/customer" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors text-sm group">
          <ArrowLeft size={15} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Package size={18} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-sans tracking-tight">Formulir Pengiriman Kargo</h1>
          </div>
          <p className="text-zinc-500 text-sm font-mono ml-13 pl-13">Isi detail pengiriman & dapatkan estimasi biaya secara langsung.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── FORM ─── */}
          <form onSubmit={handleSubmit} noValidate className="lg:col-span-2 space-y-6">

            {/* Section 1: Barang */}
            <div className="bg-[#121217] rounded-2xl border border-white/8 p-6 space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-5">
                <Package size={14} className="text-primary" /> Detail Barang
              </h2>

              <div>
                <label className={labelCls}>Nama / Judul Barang *</label>
                <input required type="text" className={`${inputCls} ${formErrors.title ? 'border-red-500/50 bg-red-500/5' : ''}`} value={formData.title}
                  onChange={e => { setFormErrors(prev => ({...prev, title: ''})); set('title', e.target.value); }}
                  placeholder="Misal: Mesin Pabrik Industri 3 Ton" />
                {formErrors.title && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.title}</p>}
              </div>

              <div>
                <label className={labelCls}>Deskripsi (Opsional)</label>
                <textarea className={inputCls + " resize-none"} rows={3} value={formData.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Keterangan barang, instruksi khusus, kondisi muatan, dll." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Berat Muatan (Kg) *</label>
                  <div className="relative">
                    <input required type="number" min="1" className={`${inputCls} pr-12 ${formErrors.weight ? 'border-red-500/50 bg-red-500/5' : ''}`} value={formData.weight}
                      onChange={e => { setFormErrors(prev => ({...prev, weight: ''})); set('weight', e.target.value); }} placeholder="5000" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600 font-mono">Kg</span>
                  </div>
                  {formErrors.weight && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.weight}</p>}
                </div>
                <div>
                  <label className={labelCls}>Volume (m³)</label>
                  <div className="relative">
                    <input type="number" step="0.1" min="0" className={inputCls + " pr-12"} value={formData.volume}
                      onChange={e => set('volume', e.target.value)} placeholder="1.5" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600 font-mono">m³</span>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Tipe Kontainer *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['LCL', 'FCL'].map(t => (
                    <button key={t} type="button"
                      onClick={() => set('type', t)}
                      className={`p-3 rounded-xl border text-sm font-bold text-left transition-all ${
                        formData.type === t
                          ? 'border-primary/60 bg-primary/10 text-primary'
                          : 'border-white/8 bg-black/30 text-zinc-400 hover:border-white/20'
                      }`}>
                      <div className="font-mono">{t}</div>
                      <div className="text-[10px] font-normal text-zinc-500 mt-0.5">
                        {t === 'LCL' ? 'Less than Container Load' : 'Full Container Load'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Rute */}
            <div className="bg-[#121217] rounded-2xl border border-white/8 p-6 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <MapPin size={14} className="text-primary" /> Rute Pengiriman
                </h2>
                <button type="button" onClick={() => setShowPorts(p => !p)}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-all">
                  <Anchor size={11} />
                  {showPorts ? 'Sembunyikan' : 'Lihat Pelabuhan'}
                  {showPorts ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Pelabuhan Asal *</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                    <input required type="text" className={`${inputCls} pl-9 ${formErrors.origin ? 'border-red-500/50 bg-red-500/5' : ''}`} value={formData.origin}
                      onChange={e => { setFormErrors(prev => ({...prev, origin: ''})); set('origin', e.target.value); }} placeholder="Tanjung Priok, Jakarta"
                      onFocus={() => { setPortTarget('origin'); setShowPorts(true); }} />
                  </div>
                  {formErrors.origin && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.origin}</p>}
                </div>
                <div>
                  <label className={labelCls}>Pelabuhan Tujuan *</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                    <input required type="text" className={`${inputCls} pl-9 ${formErrors.destination ? 'border-red-500/50 bg-red-500/5' : ''}`} value={formData.destination}
                      onChange={e => { setFormErrors(prev => ({...prev, destination: ''})); set('destination', e.target.value); }} placeholder="Tanjung Perak, Surabaya"
                      onFocus={() => { setPortTarget('destination'); setShowPorts(true); }} />
                  </div>
                  {formErrors.destination && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.destination}</p>}
                </div>
              </div>

              {/* Port Picker Panel */}
              {showPorts && (
                <div className="border border-primary/20 bg-black/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
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

                  {/* Search */}
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="text" className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-white text-xs placeholder:text-zinc-700 focus:outline-none focus:border-primary/40 transition-colors"
                      placeholder="Cari nama pelabuhan, kota, atau wilayah..."
                      value={portSearch} onChange={e => setPortSearch(e.target.value)} />
                  </div>

                  {/* Port list */}
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
                      <p className="text-center text-zinc-600 text-xs py-4 font-mono">Pelabuhan tidak ditemukan.</p>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-700 font-mono text-center border-t border-white/5 pt-2">
                    {PORT_DATABASE.length} pelabuhan tersedia • Klik untuk mengisi otomatis
                  </p>
                </div>
              )}
            </div>


            {/* Section 3: Layanan */}
            <div className="bg-[#121217] rounded-2xl border border-white/8 p-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-5">
                <Zap size={14} className="text-primary" /> Kecepatan Layanan
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {DELIVERY_OPTS.map(opt => {
                  const Icon = opt.icon;
                  const active = formData.deliveryType === opt.value;
                  const dynamicDesc = getDeliveryTime(opt.value, pricing.distanceKm);
                  const multiplier = DELIVERY_MULTIPLIERS[opt.value];
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => set('deliveryType', opt.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-primary/60 bg-primary/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                          : 'border-white/8 bg-black/30 hover:border-white/20'
                      }`}>
                      <Icon size={16} className={active ? 'text-primary mb-2' : 'text-zinc-600 mb-2'} />
                      <div className={`text-sm font-bold ${active ? 'text-white' : 'text-zinc-400'}`}>{opt.label}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5 font-mono">{dynamicDesc}</div>
                      {multiplier > 1 && (
                        <div className="text-[9px] text-amber-500/80 font-mono mt-1">×{multiplier} tarif</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Kontak */}
            <div className="bg-[#121217] rounded-2xl border border-white/8 p-6 space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-5">
                <User size={14} className="text-primary" /> Informasi Pengirim & Penerima
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nama Pengirim *</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input required type="text" className={`${inputCls} pl-9 ${formErrors.senderName ? 'border-red-500/50 bg-red-500/5' : ''}`} value={formData.senderName}
                      onChange={e => { setFormErrors(prev => ({...prev, senderName: ''})); set('senderName', e.target.value); }} placeholder="Budi Santoso" />
                  </div>
                  {formErrors.senderName && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.senderName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Nama Penerima *</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input required type="text" className={`${inputCls} pl-9 ${formErrors.receiverName ? 'border-red-500/50 bg-red-500/5' : ''}`} value={formData.receiverName}
                      onChange={e => { setFormErrors(prev => ({...prev, receiverName: ''})); set('receiverName', e.target.value); }} placeholder="Andi Wijaya" />
                  </div>
                  {formErrors.receiverName && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.receiverName}</p>}
                </div>
              </div>

              <div>
                <label className={labelCls}>No. Telepon Kontak *</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    required 
                    type="tel" 
                    pattern="[0-9+\-\s]{10,15}" 
                    minLength={10} 
                    maxLength={15} 
                    className={`${inputCls} pl-9 ${formErrors.phone ? 'border-red-500/50 bg-red-500/5' : ''}`} 
                    value={formData.phone}
                    onChange={e => {
                      setFormErrors(prev => ({...prev, phone: ''}));
                      set('phone', e.target.value.replace(/[^0-9+\-\s]/g, ''));
                    }} 
                    placeholder="08123456789" 
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                    {formErrors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Section 5: Metode Pembayaran */}
            <div className="bg-[#121217] rounded-2xl border border-white/8 p-6 space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-5">
                <Banknote size={14} className="text-primary" /> Metode Pembayaran
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'TRANSFER_BANK', label: 'Transfer Bank', desc: 'Virtual Account', icon: CreditCard },
                  { value: 'E_WALLET', label: 'QRIS / E-Wallet', desc: 'OVO, GoPay, Dana', icon: Wallet },
                  { value: 'COD', label: 'Bayar di Pelabuhan', desc: 'Cash on Port (COD)', icon: Banknote },
                ].map(opt => {
                  const Icon = opt.icon;
                  const active = formData.paymentMethod === opt.value;
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => set('paymentMethod', opt.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-primary/60 bg-primary/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                          : 'border-white/8 bg-black/30 hover:border-white/20'
                      }`}>
                      <Icon size={16} className={active ? 'text-primary mb-2' : 'text-zinc-600 mb-2'} />
                      <div className={`text-sm font-bold ${active ? 'text-white' : 'text-zinc-400'}`}>{opt.label}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5 font-mono">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button disabled={loading} type="submit"
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mengirim...</>
              ) : (
                <>Ajukan Pengiriman <Send size={16} /></>
              )}
            </button>
          </form>

          {/* ─── SIDEBAR: Cost Preview ─── */}
          <div className="space-y-4">
            {/* Route Visualization Stepper */}
            {formData.origin && formData.destination && pricing.distanceKm > 0 && (
              <div className="bg-[#121217] rounded-2xl border border-white/8 p-5">
                <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                  <Navigation size={13} className="text-primary" /> Rute Pelayaran
                </h3>
                <div className="flex items-center gap-3">
                  {/* Origin */}
                  <div className="flex flex-col items-center text-center min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center mb-1.5 shadow-[0_0_12px_rgba(34,197,94,0.2)]">
                      <MapPin size={14} className="text-green-400" />
                    </div>
                    <span className="text-[10px] text-green-400 font-mono font-bold leading-tight truncate w-full">{formData.origin}</span>
                  </div>

                  {/* Connection Line with Distance */}
                  <div className="flex-1 flex flex-col items-center gap-1 min-w-[80px]">
                    <div className="w-full h-px bg-gradient-to-r from-green-500/60 via-primary/40 to-red-500/60" />
                    <div className="flex items-center gap-1">
                      <Ship size={10} className="text-primary" />
                      <span className="text-[10px] font-mono font-bold text-primary">{pricing.distanceKm.toLocaleString('id-ID')} km</span>
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-green-500/60 via-primary/40 to-red-500/60" />
                  </div>

                  {/* Destination */}
                  <div className="flex flex-col items-center text-center min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center mb-1.5 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                      <MapPin size={14} className="text-red-400" />
                    </div>
                    <span className="text-[10px] text-red-400 font-mono font-bold leading-tight truncate w-full">{formData.destination}</span>
                  </div>
                </div>

                {/* Dynamic Route Description */}
                {routeDescription && (
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/15 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Info size={12} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{routeDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cost Preview */}
            <div className="bg-[#121217] rounded-2xl border border-white/8 p-6 sticky top-20">
              <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
                <Calculator size={13} className="text-primary" /> Estimasi Biaya
              </h3>

              {pricing.total > 0 ? (
                <>
                  <div className="text-center py-4">
                    <div className="text-xs text-zinc-600 font-mono mb-1 uppercase tracking-widest">Total Estimasi</div>
                    <div className="text-3xl font-bold font-mono text-white leading-tight">
                      Rp {pricing.total.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-2">*Harga final ditentukan oleh Admin</div>
                  </div>

                  {/* Detailed Pricing Breakdown */}
                  <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                    {[
                      { label: `Biaya Dasar (${formData.type})`, value: `Rp ${pricing.baseCost.toLocaleString('id-ID')}` },
                      { label: `Biaya Berat (${formData.weight || 0} Kg)`, value: `Rp ${pricing.weightCost.toLocaleString('id-ID')}` },
                      ...(pricing.distanceKm > 0 ? [
                        { label: `Biaya Jarak (${pricing.distanceKm.toLocaleString('id-ID')} km)`, value: `Rp ${pricing.distanceCost.toLocaleString('id-ID')}` },
                        { label: pricing.distanceMultiplierLabel, value: `×${pricing.distanceMultiplierValue}` },
                      ] : []),
                      { label: `Layanan ${DELIVERY_OPTS.find(d => d.value === formData.deliveryType)?.label}`, value: `×${pricing.deliveryMultiplier}` },
                      ...(pricing.paymentFee > 0 ? [
                        { label: `Biaya ${PAYMENT_FEES[formData.paymentMethod]?.label}`, value: `+Rp ${pricing.paymentFee.toLocaleString('id-ID')}` },
                      ] : []),
                    ].map(row => (
                      <div key={row.label} className="flex justify-between text-xs">
                        <span className="text-zinc-600 font-mono">{row.label}</span>
                        <span className="text-zinc-300 font-mono font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <Weight size={32} className="mx-auto text-zinc-800 mb-3" />
                  <p className="text-zinc-600 text-xs font-mono">Isi berat muatan & pilih rute<br />untuk melihat estimasi</p>
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="bg-[#0d0d12] rounded-2xl border border-white/5 p-5 space-y-3">
              <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Alur Pemesanan</h4>
              {[
                ['1', 'Isi & kirim formulir ini'],
                ['2', 'Admin tinjau & setujui'],
                ['3', 'Armada kapal di-assign'],
                ['4', 'Kargo mulai berlayar'],
              ].map(([n, t]) => (
                <div key={n} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">{n}</div>
                  <span className="text-xs text-zinc-500">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
