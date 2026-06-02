"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, Ship, X } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

const ITEMS_PER_PAGE = 5;

const VESSEL_TYPES = ['Tanker', 'Cargo', 'Passenger', 'Container', 'Bulk Carrier'];
const VESSEL_STATUSES = ['En Route', 'In Port', 'Delayed', 'Maintenance'];

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'En Route':    { color: 'text-cyan-400',  bg: 'bg-cyan-500/10',  border: 'border-cyan-500/30' },
  'In Port':     { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  'Delayed':     { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  'Maintenance': { color: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/30' },
};

const EMPTY_FORM = {
  id: '',
  name: '',
  type: 'Cargo',
  status: 'In Port',
  plateCode: '',
  capacity: '',
  payload: '',
};

export const VesselCrud = () => {
  const [vessels, setVessels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vessels');
      const data = await res.json();
      setVessels(data.vessels || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/vessels/${formData.id}` : '/api/vessels';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ ...EMPTY_FORM });
        setIsEditing(false);
        setShowForm(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan data kapal');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (vessel: any) => {
    setFormData({
      id: vessel.id,
      name: vessel.name,
      type: vessel.type,
      status: vessel.status,
      plateCode: vessel.plateCode || '',
      capacity: vessel.capacity?.toString() || '',
      payload: vessel.payload || '',
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/vessels/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus kapal');
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

  const filteredVessels = vessels.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.name?.toLowerCase().includes(q) ||
      v.type?.toLowerCase().includes(q) ||
      v.status?.toLowerCase().includes(q) ||
      v.plateCode?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredVessels.length / ITEMS_PER_PAGE);
  const paginated = filteredVessels.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const inputCls = "w-full bg-black/50 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:border-primary transition-colors";
  const labelCls = "block text-xs text-zinc-400 font-mono mb-1.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold flex items-center">
            <Ship className="mr-3 text-primary" /> Manajemen Armada Kapal
          </h2>
          <p className="text-zinc-500 text-sm mt-1">Kelola data kapal, kapasitas, dan status operasional.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setIsEditing(false); setFormData({ ...EMPTY_FORM }); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-all glow-border"
        >
          <Plus size={16} /> Tambah Kapal
        </button>
      </div>

      {/* Form Panel */}
      {showForm && (
        <div className="bg-[#0d0d12] border border-primary/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-white font-mono text-sm uppercase tracking-widest flex items-center gap-2">
              {isEditing ? (
                <>
                  <Pencil size={14} className="text-primary animate-pulse" /> Edit Data Kapal
                </>
              ) : (
                <>
                  <Plus size={14} className="text-primary" /> Tambah Kapal Baru
                </>
              )}
            </h3>
            <button onClick={handleCancel} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X size={16} className="text-zinc-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Nama Kapal *</label>
              <input
                type="text"
                required
                className={inputCls}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Misal: Poseidon Alpha"
              />
            </div>
            <div>
              <label className={labelCls}>Jenis Kendaraan *</label>
              <select
                required
                className={inputCls}
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                {VESSEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status Kendaraan *</label>
              <select
                required
                className={inputCls}
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                {VESSEL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Plat Nomor / Kode Kendaraan</label>
              <input
                type="text"
                className={inputCls}
                value={formData.plateCode}
                onChange={e => setFormData({ ...formData, plateCode: e.target.value })}
                placeholder="Misal: IMO-1234567"
              />
            </div>
            <div>
              <label className={labelCls}>Kapasitas Muatan (Ton)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className={inputCls}
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="Misal: 5000"
              />
            </div>
            <div>
              <label className={labelCls}>Deskripsi / Muatan Saat Ini</label>
              <input
                type="text"
                className={inputCls}
                value={formData.payload}
                onChange={e => setFormData({ ...formData, payload: e.target.value })}
                placeholder="Misal: Kontainer elektronik"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-all"
              >
                {submitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Kapal')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Cari nama kapal, tipe, kode..."
        />
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : paginated.length === 0 ? (
        <div className="text-center py-16 border border-white/10 border-dashed rounded-2xl">
          <Ship size={48} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500 font-mono">
            {searchQuery ? `Tidak ditemukan untuk "${searchQuery}"` : 'Belum ada data armada kapal.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#121217] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-black/40 text-zinc-300 uppercase font-mono text-xs">
                <tr>
                  <th className="px-5 py-4">Nama Kapal</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Kode/Plat</th>
                  <th className="px-5 py-4">Kapasitas</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(vessel => {
                  const cfg = STATUS_CONFIG[vessel.status] || STATUS_CONFIG['In Port'];
                  return (
                    <tr key={vessel.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Ship size={14} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{vessel.name}</p>
                            {vessel.payload && <p className="text-[10px] text-zinc-600 truncate max-w-[120px]">{vessel.payload}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-zinc-300">{vessel.type}</td>
                      <td className="px-5 py-4 font-mono text-xs">
                        {vessel.plateCode ? (
                          <span className="bg-zinc-800 px-2 py-1 rounded text-zinc-300">{vessel.plateCode}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">
                        {vessel.capacity != null ? (
                          <span className="text-white">{vessel.capacity.toLocaleString('id-ID')} Ton</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          {vessel.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(vessel)}
                            className="p-2 bg-zinc-800 hover:bg-primary/20 hover:border-primary/40 border border-transparent rounded-lg text-white transition-all"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: vessel.id, name: vessel.name })}
                            className="p-2 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-500 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredVessels.length > 0 && (
            <div className="px-5 pb-4 pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredVessels.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          )}
        </div>
      )}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget.id, deleteTarget.name); }}
        title="Hapus Kapal"
        itemName={deleteTarget?.name}
      />
    </div>
  );
};
