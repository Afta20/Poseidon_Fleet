'use client';

import React, { useState } from 'react';
import { QrCode, Banknote, ShieldCheck, Copy, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentClient({ shipment }: { shipment: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isQris = shipment.paymentMethod === 'E_WALLET';
  const amount = shipment.cost ? shipment.cost.toLocaleString('id-ID') : '0';

  const handleCopy = () => {
    navigator.clipboard.writeText('88392019382103');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setLoading(true);
    // Simulasi loading 2 detik sebelum redirect kembali ke dashboard
    setTimeout(() => {
      router.push('/customer');
      router.refresh();
    }, 2000);
  };

  return (
    <div className="bg-[#121217] rounded-2xl border border-white/10 p-6 md:p-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <h1 className="text-2xl font-bold font-sans mb-2">Selesaikan Pembayaran Anda</h1>
        <p className="text-zinc-400 text-sm font-mono">Resi: <span className="text-primary font-bold">{shipment.id}</span></p>
      </div>

      <div className="bg-[#0a0a0c] rounded-xl border border-white/5 p-6 mb-8 text-center relative z-10">
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">Total Tagihan</p>
        <p className="text-4xl font-bold text-emerald-400 font-mono tracking-tight mb-2">
          Rp {amount}
        </p>
        <p className="text-xs text-zinc-400">Mohon bayar sesuai nominal di atas (tanpa pembulatan).</p>
      </div>

      {isQris ? (
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center mb-4 p-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <QrCode size={160} className="text-black" />
          </div>
          <p className="text-sm text-zinc-300 mb-1 font-bold">Scan QRIS</p>
          <p className="text-xs text-zinc-500">Buka aplikasi e-Wallet atau M-Banking Anda untuk scan</p>
        </div>
      ) : (
        <div className="bg-[#0a0a0c] rounded-xl border border-white/5 p-6 mb-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Banknote size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="font-bold">Transfer Bank (Virtual Account)</p>
              <p className="text-xs text-zinc-500">Bank Mandiri / BCA / BNI / BRI</p>
            </div>
          </div>
          
          <div className="bg-[#121217] rounded-lg p-4 flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Nomor Rekening / VA</p>
              <p className="text-xl font-bold font-mono tracking-widest text-white">8839 2019 3821 03</p>
              <p className="text-xs text-zinc-400 mt-1">a.n. PT Poseidon Fleet Indonesia</p>
            </div>
            <button 
              onClick={handleCopy}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-zinc-400" />}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4 relative z-10">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> MENCARI PEMBAYARAN...</>
          ) : (
            <><ShieldCheck size={16} /> SAYA SUDAH BAYAR</>
          )}
        </button>
        
        <div className="text-center">
          <Link href="/customer" className="text-xs text-zinc-500 hover:text-white transition-colors underline underline-offset-4">
            Bayar Nanti (Kembali ke Dashboard)
          </Link>
        </div>
      </div>
    </div>
  );
}
