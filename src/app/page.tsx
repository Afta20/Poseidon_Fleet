"use client"
import React, { useState } from 'react';
import { Megamenu } from '@/components/layout/Megamenu';
import { FleetList } from '@/components/dashboard/FleetList';
import { VesselMap } from '@/components/dashboard/VesselMapWrapper';
import { FuelChart } from '@/components/dashboard/FuelChart';
import { MaintenanceModule, CrewLogsModule } from '@/components/dashboard/AnalyticsModules';
import { useVesselStream } from '@/hooks/useVesselStream';

export default function Home() {
  const { vessels, loading } = useVesselStream();
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<string>('Regional View');
  const [analyticsMode, setAnalyticsMode] = useState<string>('Fuel Efficiency');

  const displayedVessels = vessels.filter(v => {
    if (!activeFilter || activeFilter === 'all') return true;
    return v.type.toLowerCase() === activeFilter.toLowerCase();
  });

  const handleMenuClick = (key: string, action: string) => {
    if (key === 'fleet') {
      setActiveFilter(action);
      setSelectedVesselId(null);
    } else if (key === 'map') {
      setMapMode(action);
    } else if (key === 'analytics') {
      if (action !== 'Fuel Efficiency' && action !== 'Maintenance' && action !== 'Crew Logs') {
         alert(`Fitur "${action}" masih tahap mockup!`);
      } else {
         setAnalyticsMode(action);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden selection:bg-primary/50">
      <Megamenu onMenuClick={handleMenuClick} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Section: Map & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center shadow-neon-text">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2 glow-border"></span>
              Live Fleet Map <span className="ml-2 text-sm font-mono text-zinc-500 uppercase">[{mapMode}]</span>
            </h2>
            <VesselMap vessels={displayedVessels} selectedVesselId={selectedVesselId} mapMode={mapMode} />
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 shadow-neon-text uppercase">{analyticsMode}</h2>
            {analyticsMode === 'Fuel Efficiency' && <FuelChart />}
            {analyticsMode === 'Maintenance' && <MaintenanceModule />}
            {analyticsMode === 'Crew Logs' && <CrewLogsModule />}
            
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
          <FleetList vessels={displayedVessels} loading={loading} onSelectVessel={setSelectedVesselId} selectedVesselId={selectedVesselId} />
        </div>
      </div>
    </main>
  );
}
