"use client"
import React from 'react';
import { Megamenu } from '@/components/layout/Megamenu';
import { Ship, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FleetList } from '@/components/dashboard/FleetList';
import { useVesselStream } from '@/hooks/useVesselStream';

export default function FleetPage() {
  const { vessels, loading } = useVesselStream();

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center space-x-4 mb-8 border-b border-white/10 pb-6">
            <Link href="/" className="p-2 rounded-full hover:bg-white/10 border border-white/10 glow-border group">
                <ArrowLeft size={16} className="text-primary" />
            </Link>
            <h1 className="text-3xl font-bold font-sans tracking-wide shadow-neon-text flex items-center">
                <Ship className="text-primary mr-3" size={28} />
                Global Fleet Master
            </h1>
        </div>
        <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-6">
           Modul khusus pangkalan armada. Komandan dapat melihat status operasional seluruh kapal yang terdaftar di sistem.
        </p>
        <FleetList vessels={vessels} loading={loading} />
      </div>
    </main>
  );
}
