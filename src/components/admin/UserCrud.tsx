"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, History, X, Banknote, Shield, Users } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

const ITEMS_PER_PAGE = 5;

export const UserCrud = () => {
   const [users, setUsers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [formData, setFormData] = useState({ email: '', name: '', password: '', role: 'CUSTOMER', id: '' });
   const [isEditing, setIsEditing] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   
   // Elegant staff/customer splitting & customer history modal states
   const [roleTab, setRoleTab] = useState<'staff' | 'customer'>('staff');
   const [historyUser, setHistoryUser] = useState<any | null>(null);
   const [shipments, setShipments] = useState<any[]>([]);
   const [loadingShipments, setLoadingShipments] = useState(false);
   const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

   const fetchUsers = async () => {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users) setUsers(data.users);
      setLoading(false);
   };

   useEffect(() => {
      fetchUsers();
   }, []);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/users/${formData.id}` : '/api/users';
      
      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData)
      });
      if (res.ok) {
         setFormData({ email: '', name: '', password: '', role: 'CUSTOMER', id: '' });
         setIsEditing(false);
         fetchUsers();
      } else {
         const err = await res.json();
         alert(err.error || 'Gagal menyimpan user');
      }
   };

   const handleEdit = (user: any) => {
      setFormData({ ...user, password: '', id: user.id });
      setIsEditing(true);
   };

   const handleDelete = async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
   };

   const handleViewHistory = async (user: any) => {
      setHistoryUser(user);
      setLoadingShipments(true);
      try {
         const res = await fetch('/api/shipments');
         const data = await res.json();
         if (data.shipments) {
            const filtered = data.shipments.filter((s: any) => s.customerId === user.id);
            setShipments(filtered);
         }
      } catch (err) {
         console.error('Error fetching customer shipments:', err);
      }
      setLoadingShipments(false);
   };

   // Search & Tab role filter
   const filteredUsers = users.filter(user => {
      const isStaff = user.role === 'ADMIN' || user.role === 'MONITORING';
      const matchesTab = roleTab === 'staff' ? isStaff : !isStaff;
      if (!matchesTab) return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
         user.name?.toLowerCase().includes(q) ||
         user.email?.toLowerCase().includes(q) ||
         user.role?.toLowerCase().includes(q)
      );
   });

   // Pagination
   const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
   const paginatedUsers = filteredUsers.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
   );

   // Reset to page 1 when search changes
   const handleSearchChange = useCallback((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
   }, []);

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Form */}
         <div className="bg-[#1a1a21] p-5 rounded-xl border border-white/5 h-fit glow-border">
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider font-mono text-sm">{isEditing ? 'Edit Existing User' : 'Register New User'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="text-xs text-zinc-400 font-mono">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white text-sm focus:outline-none focus:border-primary" required />
               </div>
               <div>
                  <label className="text-xs text-zinc-400 font-mono">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white text-sm focus:outline-none focus:border-primary" required />
               </div>
               <div>
                  <label className="text-xs text-zinc-400 font-mono">Password {isEditing && <span className="text-zinc-600">(leave blank to keep)</span>}</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white text-sm focus:outline-none focus:border-primary" required={!isEditing} />
               </div>
               <div>
                  <label className="text-xs text-zinc-400 font-mono">System Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white text-sm focus:outline-none focus:border-primary">
                     <option value="CUSTOMER">Customer</option>
                     <option value="MONITORING">Monitoring Area</option>
                     <option value="ADMIN">Administrator</option>
                     <option value="CREW">Crew (Kapal)</option>
                  </select>
               </div>
               <div className="flex space-x-2 pt-4">
                  <button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 rounded text-sm font-bold flex justify-center items-center tracking-widest uppercase">
                     {isEditing ? <Pencil size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                     {isEditing ? 'Update' : 'Create'}
                  </button>
                  {isEditing && (
                     <button type="button" onClick={() => { setIsEditing(false); setFormData({ email: '', name: '', password: '', role: 'CUSTOMER', id: '' }) }} className="px-4 bg-zinc-800 hover:bg-zinc-700 rounded text-white text-sm uppercase tracking-widest font-bold">Cancel</button>
                  )}
               </div>
            </form>
         </div>

         {/* Tabel */}
         <div className="lg:col-span-2 bg-[#1a1a21] border border-white/5 rounded-xl overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-white/5">
               <SearchInput
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by name, email, or role..."
               />
            </div>

            {/* Elegant Role Tabs */}
            <div className="flex border-b border-white/5 bg-black/20 p-2 gap-2">
               <button
                  onClick={() => { setRoleTab('staff'); setCurrentPage(1); }}
                  className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all ${
                     roleTab === 'staff'
                        ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
               >
                  Staff & Operator ({users.filter(u => u.role === 'ADMIN' || u.role === 'MONITORING').length})
               </button>
               <button
                  onClick={() => { setRoleTab('customer'); setCurrentPage(1); }}
                  className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all ${
                     roleTab === 'customer'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
               >
                  Customer / Pelanggan ({users.filter(u => u.role === 'CUSTOMER').length})
               </button>
            </div>

            {loading ? (
               <div className="p-4">
                  <TableSkeleton rows={5} columns={4} />
               </div>
            ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-black/40 text-zinc-300 uppercase font-mono text-xs">
                     <tr>
                        <th className="px-5 py-4">Name</th>
                        <th className="px-5 py-4">Email</th>
                        <th className="px-5 py-4">Role</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {paginatedUsers.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-10 text-zinc-500 font-mono">
                           {searchQuery ? `No results for "${searchQuery}"` : 'No users found.'}
                        </td></tr>
                     ) : paginatedUsers.map(user => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                           <td className="px-5 py-4 text-white font-medium">{user.name}</td>
                           <td className="px-5 py-4 font-mono text-xs">{user.email}</td>
                           <td className="px-5 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest ${user.role === 'ADMIN' ? 'bg-primary/20 text-primary border border-primary/30' : user.role === 'MONITORING' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                 {user.role}
                              </span>
                           </td>
                           <td className="px-5 py-4 text-right flex justify-end items-center gap-2">
                              {roleTab === 'customer' && (
                                 <button
                                    onClick={() => handleViewHistory(user)}
                                    className="p-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded transition-colors"
                                    title="Lihat Riwayat Booking"
                                 >
                                    <History size={14} />
                                 </button>
                              )}
                              <button onClick={() => handleEdit(user)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors"><Pencil size={14} /></button>
                              <button onClick={() => setDeleteTarget({ id: user.id, name: user.name })} className="p-2 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            )}

            {/* Pagination */}
            {!loading && filteredUsers.length > 0 && (
               <div className="px-5 pb-4">
                  <Pagination
                     currentPage={currentPage}
                     totalPages={totalPages}
                     onPageChange={setCurrentPage}
                     totalItems={filteredUsers.length}
                     itemsPerPage={ITEMS_PER_PAGE}
                  />
               </div>
            )}
         </div>

         {/* Floating Glassmorphic Customer History Modal */}
         {historyUser && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
               <div className="bg-[#121217] border border-primary/30 rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-in fade-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-5 border-b border-white/5">
                     <div>
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                           <History className="text-primary" size={18} />
                           Riwayat Booking: <span className="text-primary font-mono">{historyUser.name}</span>
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">{historyUser.email}</p>
                     </div>
                     <button
                        onClick={() => setHistoryUser(null)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                     >
                        <X size={18} />
                     </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                     {loadingShipments ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                           <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                           <p className="text-sm text-zinc-500 font-mono">Mengambil riwayat kargo...</p>
                        </div>
                     ) : shipments.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500 font-mono border border-dashed border-white/5 rounded-xl bg-black/10">
                           Belum ada riwayat booking untuk pelanggan ini.
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {shipments.map((s: any) => (
                              <div key={s.id} className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3 hover:border-primary/20 transition-colors">
                                 <div className="flex justify-between items-start gap-2">
                                    <div>
                                       <h4 className="font-bold text-white text-sm">{s.title}</h4>
                                       <span className="text-[10px] text-zinc-600 font-mono">RESI: {s.id}</span>
                                    </div>
                                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                                       s.status === 'ARRIVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                       s.status === 'IN_TRANSIT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                       s.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                       'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    }`}>
                                       {s.status}
                                    </span>
                                 </div>
                                 <div className="text-xs text-zinc-400 space-y-1">
                                    <p className="flex justify-between"><span className="text-zinc-600">Rute:</span> <span>{s.origin} → {s.destination}</span></p>
                                    <p className="flex justify-between"><span className="text-zinc-600">Berat/Vol:</span> <span>{s.weight} Kg {s.volume ? `• ${s.volume} m³` : ''}</span></p>
                                    <p className="flex justify-between"><span className="text-zinc-600">Biaya:</span> <span className="text-emerald-400 font-mono font-bold">Rp {s.cost ? s.cost.toLocaleString('id-ID') : '0'}</span></p>
                                    <p className="flex justify-between"><span className="text-zinc-600">Pembayaran:</span> <span className={`font-bold ${s.paymentStatus === 'PAID' ? 'text-green-400' : 'text-red-400'}`}>{s.paymentStatus === 'PAID' ? '✓ PAID' : '✗ UNPAID'}</span></p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
         <DeleteConfirmModal
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget.id); }}
            title="Hapus User"
            itemName={deleteTarget?.name}
         />
      </div>
   );
}
