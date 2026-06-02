'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center animate-pulse">
          <AlertTriangle size={40} className="text-red-500" />
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-black font-mono text-red-500 mb-4 tracking-tighter">
          ERROR
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-bold font-sans mb-3 text-white">
          Terjadi Kesalahan Sistem
        </h2>
        <p className="text-zinc-400 text-sm font-mono leading-relaxed mb-4">
          Sistem kami mengalami gangguan yang tidak terduga. 
          Tim teknis telah diberitahu dan sedang memperbaiki masalah ini.
        </p>

        {/* Error Detail */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-10 text-left">
          <p className="text-[10px] text-red-400/60 font-mono uppercase tracking-widest mb-1">Detail Error</p>
          <p className="text-xs text-red-300 font-mono break-all">
            {error.message || 'Unknown error occurred'}
          </p>
          {error.digest && (
            <p className="text-[10px] text-zinc-600 font-mono mt-2">Digest: {error.digest}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] text-sm uppercase tracking-widest"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all text-sm uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-16 text-[10px] text-zinc-700 font-mono uppercase tracking-widest">
          Runtime Error • Poseidon Fleet System
        </p>
      </div>
    </main>
  );
}
