"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Anchor } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!email) {
      errors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Format email tidak valid";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call for forgot password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Link reset password telah dikirim ke email Anda');
      setEmail('');
    } catch (e) {
      toast.error('Gagal mengirim link reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 selection:bg-primary/50 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo area */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#1a1a21] border border-white/5 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] group relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-colors" />
            <Anchor className="text-primary relative z-10" size={32} />
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white mb-2">Lupa Password</h1>
          <p className="text-sm text-zinc-500 font-sans max-w-xs">
            Masukkan email Anda dan kami akan mengirimkan instruksi untuk mereset password.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121217] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="text-xs text-zinc-400 tracking-wider mb-2 block font-sans">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => { setFormErrors(prev => ({...prev, email: ''})); setEmail(e.target.value); }}
                  className={`w-full bg-[#1a1a21] border rounded-lg py-3 pl-10 pr-4 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 transition-colors ${formErrors.email ? 'border-red-500/50 bg-red-500/5' : 'border-white/5'}`}
                  placeholder="admin@poseidon.com"
                  required
                />
              </div>
              {formErrors.email && <p className="text-[11px] text-red-400 mt-2 font-mono flex items-center gap-1.5 animate-in fade-in"><span className="w-1 h-1 rounded-full bg-red-500"></span>{formErrors.email}</p>}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-sans font-bold py-3 pt-4 pb-3 rounded-lg mt-6 tracking-widest transition-colors shadow-[0_0_15px_rgba(168,85,247,0.25)] disabled:opacity-70 text-sm"
            >
              {loading ? 'MENGIRIM...' : 'KIRIM LINK RESET'}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <Link href="/login" className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors font-sans group">
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
