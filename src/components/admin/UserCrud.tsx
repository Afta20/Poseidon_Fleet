"use client"
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

export const UserCrud = () => {
   const [users, setUsers] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [formData, setFormData] = useState({ email: '', name: '', password: '', role: 'CUSTOMER', id: '' });
   const [isEditing, setIsEditing] = useState(false);

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
      if (!confirm('Yakin ingin menghapus user ini?')) return;
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
   };

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
         <div className="lg:col-span-2 overflow-x-auto bg-[#1a1a21] border border-white/5 rounded-xl">
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
                  {loading ? (
                     <tr><td colSpan={4} className="text-center py-10">Fetching secure records...</td></tr>
                  ) : users.map(user => (
                     <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 text-white font-medium">{user.name}</td>
                        <td className="px-5 py-4 font-mono text-xs">{user.email}</td>
                        <td className="px-5 py-4">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest ${user.role === 'ADMIN' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                              {user.role}
                           </span>
                        </td>
                        <td className="px-5 py-4 text-right flex justify-end space-x-2">
                           <button onClick={() => handleEdit(user)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-white transition-colors"><Pencil size={14} /></button>
                           <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
