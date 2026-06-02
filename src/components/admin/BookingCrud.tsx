"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Package, Ship, MapPin, User, Weight, ArrowRight, Check, X, Anchor, Navigation, Plus, Pencil, Trash2, Banknote, Phone, Zap } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
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

const EMPTY_FORM = {
   id: '',
   title: '',
   description: '',
   senderName: '',
   receiverName: '',
   phone: '',
   origin: '',
   destination: '',
   weight: '',
   volume: '',
   type: 'LCL',
   deliveryType: 'BIASA',
   cost: '',
   customerId: '',
   status: 'PENDING',
   paymentMethod: 'TRANSFER_BANK',
   paymentStatus: 'UNPAID'
};

export const BookingCrud = () => {
   const [shipments, setShipments] = useState<any[]>([]);
   const [vessels, setVessels] = useState<any[]>([]);
   const [customers, setCustomers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const [expandedId, setExpandedId] = useState<string | null>(null);

   // Form states
   const [showForm, setShowForm] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [formData, setFormData] = useState({ ...EMPTY_FORM });
   const [submitting, setSubmitting] = useState(false);
   const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

   const fetchData = async () => {
      setLoading(true);
      try {
         const [resS, resV, resU] = await Promise.all([
            fetch('/api/shipments'),
            fetch('/api/vessels'),
            fetch('/api/users')
         ]);
         const dataS = await resS.json();
         const dataV = await resV.json();
         const dataU = await resU.json();
         setShipments(dataS.shipments || []);
         setVessels(dataV.vessels || []);
         setCustomers((dataU.users || []).filter((u: any) => u.role === 'CUSTOMER'));
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

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
         const method = isEditing ? 'PUT' : 'POST';
         const url = isEditing ? `/api/shipments/${formData.id}` : '/api/shipments';
         const payload = {
            ...formData,
            weight: Number(formData.weight),
            volume: formData.volume ? Number(formData.volume) : null,
            cost: formData.cost ? Number(formData.cost) : null,
         };
         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });
         if (res.ok) {
            setFormData({ ...EMPTY_FORM });
            setIsEditing(false);
            setShowForm(false);
            fetchData();
         } else {
            const err = await res.json();
            alert(err.error || 'Gagal menyimpan data pesanan');
         }
      } catch (e) {
         console.error(e);
         alert('Terjadi kesalahan');
      } finally {
         setSubmitting(false);
      }
   };

   const handleEdit = (s: any) => {
      setFormData({
         id: s.id,
         title: s.title || '',
         description: s.description || '',
         senderName: s.senderName || '',
         receiverName: s.receiverName || '',
         phone: s.phone || '',
         origin: s.origin || '',
         destination: s.destination || '',
         weight: s.weight?.toString() || '',
         volume: s.volume?.toString() || '',
         type: s.type || 'LCL',
         deliveryType: s.deliveryType || 'BIASA',
         cost: s.cost?.toString() || '',
         customerId: s.customerId || '',
         status: s.status || 'PENDING',
         paymentMethod: s.paymentMethod || 'TRANSFER_BANK',
         paymentStatus: s.paymentStatus || 'UNPAID'
      });
      setIsEditing(true);
      setShowForm(true);
   };

   const handleDelete = async (id: string, title: string) => {
      try {
         const res = await fetch(`/api/shipments/${id}`, { method: 'DELETE' });
         if (res.ok) {
            fetchData();
         } else {
            const err = await res.json();
            alert(err.error || 'Gagal menghapus pesanan');
         }
      } catch (e) {
         alert('Terjadi kesalahan');
      }
   };

   const handleCancel = () => {
      setFormData({ ...EMPTY_FORM });
      setIsEditing(false);
      setShowForm(false);
   };

   const filteredShipments = shipments.filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
         s.title?.toLowerCase().includes(q) ||
         s.id?.toLowerCase().includes(q) ||
         s.customer?.name?.toLowerCase().includes(q) ||
         s.customer?.email?.toLowerCase().includes(q) ||
         s.senderName?.toLowerCase().includes(q) ||
         s.receiverName?.toLowerCase().includes(q) ||
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

   const inputCls = "w-full bg-black/50 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:border-primary transition-colors";
   const labelCls = "block text-xs text-zinc-400 font-mono mb-1.5";

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
            <div className="flex flex-col sm:flex-row gap-3">
               <SearchInput
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Cari berdasarkan nama, resi, rute..."
               />
               <button
                  onClick={() => { setShowForm(true); setIsEditing(false); setFormData({ ...EMPTY_FORM }); }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-all glow-border"
               >
                  <Plus size={16} /> Tambah Pesanan
               </button>
            </div>
         </div>

         {/* Form Panel */}
         {showForm && (
            <div className="bg-[#0d0d12] border border-primary/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
               <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-white font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                     {isEditing ? (
                        <>
                           <Pencil size={14} className="text-primary animate-pulse" /> Edit Data Pesanan
                        </>
                     ) : (
                        <>
                           <Plus size={14} className="text-primary" /> Tambah Pesanan Baru
                        </>
                     )}
                  </h3>
                  <button onClick={handleCancel} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                     <X size={16} className="text-zinc-400" />
                  </button>
               </div>
               <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label className={labelCls}>Nama / Jenis Barang *</label>
                        <input type="text" required className={inputCls} value={formData.title}
                           onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Misal: Mesin Pabrik" />
                     </div>
                     <div>
                        <label className={labelCls}>Customer / Akun Pemesan *</label>
                        <select required className={inputCls} value={formData.customerId}
                           onChange={e => setFormData({ ...formData, customerId: e.target.value })}>
                           <option value="">Pilih Customer...</option>
                           {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className={labelCls}>Status Pengiriman *</label>
                        <select required className={inputCls} value={formData.status}
                           onChange={e => setFormData({ ...formData, status: e.target.value })}>
                           {Object.keys(STATUS_CONFIG).map(s => (
                              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                           ))}
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label className={labelCls}>Nama Pengirim *</label>
                        <input type="text" required className={inputCls} value={formData.senderName}
                           onChange={e => setFormData({ ...formData, senderName: e.target.value })} placeholder="Nama Pengirim" />
                     </div>
                     <div>
                        <label className={labelCls}>Nama Penerima *</label>
                        <input type="text" required className={inputCls} value={formData.receiverName}
                           onChange={e => setFormData({ ...formData, receiverName: e.target.value })} placeholder="Nama Penerima" />
                     </div>
                     <div>
                        <label className={labelCls}>No Telepon *</label>
                        <input type="tel" required pattern="[0-9+\-\s]{10,15}" minLength={10} maxLength={15} title="Masukkan nomor telepon valid (10-15 digit angka)" className={inputCls} value={formData.phone}
                           onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+\-\s]/g, '') })} placeholder="08123456789" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className={labelCls}>Pelabuhan Asal *</label>
                        <input type="text" required className={inputCls} value={formData.origin}
                           onChange={e => setFormData({ ...formData, origin: e.target.value })} placeholder="Tanjung Priok, Jakarta" />
                     </div>
                     <div>
                        <label className={labelCls}>Pelabuhan Tujuan *</label>
                        <input type="text" required className={inputCls} value={formData.destination}
                           onChange={e => setFormData({ ...formData, destination: e.target.value })} placeholder="Tanjung Perak, Surabaya" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div>
                        <label className={labelCls}>Berat Barang (Kg) *</label>
                        <input type="number" required min="1" className={inputCls} value={formData.weight}
                           onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="500" />
                     </div>
                     <div>
                        <label className={labelCls}>Volume (m³)</label>
                        <input type="number" step="0.1" className={inputCls} value={formData.volume}
                           onChange={e => setFormData({ ...formData, volume: e.target.value })} placeholder="1.5" />
                     </div>
                     <div>
                        <label className={labelCls}>Tipe Kontainer *</label>
                        <select required className={inputCls} value={formData.type}
                           onChange={e => setFormData({ ...formData, type: e.target.value })}>
                           <option value="LCL">LCL</option>
                           <option value="FCL">FCL</option>
                        </select>
                     </div>
                     <div>
                        <label className={labelCls}>Jenis Layanan *</label>
                        <select required className={inputCls} value={formData.deliveryType}
                           onChange={e => setFormData({ ...formData, deliveryType: e.target.value })}>
                           <option value="BIASA">Reguler (Biasa)</option>
                           <option value="CEPAT">Express (Cepat)</option>
                           <option value="VVIP">Priority (VVIP)</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="md:col-span-2">
                        <label className={labelCls}>Deskripsi / Catatan Barang</label>
                        <input type="text" className={inputCls} value={formData.description}
                           onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Kondisi barang, dll." />
                     </div>
                     <div>
                        <label className={labelCls}>Harga / Tarif Pengiriman (Rp)</label>
                        <input type="number" className={inputCls} value={formData.cost}
                           onChange={e => setFormData({ ...formData, cost: e.target.value })} placeholder="Akan dihitung otomatis jika kosong" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className={labelCls}>Metode Pembayaran *</label>
                        <select required className={inputCls} value={formData.paymentMethod}
                           onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}>
                           <option value="TRANSFER_BANK">Transfer Bank</option>
                           <option value="E_WALLET">QRIS / E-Wallet</option>
                           <option value="COD">Bayar di Pelabuhan (COD)</option>
                        </select>
                     </div>
                     <div>
                        <label className={labelCls}>Status Pembayaran *</label>
                        <select required className={inputCls} value={formData.paymentStatus}
                           onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}>
                           <option value="UNPAID">Belum Dibayar (UNPAID)</option>
                           <option value="PAID">Sudah Dibayar (PAID)</option>
                        </select>
                     </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button type="submit" disabled={submitting}
                        className="px-8 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-all">
                        {submitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Pesanan')}
                     </button>
                     <button type="button" onClick={handleCancel}
                        className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-all">
                        Batal
                     </button>
                  </div>
               </form>
            </div>
         )}

         {/* Content List */}
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
                        <div className="flex items-center gap-4 px-5 py-4 cursor-pointer">
                           {/* Status Accent Bar */}
                           <div className={`shrink-0 w-2 h-12 rounded-full ${statusCfg.bg} ${s.status === 'IN_TRANSIT' ? 'animate-pulse' : ''}`}
                              style={{ backgroundColor: statusCfg.color.includes('amber') ? 'rgba(251,191,36,0.4)' : statusCfg.color.includes('blue') ? 'rgba(96,165,250,0.4)' : statusCfg.color.includes('cyan') ? 'rgba(34,211,238,0.4)' : statusCfg.color.includes('green') ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)' }}
                              onClick={() => setExpandedId(isExpanded ? null : s.id)}
                           />

                           {/* Title & ID */}
                           <div className="min-w-0 flex-1" onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                              <h3 className="font-bold text-white truncate">{s.title}</h3>
                              <p className="text-[10px] text-zinc-600 font-mono mt-0.5 truncate">RESI: {s.id}</p>
                           </div>

                           {/* Route */}
                           <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400 shrink-0" onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                              <MapPin size={12} className="text-green-500" />
                              <span className="truncate max-w-[100px]">{s.origin}</span>
                              <ArrowRight size={12} className="text-zinc-600" />
                              <span className="truncate max-w-[100px]">{s.destination}</span>
                           </div>

                           {/* Customer */}
                           <div className="hidden lg:flex items-center gap-2 shrink-0" onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                 <User size={12} className="text-primary" />
                              </div>
                              <span className="text-sm text-zinc-300 truncate max-w-[100px]">{s.customer?.name}</span>
                           </div>

                           {/* Status */}
                           <span onClick={() => setExpandedId(isExpanded ? null : s.id)} className={`shrink-0 text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}>
                              {statusCfg.label}
                           </span>

                           {/* Quick Actions (Edit / Delete) */}
                           <div className="flex gap-2 shrink-0">
                              <button
                                 onClick={(e) => { e.stopPropagation(); handleEdit(s); }}
                                 className="p-2 bg-zinc-800 hover:bg-primary/20 border border-transparent rounded-lg text-white transition-all"
                                 title="Edit"
                              >
                                 <Pencil size={13} />
                              </button>
                              <button
                                 onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: s.id, title: s.title }); }}
                                 className="p-2 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-500 rounded-lg transition-all"
                                 title="Hapus"
                              >
                                 <Trash2 size={13} />
                              </button>
                           </div>
                        </div>

                        {/* Expanded Detail Panel */}
                        {isExpanded && (
                           <div className="border-t border-white/5 bg-black/20">
                              {/* Info Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-5">
                                 <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Pengirim & Penerima</p>
                                    <p className="text-xs text-white"><span className="text-zinc-500">Dari:</span> {s.senderName || '—'}</p>
                                    <p className="text-xs text-white mt-0.5"><span className="text-zinc-500">Untuk:</span> {s.receiverName || '—'}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1"><Phone size={10} className="text-zinc-500" /> {s.phone || '—'}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Rute & Layanan</p>
                                    <p className="text-xs text-white">{s.origin} → {s.destination}</p>
                                    <p className="text-xs text-amber-400 mt-0.5 font-semibold flex items-center gap-1"><Zap size={10} className="text-amber-400 animate-pulse" /> Layanan: {s.deliveryType}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Detail Muatan</p>
                                    <p className="text-xs text-white flex items-center gap-1"><Weight size={11} className="text-zinc-500" /> {s.weight} Kg</p>
                                    {s.volume && <p className="text-xs text-zinc-500 mt-0.5">Volume: {s.volume} m³</p>}
                                    <p className="text-xs text-zinc-500 font-mono">Tipe: {s.type}</p>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Biaya & Pembayaran</p>
                                    <p className="text-xs text-emerald-400 font-mono font-bold">
                                       Rp {s.cost ? s.cost.toLocaleString('id-ID') : '0'}
                                    </p>
                                     <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                                        <Banknote size={10} className="text-zinc-500" /> {s.paymentMethod === 'TRANSFER_BANK' ? 'Transfer Bank' : s.paymentMethod === 'E_WALLET' ? 'QRIS / E-Wallet' : 'COD (Cash)'}
                                     </p>
                                    <span className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mt-1.5 ${s.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                       {s.paymentStatus === 'PAID' ? '✓ PAID' : '✗ UNPAID'}
                                    </span>
                                 </div>
                                 <div>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Armada Kapal</p>
                                    {vesselAssigned ? (
                                       <p className="text-xs text-cyan-400 flex items-center gap-1 font-medium">
                                          <Ship size={11} /> {vesselAssigned}
                                       </p>
                                    ) : (
                                       <p className="text-xs text-zinc-500 italic">Belum di-assign</p>
                                    )}
                                 </div>
                              </div>

                              {/* Action Bar */}
                              <div className="px-5 pb-5">
                                 <div className="bg-[#0d0d12] rounded-xl border border-white/5 p-4">
                                    {s.status === 'PENDING' && (
                                       <div>
                                          <p className="text-xs text-zinc-500 mb-3 font-mono uppercase tracking-widest flex items-center gap-1"><Anchor size={11} className="text-zinc-500" /> Konfirmasi Pesanan</p>
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

                                    {/* Quick Payment Action Toggle */}
                                    <div className="border-t border-white/5 pt-4 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                       <div className="flex items-center gap-2">
                                          <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest flex items-center gap-1"><Banknote size={11} className="text-zinc-500" /> Status Pembayaran:</span>
                                          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${s.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                             {s.paymentStatus === 'PAID' ? '✓ PAID (LUNAS)' : '✗ UNPAID (BELUM BAYAR)'}
                                          </span>
                                       </div>
                                       <button
                                          onClick={async () => {
                                             await fetch(`/api/shipments/${s.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ paymentStatus: s.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID' })
                                             });
                                             fetchData();
                                          }}
                                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${s.paymentStatus === 'PAID' ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'}`}
                                       >
                                          {s.paymentStatus === 'PAID' ? 'Tandai Belum Lunas' : 'Tandai Sudah Bayar (Lunas)'}
                                       </button>
                                    </div>
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
         <DeleteConfirmModal
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget.id, deleteTarget.title); }}
            title="Hapus Pesanan Kargo"
            itemName={deleteTarget?.title}
         />
      </div>
   );
}
