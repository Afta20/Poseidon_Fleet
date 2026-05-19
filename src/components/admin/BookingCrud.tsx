"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Package, Ship, MapPin, User, Weight, ArrowRight, Check, X, Anchor, Navigation } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

const ITEMS_PER_PAGE = 5;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
   PENDING: { label: 'Menunggu', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
   APPROVED: { label: 'Disetujui', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
   IN_TRANSIT: { label: 'Berlayar', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
   ARRIVED: { label: 'Tiba', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
   REJECTED: { label: 'Ditolak', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export const BookingCrud = () => {
   const [shipments, setShipments] = useState<any[]>([]);
   const [vessels, setVessels] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const [expandedId, setExpandedId] = useState<string | null>(null);

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

   useEffect(() => { fetchData(); }, []);

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

   const filteredShipments = shipments.filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
         s.title?.toLowerCase().includes(q) ||
         s.id?.toLowerCase().includes(q) ||
         s.customer?.name?.toLowerCase().includes(q) ||
         s.customer?.email?.toLowerCase().includes(q) ||
         s.origin?.toLowerCase().includes(q) ||
         s.destination?.toLowerCase().includes(q) ||
         s.status?.toLowerCase().includes(q)
      );
   });

   const totalPages = Math.ceil(filteredShipments.length / ITEMS_PER_PAGE);
   const paginatedShipments = filteredShipments.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
   );

   const handleSearchChange = useCallback((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
   }, []);

   const getVesselName = (vesselId: string) => {
      const v = vessels.find(v => v.id === vesselId);
      return v ? `${v.name} (${v.type})` : null;
   };

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
               <h2 className="text-2xl font-sans font-bold flex items-center">
                  <Package className="mr-3 text-primary" />
                  Manajemen Pesanan Kargo
               </h2>
               <p className="text-zinc-500 text-sm mt-1">Kelola pesanan, assign armada, dan pantau pengiriman.</p>
            </div>
            <SearchInput
               value={searchQuery}
               onChange={handleSearchChange}
               placeholder="Cari berdasarkan nama, resi, rute..."
            />
         </div>

         {/* Content */}
         {loading ? (
            <TableSkeleton rows={5} columns={5} />
         ) : paginatedShipments.length === 0 ? (
            <div className="text-center py-16 border border-white/10 border-dashed rounded-2xl">
               <Package size={48} className="mx-auto text-zinc-700 mb-4" />
               <p className="text-zinc-500 font-mono">
                  {searchQuery ? `Tidak ditemukan untuk "${searchQuery}"` : 'Belum ada pesanan kargo.'}
               </p>
            </div>
         ) : (
            <div className="space-y-3">
               {paginatedShipments.map(s => {
                  const statusCfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.PENDING;
                  const isExpanded = expandedId === s.id;
                  const vesselAssigned = s.vesselId ? getVesselName(s.vesselId) : null;

                  return (
                     <div
                        key={s.id}
                        className={`bg-[#121217] border rounded-xl overflow-hidden transition-all duration-200 ${
                           isExpanded ? 'border-primary/40 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-white/10 hover:border-white/20'
                        }`}
                     >
                        {/* Main Row */}
                        <div
                           className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                           onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        >
                           {/* Status Badge */}
                           <div className={`shrink-0 w-2 h-12 rounded-full ${statusCfg.bg} ${s.status === 'IN_TRANSIT' ? 'animate-pulse' : ''}`}
                              style={{ backgroundColor: statusCfg.color.includes('amber') ? 'rgba(251,191,36,0.4)' : statusCfg.color.includes('blue') ? 'rgba(96,165,250,0.4)' : statusCfg.color.includes('cyan') ? 'rgba(34,211,238,0.4)' : statusCfg.color.includes('green') ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)' }}
                           />

                           {/* Title & ID */}
                           <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-white truncate">{s.title}</h3>
                              <p className="text-[10px] text-zinc-600 font-mono mt-0.5 truncate">RESI: {s.id}</p>
                           </div>

                           {/* Route */}
                           <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400 shrink-0">
                              <MapPin size={12} className="text-green-500" />
                              <span className="truncate max-w-[100px]">{s.origin}</span>
                              <ArrowRight size={12} className="text-zinc-600" />
                              <span className="truncate max-w-[100px]">{s.destination}</span>
                           </div>

                           {/* Customer */}
                           <div className="hidden lg:flex items-center gap-2 shrink-0">
                              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                 <User size={12} className="text-primary" />
                              </div>
                              <span className="text-sm text-zinc-300 truncate max-w-[100px]">{s.customer?.name}</span>
                           </div>

                           {/* Status */}
                           <span className={`shrink-0 text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}>
                              {statusCfg.label}
                           </span>
                        </div>

                        {/* Expanded Detail Panel */}
                        {isExpanded && (
                           <div className="border-t border-white/5 bg-black/20">
                              {/* Info Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
                                 <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Customer</p>
                                    <p className="text-sm text-white font-medium">{s.customer?.name}</p>
                                    <p className="text-xs text-zinc-500">{s.customer?.email}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Rute</p>
                                    <p className="text-sm text-white">{s.origin}</p>
                                    <p className="text-xs text-zinc-500">→ {s.destination}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Detail Muatan</p>
                                    <p className="text-sm text-white flex items-center gap-1"><Weight size={12} className="text-zinc-500" /> {s.weight} Kg</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Tipe: {s.type}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Armada</p>
                                    {vesselAssigned ? (
                                       <p className="text-sm text-emerald-400 flex items-center gap-1 font-medium">
                                          <Ship size={12} /> {vesselAssigned}
                                       </p>
                                    ) : (
                                       <p className="text-sm text-zinc-500 italic">Belum di-assign</p>
                                    )}
                                 </div>
                              </div>

                              {/* Action Bar */}
                              <div className="px-5 pb-5">
                                 <div className="bg-[#0d0d12] rounded-xl border border-white/5 p-4">
                                    {s.status === 'PENDING' && (
                                       <div>
                                          <p className="text-xs text-zinc-500 mb-3 font-mono uppercase tracking-widest">⏳ Konfirmasi Pesanan</p>
                                          <div className="flex gap-3">
                                             <button
                                                onClick={() => updateStatus(s.id, 'APPROVED')}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                                             >
                                                <Check size={14} /> Approve
                                             </button>
                                             <button
                                                onClick={() => updateStatus(s.id, 'REJECTED')}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                                             >
                                                <X size={14} /> Reject
                                             </button>
                                          </div>
                                       </div>
                                    )}

                                    {s.status === 'APPROVED' && (
                                       <div>
                                          <p className="text-xs text-zinc-500 mb-3 font-mono uppercase tracking-widest">
                                             <Ship size={12} className="inline mr-1" /> Assign Armada Kapal
                                          </p>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                                             {vessels.map(v => (
                                                <button
                                                   key={v.id}
                                                   onClick={() => updateStatus(s.id, s.status, v.id)}
                                                   className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all ${
                                                      s.vesselId === v.id
                                                         ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                                                         : 'bg-black/30 border-white/5 text-zinc-400 hover:border-primary/30 hover:text-white'
                                                   }`}
                                                >
                                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                      s.vesselId === v.id ? 'bg-primary/20' : 'bg-zinc-800'
                                                   }`}>
                                                      <Ship size={14} className={s.vesselId === v.id ? 'text-primary' : 'text-zinc-500'} />
                                                   </div>
                                                   <div className="min-w-0">
                                                      <p className="font-medium truncate">{v.name}</p>
                                                      <p className="text-[10px] text-zinc-600 font-mono">{v.type}</p>
                                                   </div>
                                                   {s.vesselId === v.id && (
                                                      <Check size={14} className="text-primary shrink-0 ml-auto" />
                                                   )}
                                                </button>
                                             ))}
                                          </div>
                                          {s.vesselId && (
                                             <button
                                                onClick={() => updateStatus(s.id, 'IN_TRANSIT')}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] mt-2"
                                             >
                                                <Navigation size={14} /> Berangkatkan Kapal
                                             </button>
                                          )}
                                       </div>
                                    )}

                                    {s.status === 'IN_TRANSIT' && (
                                       <div>
                                          <p className="text-xs text-zinc-500 mb-3 font-mono uppercase tracking-widest">
                                             <Anchor size={12} className="inline mr-1" /> Kapal Sedang Berlayar
                                          </p>
                                          {vesselAssigned && (
                                             <p className="text-sm text-cyan-400 mb-3 flex items-center gap-2">
                                                <Ship size={14} /> {vesselAssigned}
                                                <span className="inline-flex items-center gap-1 text-[10px] bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                                                   <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> LIVE
                                                </span>
                                             </p>
                                          )}
                                          <button
                                             onClick={() => updateStatus(s.id, 'ARRIVED')}
                                             className="flex items-center gap-2 px-6 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                                          >
                                             <Check size={14} /> Tandai Sudah Tiba
                                          </button>
                                       </div>
                                    )}

                                    {s.status === 'ARRIVED' && (
                                       <div className="flex items-center gap-3 text-green-400">
                                          <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                                             <Check size={18} />
                                          </div>
                                          <div>
                                             <p className="font-bold text-sm">Pengiriman Selesai</p>
                                             <p className="text-xs text-zinc-500">Muatan telah sampai di {s.destination}</p>
                                          </div>
                                       </div>
                                    )}

                                    {s.status === 'REJECTED' && (
                                       <div className="flex items-center gap-3 text-red-400">
                                          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                             <X size={18} />
                                          </div>
                                          <div>
                                             <p className="font-bold text-sm">Pesanan Ditolak</p>
                                             <p className="text-xs text-zinc-500">Pesanan ini telah ditolak oleh admin</p>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>
         )}

         {/* Pagination */}
         {!loading && filteredShipments.length > 0 && (
            <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
               totalItems={filteredShipments.length}
               itemsPerPage={ITEMS_PER_PAGE}
            />
         )}
      </div>
   );
}
