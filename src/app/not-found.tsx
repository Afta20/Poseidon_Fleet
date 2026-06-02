import Link from 'next/link';
import { Anchor, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Halaman Tidak Ditemukan | Poseidon Fleet',
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
          <Anchor size={40} className="text-primary" />
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 mb-4 tracking-tighter">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-bold font-sans mb-3 text-white">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-zinc-400 text-sm font-mono leading-relaxed mb-10">
          Kapal kami tidak dapat menemukan halaman yang Anda cari. 
          Mungkin halaman ini telah dipindahkan atau URL-nya salah.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] text-sm uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-16 text-[10px] text-zinc-700 font-mono uppercase tracking-widest">
          Error 404 • Poseidon Fleet Navigation System
        </p>
      </div>
    </main>
  );
}
