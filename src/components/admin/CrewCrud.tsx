"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 5;

export const CrewCrud = () => {
   const [crews, setCrews] = useState<any[]>([]);
   const [vessels, setVessels] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [formData, setFormData] = useState({ name: '', position: 'Captain', vesselId: '', id: '' });
   const [isEditing, setIsEditing] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [currentPage, setCurrentPage] = useState(1);

   const fetchData = async () => {
      setLoading(true);
      try {
        const [crewRes, vesselRes] = await Promise.all([
          fetch('/api/crew'),
          fetch('/api/vessels')
        ]);
        const crewData = await crewRes.json();
        const vesselData = await vesselRes.json();
        if (crewData.crew) setCrews(crewData.crew);
        if (vesselData.vessels) setVessels(vesselData.vessels);
      } catch(e) {
        console.error(e);
      }
      setLoading(false);
   };

   useEffect(() => { fetchData(); }, []);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/crew/${formData.id}` : '/api/crew';
      const res = await fetch(url, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData)
      });
      if (res.ok) {
         setFormData({ name: '', position: 'Captain', vesselId: '', id: '' });
         setIsEditing(false);
         fetchData();
      } else {
         const err = await res.json();
         alert(err.error || 'Gagal menyimpan crew');
      }
   };

   const handleEdit = (crew: any) => {
      setFormData({ name: crew.name, position: crew.position, vesselId: crew.vesselId || '', id: crew.id });
      setIsEditing(true);
   };

   const handleDelete = async (id: string) => {
      if (!confirm('Yakin ingin menghapus crew ini?')) return;
      const res = await fetch(`/api/crew/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
   };

   const filteredCrews = crews.filter(crew => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const vesselName = vessels.find(v => v.id === crew.vesselId)?.name || 'STANDBY';
      return crew.name?.toLowerCase().includes(q) || crew.position?.toLowerCase().includes(q) || vesselName.toLowerCase().includes(q);
   });

   const totalPages = Math.ceil(filteredCrews.length / ITEMS_PER_PAGE);
   const paginatedCrews = filteredCrews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

   const handleSearchChange = useCallback((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
   }, []);

   return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-[#1a1a21] p-5 rounded-xl border border-white/5 h-fit glow-border">
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider font-mono text-sm">{isEditing ? 'Edit Crew Member' : 'Assign New Crew'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="text-xs text-zinc-400 font-mono">Crew Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white text-sm focus:outline-none focus:border-primary" required />
               </div>
               <div>
                  <label className="text-xs text-zinc-400 font-mono">Position / Role</label>
                  <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white text-sm focus:outline-none focus:border-primary">
                     <option value="Captain">Captain</option>
                     <option value="First Officer">First Officer</option>
                     <option value="Chief Engineer">Chief Engineer</option>
                     <option value="Deckhand">Deckhand</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs text-zinc-400 font-mono">Assigned Vessel</label>
                  <select value={formData.vesselId} onChange={e => setFormData({...formData, vesselId: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded py-2 px-3 text-white text-sm focus:outline-none focus:border-primary">
                     <option value="">-- Unassigned (Standby) --</option>
                     {vessels.map(v => (<option key={v.id} value={v.id}>{v.name} ({v.type})</option>))}
                  </select>
               </div>
               <div className="flex space-x-2 pt-4">
                  <button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 rounded text-sm font-bold flex justify-center items-center tracking-widest uppercase">
                     {isEditing ? <Pencil size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
                     {isEditing ? 'Update' : 'Assign'}
                  </button>
                  {isEditing && (
                     <button type="button" onClick={() => { setIsEditing(false); setFormData({ name: '', position: 'Captain', vesselId: '', id: '' }) }} className="px-4 bg-zinc-800 hover:bg-zinc-700 rounded text-white text-sm uppercase tracking-widest font-bold">Cancel</button>
                  )}
               </div>
            </form>
         </div>

         <div className="lg:col-span-2 bg-[#1a1a21] border border-white/5 rounded-xl">
            <div className="p-4 border-b border-white/5">
               <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder="Search by name, position, or vessel..." />
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-black/40 text-zinc-300 uppercase font-mono text-xs">
                     <tr>
                        <th className="px-5 py-4">Name</th>
                        <th className="px-5 py-4">Position</th>
                        <th className="px-5 py-4">Vessel Assignment</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        <tr><td colSpan={4} className="text-center py-10">Fetching secure roster...</td></tr>
                     ) : paginatedCrews.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-10 text-zinc-500 font-mono">
                           {searchQuery ? `No results for "${searchQuery}"` : 'No crew members found.'}
                        </td></tr>
                     ) : paginatedCrews.map(crew => {
                        const vesselName = vessels.find(v => v.id === crew.vesselId)?.name || 'STANDBY';
                        return (
                        <tr key={crew.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                           <td className="px-5 py-4 text-white font-medium">{crew.name}</td>
                           <td className="px-5 py-4 font-mono text-xs text-primary">{crew.position}</td>
                           <td className="px-5 py-4">
                              <span className={`px-3 py-1 rounded text-xs font-bold font-mono ${vesselName === 'STANDBY' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                 {vesselName}
                              </span>
                           </td>
                           <td className="px-5 py-4 text-right flex justify-end space-x-2">
                              <button onClick={() => handleEdit(crew)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors"><Pencil size={14} /></button>
                              <button onClick={() => handleDelete(crew.id)} className="p-2 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                           </td>
                        </tr>
                     );})}
                  </tbody>
               </table>
            </div>
            {!loading && filteredCrews.length > 0 && (
               <div className="px-5 pb-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredCrews.length} itemsPerPage={ITEMS_PER_PAGE} />
               </div>
            )}
         </div>
      </div>
   );
}
