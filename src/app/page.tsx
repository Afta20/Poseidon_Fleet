"use client"
import React from 'react';
import { Megamenu } from '@/components/layout/Megamenu';
import { FleetList } from '@/components/dashboard/FleetList';
import { VesselMap } from '@/components/dashboard/VesselMapWrapper';
import { FuelChart } from '@/components/dashboard/FuelChart';
import { useVesselStream } from '@/hooks/useVesselStream';

export default function Home() {
  const { vessels, loading } = useVesselStream();

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden selection:bg-primary/50">
      <Megamenu />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Section: Map & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center shadow-neon-text">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2 glow-border"></span>
              Live Fleet Map
            </h2>
            <VesselMap vessels={vessels} />
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 shadow-neon-text">Analytics</h2>
            <FuelChart />
            <div className="bg-[#121217] rounded-xl p-4 border border-primary/20 glow-border">
               <h3 className="text-zinc-400 font-mono text-sm mb-2">NETWORK STATUS</h3>
               <div className="flex items-center justify-between font-mono">
                  <span>SAT-LINK</span>
                  <span className="text-green-400">ONLINE</span>
               </div>
               <div className="mt-3 text-xs text-zinc-500">
                  Transmitting over secure frequency 880Hz.
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Fleet Overview */}
        <div className="mt-8">
          <h2 className="text-xl font-bold px-6 shadow-neon-text">Active Vessels Overview</h2>
          <FleetList vessels={vessels} loading={loading} />
        </div>
      </div>
    </main>
  );
}
