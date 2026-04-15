"use client"
import React, { useState, useEffect } from 'react';
import { Package, Ship, RefreshCw } from 'lucide-react';

export const BookingCrud = () => {
   const [shipments, setShipments] = useState<any[]>([]);
   const [vessels, setVessels] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const fetchData = async () => {
      setLoading(true);
      try {
         const [resS, resV] = await Promise.all([
            fetch('/api/shipments'),
            fetch('/api/vessels')
         ]);
         const dataS = await resS.json();
         const dataV = await resV.json();
         setShipments(dataS.shipments || []);
         setVessels(dataV.vessels || []);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
   }, []);

   const updateStatus = async (id: string, newStatus: string, vesselId?: string) => {
      try {
         await fetch(`/api/shipments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, vesselId })
         });
         fetchData();
      } catch (e) {
         console.error(e);
      }
   };

   if (loading) return <div className="p-8 text-center"><RefreshCw className="animate-spin inline-block mr-2" /> Loading data...</div>;

   return (
      <div className="space-y-6">
         <h2 className="text-2xl font-sans font-bold flex items-center mb-6">
            <Package className="mr-3 text-primary" />
            Manajemen Pesanan Kargo
         </h2>

         <div className="bg-[#121217] border border-white/10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <table className="w-full text-left text-sm">
               <thead className="bg-[#1a1a24] text-zinc-400 font-mono border-b border-white/10">
                  <tr>
                     <th className="px-6 py-4">Title / ID</th>
                     <th className="px-6 py-4">Customer</th>
                     <th className="px-6 py-4">Rute</th>
                     <th className="px-6 py-4">Detail</th>
                     <th className="px-6 py-4">Status & Armada</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/10">
                  {shipments.map(s => (
                     <tr key={s.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                           <p className="font-bold">{s.title}</p>
                           <p className="text-xs text-zinc-500 font-mono mt-1">{s.id}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-zinc-300">{s.customer?.name}</p>
                           <p className="text-xs text-zinc-500">{s.customer?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-zinc-300">{s.origin} &rarr;</p>
                           <p className="text-zinc-300">{s.destination}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-xs mr-2">{s.type}</span>
                           <span className="text-zinc-400">{s.weight} Kg</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col space-y-2">
                              {s.status === 'PENDING' ? (
                                 <div className="flex space-x-2">
                                    <button onClick={() => updateStatus(s.id, 'APPROVED')} className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded hover:bg-green-500/40">Approve</button>
                                    <button onClick={() => updateStatus(s.id, 'REJECTED')} className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded hover:bg-red-500/40">Reject</button>
                                 </div>
                              ) : (
                                 <>
                                    <span className={`text-xs px-2 py-1 rounded w-fit ${s.status === 'ARRIVED' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'}`}>{s.status}</span>
                                    
                                    {s.status !== 'REJECTED' && s.status !== 'ARRIVED' && (
                                       <select 
                                          className="text-xs bg-black border border-white/20 p-1 rounded text-white max-w-[150px]"
                                          onChange={(e) => updateStatus(s.id, s.status, e.target.value)}
                                          value={s.vesselId || ''}
                                       >
                                          <option value="">-- Assign Kapal --</option>
                                          {vessels.map(v => (
                                             <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                                          ))}
                                       </select>
                                    )}

                                    {s.status === 'APPROVED' && s.vesselId && (
                                       <button onClick={() => updateStatus(s.id, 'IN_TRANSIT')} className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded hover:bg-blue-500/40 w-fit">Set Ke Berangkat</button>
                                    )}
                                    {s.status === 'IN_TRANSIT' && (
                                       <button onClick={() => updateStatus(s.id, 'ARRIVED')} className="text-xs bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-1 rounded hover:bg-green-500/40 w-fit">Tandai Sampai</button>
                                    )}
                                 </>
                              )}
                           </div>
                        </td>
                     </tr>
                  ))}
                  {shipments.length === 0 && (
                     <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Belum ada data pesanan.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
   );
}
