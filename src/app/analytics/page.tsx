"use client"
import React from 'react';
import { Megamenu } from '@/components/layout/Megamenu';
import { BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FuelChart } from '@/components/dashboard/FuelChart';

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center space-x-4 mb-8 border-b border-white/10 pb-6">
            <Link href="/" className="p-2 rounded-full hover:bg-white/10 border border-white/10 glow-border group">
                <ArrowLeft size={16} className="text-primary" />
            </Link>
            <h1 className="text-3xl font-bold font-sans tracking-wide shadow-neon-text flex items-center">
                <BarChart3 className="text-primary mr-3" size={28} />
                Vessel Analytics Engine
            </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-[#121217] rounded-xl border border-primary/20 glow-border p-6 text-center h-full flex flex-col justify-center items-center">
              <h2 className="text-xl font-bold text-white mb-2">Fleet Fuel Consumption</h2>
              <p className="text-zinc-500 font-mono text-sm mb-6">Historical Data over 24H</p>
              <div className="w-full">
                 <FuelChart />
              </div>
           </div>
           <div className="bg-[#121217] rounded-xl border border-primary/20 glow-border p-6 shadow-md shadow-primary/10">
               <h2 className="text-lg font-bold shadow-neon-text mb-4">Command Notifications</h2>
               <div className="space-y-4">
                  <div className="p-3 bg-white/5 font-mono text-xs text-zinc-300 rounded border border-white/10">
                     [08:00Z] Maintenance scheduled for Prime Alpha cooling system.
                  </div>
                  <div className="p-3 bg-red-500/10 font-mono text-xs text-red-400 rounded border border-red-500/20">
                     [09:15Z] ALERT: Neptune Horizon lost sat-link signal momentarily.
                  </div>
                  <div className="p-3 bg-green-500/10 font-mono text-xs text-green-400 rounded border border-green-500/20">
                     [12:30Z] UPDATE: Core engine stabilized on all vessels.
                  </div>
               </div>
           </div>
        </div>
      </div>
    </main>
  );
}
