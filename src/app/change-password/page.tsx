"use client"
import React, { useState } from 'react';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = "Password saat ini wajib diisi";
    if (!newPassword) errors.newPassword = "Password baru wajib diisi";
    else if (newPassword.length < 6) errors.newPassword = "Password baru minimal 6 karakter";
    
    if (!confirmPassword) errors.confirmPassword = "Konfirmasi password wajib diisi";
    else if (newPassword !== confirmPassword) errors.confirmPassword = "Password baru dan konfirmasi tidak cocok";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Gagal mengubah password');
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center pt-20 selection:bg-primary/50 font-mono relative">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-mono uppercase tracking-widest">Kembali</span>
      </Link>

      <div className="flex flex-col items-center mb-8">
        <Image src="/favico.png" alt="Poseidon Fleet Logo" width={64} height={64} className="mb-4 opacity-80" />
        <h1 className="text-3xl font-sans font-bold tracking-widest text-[#f4f4f5]">
          POSEIDON<span className="text-primary ml-2">FLEET</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-2 tracking-[0.3em]">
          CHANGE PASSWORD
        </p>
      </div>

      <div className="w-full max-w-md bg-[#121217] border border-white/5 rounded-xl p-8 shadow-2xl">
        <h2 className="text-xl font-mono text-zinc-200 mb-2 tracking-wide">Security Terminal</h2>
        <p className="text-zinc-500 text-xs mb-8 font-sans">Ubah password akun Anda untuk keamanan.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono flex items-center">
            <AlertCircle size={14} className="mr-2 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs font-mono flex items-center">
            <CheckCircle2 size={14} className="mr-2 shrink-0" />
            Password berhasil diubah!
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="text-xs text-zinc-400 tracking-wider mb-2 block font-sans">Password Saat Ini</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => { setFormErrors(prev => ({...prev, currentPassword: ''})); setCurrentPassword(e.target.value); }}
                className={`w-full bg-[#1a1a21] border rounded-lg py-3 pl-10 pr-4 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 transition-colors ${formErrors.currentPassword ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'}`}
                placeholder="Masukkan password saat ini"
                required
              />
            </div>
            {formErrors.currentPassword && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.currentPassword}</p>}
          </div>

          <div>
            <label className="text-xs text-zinc-400 tracking-wider mb-2 block font-sans">Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => { setFormErrors(prev => ({...prev, newPassword: ''})); setNewPassword(e.target.value); }}
                className={`w-full bg-[#1a1a21] border rounded-lg py-3 pl-10 pr-4 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 transition-colors ${formErrors.newPassword ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'}`}
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
            {formErrors.newPassword && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.newPassword}</p>}
          </div>

          <div>
            <label className="text-xs text-zinc-400 tracking-wider mb-2 block font-sans">Konfirmasi Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => { setFormErrors(prev => ({...prev, confirmPassword: ''})); setConfirmPassword(e.target.value); }}
                className={`w-full bg-[#1a1a21] border rounded-lg py-3 pl-10 pr-4 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 transition-colors ${formErrors.confirmPassword ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'}`}
                placeholder="Ulangi password baru"
                required
              />
            </div>
            {formErrors.confirmPassword && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.confirmPassword}</p>}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#9f54ff] hover:bg-[#b06fff] text-white font-sans font-bold py-3 rounded-lg mt-4 tracking-widest transition-colors shadow-[0_0_15px_rgba(159,84,255,0.2)] disabled:opacity-70 text-sm uppercase"
          >
            {loading ? 'UPDATING...' : 'UBAH PASSWORD'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col space-y-1">
          <span className="text-[10px] text-zinc-600 tracking-widest uppercase">Secure Connection Established</span>
          <span className="text-[10px] text-zinc-700 tracking-widest">v2.1.4 • Node: PRIME-AUTH-01</span>
        </div>
      </div>
    </main>
  );
}
