"use client"
import React from 'react';
import { Megamenu } from '@/components/layout/Megamenu';
import { Map, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { VesselMap } from '@/components/dashboard/VesselMapWrapper';
import { useVesselStream } from '@/hooks/useVesselStream';

export default function MapPage() {
  const { vessels } = useVesselStream();

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center space-x-4 mb-8 border-b border-white/10 pb-6">
            <Link href="/" className="p-2 rounded-full hover:bg-white/10 border border-white/10 glow-border group">
                <ArrowLeft size={16} className="text-primary" />
            </Link>
            <h1 className="text-3xl font-bold font-sans tracking-wide shadow-neon-text flex items-center">
                <Map className="text-primary mr-3" size={28} />
                Satellite Tracking GPS
            </h1>
        </div>
        <div className="w-full h-[600px] bg-[#121217] rounded-xl border border-primary/20 p-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <VesselMap vessels={vessels} />
        </div>
      </div>
    </main>
  );
}
