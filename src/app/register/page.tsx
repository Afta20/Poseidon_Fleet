"use client"
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Ship } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Nama lengkap wajib diisi";
    if (!email.trim()) errors.email = "Email wajib diisi";
    if (!password) errors.password = "Password wajib diisi";
    else if (password.length < 6) errors.password = "Password minimal 6 karakter";
    
    if (!confirmPassword) errors.confirmPassword = "Konfirmasi password wajib diisi";
    else if (password !== confirmPassword) errors.confirmPassword = "Password dan konfirmasi tidak cocok";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessEmail(email); // simpan email sebelum di-clear
        setSuccess(true);
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Registrasi gagal');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center pt-16 selection:bg-primary/50 font-mono relative">
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-mono uppercase tracking-widest">Kembali ke Beranda</span>
      </Link>

      {/* Top Header */}
      <div className="flex flex-col items-center mb-8">
        <Image src="/favico.png" alt="Poseidon Fleet Logo" width={64} height={64} className="mb-4 opacity-80" />
        <h1 className="text-3xl font-sans font-bold tracking-widest text-[#f4f4f5]">
          POSEIDON<span className="text-primary ml-2">FLEET</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-2 tracking-[0.3em]">
          BUAT AKUN ANDA
        </p>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md bg-[#121217] border border-white/5 rounded-xl p-8 shadow-2xl relative">
        <h2 className="text-xl font-mono text-zinc-200 mb-2 tracking-wide">Terminal Pendaftaran</h2>
        <p className="text-zinc-500 text-xs mb-8 font-sans">Daftarkan akun untuk mulai mengirim kargo via Poseidon Fleet.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono">
            Error: {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
            <h3 className="text-green-400 font-bold mb-2">Registrasi Berhasil!</h3>
            <p className="text-green-500/80 text-sm">
              Tautan verifikasi telah dikirim ke <span className="text-white font-bold">{successEmail}</span>. 
              Silakan cek kotak masuk atau folder spam Anda untuk mengaktifkan akun sebelum login.
            </p>
          </div>
        )}

        <form onSubmit={handleRegister} noValidate className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs text-zinc-400 tracking-wider mb-2 block font-sans">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => { setFormErrors(prev => ({...prev, name: ''})); setName(e.target.value); }}
                className={`w-full bg-[#1a1a21] border rounded-lg py-3 pl-10 pr-4 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 transition-colors ${formErrors.name ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'}`}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>
            {formErrors.name && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-zinc-400 tracking-wider mb-2 block font-sans">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => { setFormErrors(prev => ({...prev, email: ''})); setEmail(e.target.value); }}
                className={`w-full bg-[#1a1a21] border rounded-lg py-3 pl-10 pr-4 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 transition-colors ${formErrors.email ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'}`}
                placeholder="contoh@email.com"
                required
              />
            </div>
            {formErrors.email && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-zinc-400 tracking-wider mb-2 block font-sans">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => { setFormErrors(prev => ({...prev, password: ''})); setPassword(e.target.value); }}
                className={`w-full bg-[#1a1a21] border rounded-lg py-3 pl-10 pr-4 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 transition-colors ${formErrors.password ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'}`}
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
            {formErrors.password && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs text-zinc-400 tracking-wider mb-2 block font-sans">Konfirmasi Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => { setFormErrors(prev => ({...prev, confirmPassword: ''})); setConfirmPassword(e.target.value); }}
                className={`w-full bg-[#1a1a21] border rounded-lg py-3 pl-10 pr-4 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 transition-colors ${formErrors.confirmPassword ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'}`}
                placeholder="Ulangi kata sandi"
                required
              />
            </div>
            {formErrors.confirmPassword && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.confirmPassword}</p>}
          </div>

          {/* Info */}
          <div className="flex items-start space-x-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <Ship size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              Akun yang didaftarkan akan otomatis menjadi akun <span className="text-primary font-bold">Customer</span>. Anda dapat langsung memesan pengiriman kargo setelah registrasi.
            </p>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#9f54ff] hover:bg-[#b06fff] text-white font-sans font-bold py-3 pt-4 pb-3 rounded-lg mt-4 tracking-widest transition-colors shadow-[0_0_15px_rgba(159,84,255,0.2)] disabled:opacity-70 text-sm uppercase"
          >
            {loading ? 'MEMBUAT AKUN...' : 'DAFTAR'}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-zinc-500 font-sans">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Login di sini
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center flex flex-col space-y-1">
          <span className="text-[10px] text-zinc-600 tracking-widest uppercase">Koneksi Aman Tersambung</span>
          <span className="text-[10px] text-zinc-700 tracking-widest">v2.1.4 • Node: PRIME-AUTH-01</span>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-16" />
    </main>
  );
}
