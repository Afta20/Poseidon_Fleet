"use client"
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, Anchor } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Sedang memverifikasi akun Anda...');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak valid atau tidak ditemukan.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        
        if (data.success) {
          setStatus('success');
          setMessage('Email berhasil diverifikasi! Akun Anda kini aktif.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verifikasi gagal.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Terjadi kesalahan saat memverifikasi akun.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="w-full max-w-md relative z-10 text-center">
      <div className="w-20 h-20 mx-auto bg-[#1a1a21] border border-white/5 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(168,85,247,0.15)] group relative">
        <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl group-hover:bg-primary/30 transition-colors" />
        <Anchor className="text-primary relative z-10" size={36} />
      </div>

      <div className="bg-[#121217] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
        
        {status === 'loading' && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2 font-sans tracking-tight">Memproses...</h2>
            <p className="text-zinc-400 text-sm">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="text-green-500" size={40} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-sans tracking-tight">Verifikasi Sukses</h2>
            <p className="text-zinc-400 text-sm mb-8">{message}</p>
            <Link 
              href="/login"
              className="w-full bg-primary hover:bg-primary/90 text-white font-sans font-bold py-3 pt-4 pb-3 rounded-lg tracking-widest transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] text-sm inline-block"
            >
              LANJUT KE LOGIN
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="text-red-500" size={40} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-sans tracking-tight">Verifikasi Gagal</h2>
            <p className="text-zinc-400 text-sm mb-8">{message}</p>
            <Link 
              href="/register"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-sans font-bold py-3 pt-4 pb-3 rounded-lg tracking-widest transition-colors shadow-lg text-sm inline-block"
            >
              KEMBALI KE REGISTRASI
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 selection:bg-primary/50 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <Suspense fallback={<div className="text-white text-sm font-mono animate-pulse">Memuat...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
