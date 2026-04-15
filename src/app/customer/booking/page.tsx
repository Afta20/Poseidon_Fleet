"use client"
import React, { useState } from 'react';
import { Megamenu } from '@/components/layout/Megamenu';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    origin: '',
    destination: '',
    type: 'LCL',
    weight: '',
    volume: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          weight: Number(formData.weight),
          volume: formData.volume ? Number(formData.volume) : null,
        })
      });
      if (res.ok) {
        router.push('/customer');
        router.refresh();
      } else {
        alert('Gagal membuat pesanan pengiriman.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/customer" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Dashboard
        </Link>

        <div className="bg-[#121217] p-8 rounded-2xl border border-white/10 glow-border">
          <h1 className="text-3xl font-bold mb-2 font-sans tracking-wide">Formulir Pengiriman Barang</h1>
          <p className="text-zinc-400 mb-8 font-mono text-sm">Silakan lengkapi detail kargo atau muatan Anda. Order akan ditinjau oleh Admin kami.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-mono text-zinc-400 mb-1">Judul / Nama Barang</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-primary" placeholder="Misal: Paket Mesin Pabrik 2 Ton" />
               </div>
               <div>
                  <label className="block text-sm font-mono text-zinc-400 mb-1">Deskripsi Tambahan (Opsional)</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-primary" placeholder="Keterangan barang basah/kering, instruksi khusus, dll" rows={3} />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-mono text-zinc-400 mb-1">Asal Pelabuhan</label>
                     <input required type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-primary" placeholder="Misal: Jakarta" />
                  </div>
                  <div>
                     <label className="block text-sm font-mono text-zinc-400 mb-1">Tujuan Pelabuhan</label>
                     <input required type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-primary" placeholder="Misal: Surabaya" />
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4 mt-4">
                  <div>
                     <label className="block text-sm font-mono text-zinc-400 mb-1">Tipe Sewa</label>
                     <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-primary">
                        <option value="LCL">LCL</option>
                        <option value="FCL">FCL</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-mono text-zinc-400 mb-1">Berat (Kg)</label>
                     <input required type="number" min="1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-primary" placeholder="100" />
                  </div>
                  <div>
                     <label className="block text-sm font-mono text-zinc-400 mb-1">Volume (m³)</label>
                     <input type="number" step="0.1" min="0.1" value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-3 px-4 text-white focus:outline-none focus:border-primary" placeholder="1.5" />
                  </div>
               </div>
            </div>

            <button disabled={loading} type="submit" className="w-full mt-8 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-bold py-4 px-4 rounded-xl transition-colors flex items-center justify-center glow-border uppercase tracking-widest text-lg">
              {loading ? 'Mengirim...' : (
                <>
                  Ajukan Pengiriman <Send size={20} className="ml-3" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
