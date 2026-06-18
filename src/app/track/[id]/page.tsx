import React, { Suspense } from 'react';
import { db } from '@/lib/db';
import { Package, Ship, AlertTriangle, ArrowLeft, MapPin, Weight, Navigation, Banknote, Zap } from 'lucide-react';
import Link from 'next/link';
import { Megamenu } from '@/components/layout/Megamenu';
import { TrackingProgress } from '@/components/tracking/TrackingProgress';
import { TrackingMapWrapper } from '@/components/tracking/TrackingMapWrapper';

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
      vessel: {
        include: {
          logs: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          }
        }
      },
      events: {
        orderBy: { timestamp: 'desc' }
      }
    }
  });

  // Get vessel latest coordinates
  const vesselLog = shipment?.vessel?.logs?.[0] || null;

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link href="/customer" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Kembali
        </Link>
        
        {!shipment ? (
          <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
            <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Resi Tidak Ditemukan</h1>
            <p className="text-zinc-400">Nomor resi {id} tidak terdaftar di sistem kami.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Card */}
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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 py-6 border-y border-white/10 mb-6">
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold flex items-center">
                    <MapPin size={10} className="mr-1" /> Asal
                  </p>
                  <p className="font-semibold">{shipment.origin}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold flex items-center">
                    <Navigation size={10} className="mr-1" /> Tujuan
                  </p>
                  <p className="font-semibold">{shipment.destination}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold flex items-center">
                    <Weight size={10} className="mr-1" /> Berat / Vol
                  </p>
                  <p className="font-semibold">{shipment.weight} Kg / {shipment.volume ?? '-'} m³</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold">Armada Kapal</p>
                  <p className="font-semibold flex items-center">
                    <Ship size={14} className="mr-2 text-primary" />
                    {shipment.vessel?.name || 'Menunggu Assign'}
                  </p>
                  {shipment.vessel && (
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{shipment.vessel.type}</p>
                  )}
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold flex items-center">
                    <Zap size={10} className="mr-1" /> Layanan
                  </p>
                  <p className="font-semibold">
                    {(shipment as any).deliveryType === 'VVIP' ? '⚡ Priority' :
                     (shipment as any).deliveryType === 'CEPAT' ? '🚀 Express' : '📦 Reguler'}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold flex items-center">
                    <Banknote size={10} className="mr-1" /> Biaya Pengiriman
                  </p>
                  {(shipment as any).cost ? (
                    <p className="font-bold text-lg text-emerald-400 font-mono">
                      Rp {((shipment as any).cost as number).toLocaleString('id-ID')}
                    </p>
                  ) : (
                    <p className="font-semibold text-zinc-500 text-sm italic">Menunggu konfirmasi admin</p>
                  )}
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold flex items-center">
                    <Banknote size={10} className="mr-1" /> Metode Bayar
                  </p>
                  <p className="font-semibold text-sm">
                    {(shipment as any).paymentMethod === 'TRANSFER_BANK' ? '🏦 Transfer Bank' :
                     (shipment as any).paymentMethod === 'E_WALLET' ? '📱 QRIS / E-Wallet' : '💵 COD (Pelabuhan)'}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1 uppercase tracking-widest font-bold flex items-center">
                    💰 Status Bayar
                  </p>
                  <span className={`inline-flex items-center text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border mt-0.5 ${(shipment as any).paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                    {(shipment as any).paymentStatus === 'PAID' ? '✓ LUNAS' : '✗ BELUM DIBAYAR'}
                  </span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <TrackingProgress status={shipment.status} />
            </div>

            {/* Live Map Section */}
            {shipment.status !== 'REJECTED' && (
              <div className="border border-white/10 rounded-2xl bg-[#121217] p-8">
                <h2 className="text-lg font-bold mb-4 tracking-wide flex items-center">
                  <MapPin size={18} className="mr-2 text-primary" />
                  Peta Pelacakan Live
                  {shipment.status === 'IN_TRANSIT' && (
                    <span className="ml-3 inline-flex items-center text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </h2>
                <p className="text-zinc-500 text-xs font-mono mb-4">
                  Menampilkan rute pengiriman dari <span className="text-green-400">{shipment.origin}</span> ke <span className="text-red-400">{shipment.destination}</span>
                  {shipment.vessel && <> • Kapal: <span className="text-primary">{shipment.vessel.name}</span></>}
                </p>
                <TrackingMapWrapper
                  origin={shipment.origin}
                  destination={shipment.destination}
                  vesselName={shipment.vessel?.name || null}
                  vesselType={shipment.vessel?.type || null}
                  vesselLat={vesselLog?.lat || null}
                  vesselLng={vesselLog?.lng || null}
                  status={shipment.status}
                  shipmentId={shipment.id}
                />
              </div>
            )}

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
