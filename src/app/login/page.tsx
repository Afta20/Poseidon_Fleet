"use client"
import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (data.success) {
        if (data.role === 'ADMIN') {
           router.push('/admin');
        } else if (data.role === 'MONITORING') {
           router.push('/dashboard');
        } else {
           router.push('/customer');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center pt-20 selection:bg-primary/50 font-mono relative">
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-mono uppercase tracking-widest">Back to Port</span>
      </Link>
      {/* Top Header */}
      <div className="flex flex-col items-center mb-8">
        <Image src="/favico.png" alt="Poseidon Fleet Logo" width={64} height={64} className="mb-4 opacity-80" />
        <h1 className="text-3xl font-sans font-bold tracking-widest text-[#f4f4f5]">
          POSEIDON<span className="text-primary ml-2">FLEET</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-2 tracking-[0.3em]">
          FLEET MANAGEMENT SYSTEM
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#121217] border border-white/5 rounded-xl p-8 shadow-2xl relative">
        <h2 className="text-xl font-mono text-zinc-200 mb-8 tracking-wide">Access Terminal</h2>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username */}
          <div>
            <label className="text-xs text-zinc-400 tracking-wider mb-2 block font-sans">Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1a21] border border-white/5 rounded-lg py-3 pl-10 pr-4 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="ftghjk@yhbjnk"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-zinc-400 tracking-wider mb-2 block font-sans">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a21] border border-white/5 rounded-lg py-3 pl-10 pr-4 text-zinc-300 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between mt-2 font-sans">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className="w-4 h-4 rounded border border-white/10 bg-[#1a1a21] group-hover:border-primary/50 flex items-center justify-center transition-colors">
                 {/* Visual only checkbox for match */}
              </div>
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-xs text-primary/80 hover:text-primary transition-colors">
              Forgot Password?
            </a>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#9f54ff] hover:bg-[#b06fff] text-white font-sans font-bold py-3 pt-4 pb-3 rounded-lg mt-6 tracking-widest transition-colors shadow-[0_0_15px_rgba(159,84,255,0.2)] disabled:opacity-70 text-sm"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>

        {/* Footer info line inside card */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center flex flex-col space-y-1">
          <span className="text-[10px] text-zinc-600 tracking-widest uppercase">Secure Connection Established</span>
          <span className="text-[10px] text-zinc-700 tracking-widest">v2.1.4 • Node: PRIME-AUTH-01</span>
        </div>
      </div>
    </main>
  );
}
