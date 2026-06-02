import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Megamenu } from '@/components/layout/Megamenu';

export default function PaymentFailedPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
        
        <div className="bg-[#121217] rounded-2xl border border-red-500/30 p-8 shadow-[0_0_40px_rgba(239,68,68,0.15)] text-center relative overflow-hidden w-full max-w-md">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={48} className="text-red-500" />
            </div>

            <h1 className="text-2xl font-bold font-sans mb-3 text-white">Pembayaran Belum Ditemukan</h1>
            <p className="text-zinc-400 text-sm font-mono leading-relaxed mb-8">
              Sistem kami tidak dapat menemukan riwayat pembayaran untuk transaksi ini. 
              Pastikan Anda sudah melakukan transfer/scan QRIS sesuai dengan nominal tagihan.
            </p>

            <div className="space-y-3">
              <button 
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition-all uppercase tracking-widest text-sm"
              >
                <RefreshCw size={16} /> CEK ULANG PEMBAYARAN
              </button>
              
              <Link 
                href="/customer"
                className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all uppercase tracking-widest text-sm"
              >
                <ArrowLeft size={16} /> KEMBALI KE DASHBOARD
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-zinc-600 font-mono text-center">
          Jika Anda sudah membayar namun tetap muncul pesan ini, harap hubungi CS Poseidon Fleet.
        </p>
      </div>
    </main>
  );
}
