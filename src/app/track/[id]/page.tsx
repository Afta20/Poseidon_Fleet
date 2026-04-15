import React from 'react';
import { db } from '@/lib/db';
import { Package, Ship, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Megamenu } from '@/components/layout/Megamenu';
import { TrackingProgress } from '@/components/tracking/TrackingProgress';

const statusMap: Record<string, { label: string, step: number }> = {
  PENDING: { label: 'Menunggu Konfirmasi', step: 1 },
  APPROVED: { label: 'Dikonfirmasi', step: 2 },
  IN_TRANSIT: { label: 'Dalam Perjalanan Laut', step: 3 },
  ARRIVED: { label: 'Tiba di Tujuan', step: 4 },
  REJECTED: { label: 'Ditolak/Dibatalkan', step: 0 }
};

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipment = await db.shipment.findUnique({
    where: { id },
    include: {
      vessel: true,
      events: {
        orderBy: { timestamp: 'desc' }
      }
    }
  });

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke Beranda
        </Link>
        
        {!shipment ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
            <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Resi Tidak Ditemukan</h1>
            <p className="text-zinc-400">Nomor resi {id} tidak terdaftar di sistem kami.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="border border-white/10 rounded-2xl bg-[#121217] p-8 glow-border">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold flex items-center mb-1">
                    <Package className="mr-3 text-primary" />
                    {shipment.title}
                  </h1>
                  <p className="font-mono text-zinc-400 text-sm">RESI: {shipment.id}</p>
                </div>
                <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full font-bold text-sm tracking-widest uppercase">
                  {statusMap[shipment.status]?.label || shipment.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/10 mb-6">
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold">Asal</p>
                  <p className="font-semibold">{shipment.origin}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold">Tujuan</p>
                  <p className="font-semibold">{shipment.destination}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold">Berat / Vol</p>
                  <p className="font-semibold">{shipment.weight} Kg / {shipment.volume || '-'} m³</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold">Armada Kapal</p>
                  <p className="font-semibold flex items-center">
                    <Ship size={14} className="mr-2 text-primary" />
                    {shipment.vessel?.name || 'Menunggu Assign'}
                  </p>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <TrackingProgress status={shipment.status} />
            </div>

            {/* Tracking History */}
            <div className="border border-white/10 rounded-2xl bg-[#121217] p-8">
              <h2 className="text-lg font-bold mb-6 tracking-wide flex items-center">
                History Perjalanan
              </h2>
              {shipment.events.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">Belum ada pembaruan logistik.</p>
              ) : (
                <div className="relative border-l-2 border-white/10 ml-3 pl-8 space-y-6">
                  {shipment.events.map((event: any) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[41px] top-1 w-4 h-4 bg-primary rounded-full border-4 border-[#121217]" />
                      <div className="mb-1 text-xs text-primary font-mono bg-primary/10 inline-block px-2 py-1 rounded">
                        {new Date(event.timestamp).toLocaleString('id-ID')}
                      </div>
                      <h3 className="font-bold text-white text-lg">{event.status} - {event.location}</h3>
                      {event.description && <p className="text-zinc-400 mt-1">{event.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
