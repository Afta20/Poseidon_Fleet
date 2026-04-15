import React from 'react';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { Ship, Package, Plus, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Megamenu } from '@/components/layout/Megamenu';

export default async function CustomerDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;

  const shipments = await db.shipment.findMany({
    where: { customerId: (session as any).id },
    orderBy: { createdAt: 'desc' },
    include: { vessel: true }
  });

  const activeShipments = shipments.filter((s: any) => s.status !== 'ARRIVED' && s.status !== 'REJECTED');
  const pastShipments = shipments.filter((s: any) => s.status === 'ARRIVED' || s.status === 'REJECTED');

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
           <div>
             <h1 className="text-3xl font-bold font-sans tracking-wide shadow-neon-text">Halo, {(session as any).name}</h1>
             <p className="text-zinc-400 mt-2">Selamat datang di Panel Manajemen Muatan Anda.</p>
           </div>
           <Link 
             href="/customer/booking" 
             className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-transform hover:scale-105 glow-border"
           >
             <Plus size={18} className="mr-2" />
             Pesan Pengiriman (Booking)
           </Link>
        </div>

        <h2 className="text-xl font-bold mb-6 flex items-center border-b border-white/10 pb-4">
           <Package className="mr-2 text-primary" size={20} />
           Muatan Aktif ({activeShipments.length})
        </h2>

        {activeShipments.length === 0 ? (
           <div className="text-center py-16 border border-white/10 border-dashed rounded-2xl mb-12">
              <Package size={48} className="mx-auto text-zinc-600 mb-4" />
              <p className="text-zinc-500 font-mono">Belum ada muatan aktif saat ini.</p>
           </div>
        ) : (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {activeShipments.map((shipment: any) => (
                 <Link href={`/track/${shipment.id}`} key={shipment.id} className="block group">
                    <div className="bg-[#121217] border border-white/10 group-hover:border-primary/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all p-6 rounded-2xl h-full flex flex-col">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-lg">{shipment.title}</h3>
                          <span className="text-[10px] font-bold font-mono tracking-widest uppercase px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded">
                             {shipment.status}
                          </span>
                       </div>
                       <div className="space-y-3 flex-grow text-sm text-zinc-400">
                          <div className="flex items-center">
                             <MapPin size={14} className="mr-2 text-zinc-500" />
                             <span className="truncate">{shipment.origin} → {shipment.destination}</span>
                          </div>
                          <div className="flex items-center">
                             <Ship size={14} className="mr-2 text-zinc-500" />
                             <span className="truncate">{shipment.vessel?.name || 'Menunggu Armada'}</span>
                          </div>
                       </div>
                       <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">RESI: {shipment.id.split('-')[0]}</span>
                          <span className="text-primary group-hover:underline">Lacak →</span>
                       </div>
                    </div>
                 </Link>
              ))}
           </div>
        )}

        {/* History */}
        {pastShipments.length > 0 && (
           <>
              <h2 className="text-xl font-bold mb-6 flex items-center border-b border-white/10 pb-4">
                 <Ship className="mr-2 text-zinc-500" size={20} />
                 Riwayat Pengiriman ({pastShipments.length})
              </h2>
              <div className="bg-[#121217] border border-white/10 rounded-2xl overflow-hidden">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 font-mono text-zinc-400">
                       <tr>
                          <th className="px-6 py-4">Paket / Resi</th>
                          <th className="px-6 py-4">Rute</th>
                          <th className="px-6 py-4">Tipe</th>
                          <th className="px-6 py-4">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                       {pastShipments.map((s: any) => (
                          <tr key={s.id} className="hover:bg-white/5 transition-colors">
                             <td className="px-6 py-4">
                                <p className="font-bold">{s.title}</p>
                                <p className="text-xs text-zinc-500 font-mono">{s.id}</p>
                             </td>
                             <td className="px-6 py-4 text-zinc-300">{s.origin} → {s.destination}</td>
                             <td className="px-6 py-4 text-zinc-300">{s.type}</td>
                             <td className="px-6 py-4">
                                <span className={`text-xs px-2 py-1 rounded ${s.status === 'ARRIVED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                   {s.status}
                                </span>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </>
        )}
      </div>
    </main>
  );
}
