"use client"
import React, { useState, useCallback } from 'react';
import { Ship, Package, MapPin } from 'lucide-react';
import Link from 'next/link';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';

const CARDS_PER_PAGE = 6;
const TABLE_PER_PAGE = 5;

interface CustomerShipmentListProps {
  shipments: any[];
}

export const CustomerShipmentList: React.FC<CustomerShipmentListProps> = ({ shipments }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const activeShipments = shipments.filter((s: any) => s.status !== 'ARRIVED' && s.status !== 'REJECTED');
  const pastShipments = shipments.filter((s: any) => s.status === 'ARRIVED' || s.status === 'REJECTED');

  // Filter by search
  const filterFn = (s: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.id?.toLowerCase().includes(q) ||
      s.origin?.toLowerCase().includes(q) ||
      s.destination?.toLowerCase().includes(q) ||
      s.vessel?.name?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q)
    );
  };

  const filteredActive = activeShipments.filter(filterFn);
  const filteredPast = pastShipments.filter(filterFn);

  const activeTotalPages = Math.ceil(filteredActive.length / CARDS_PER_PAGE);
  const paginatedActive = filteredActive.slice((activePage - 1) * CARDS_PER_PAGE, activePage * CARDS_PER_PAGE);

  const historyTotalPages = Math.ceil(filteredPast.length / TABLE_PER_PAGE);
  const paginatedPast = filteredPast.slice((historyPage - 1) * TABLE_PER_PAGE, historyPage * TABLE_PER_PAGE);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setActivePage(1);
    setHistoryPage(1);
  }, []);

  return (
    <>
      {/* Search */}
      <div className="mb-8">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Cari muatan berdasarkan nama, resi, rute..."
        />
      </div>

      {/* Active Shipments */}
      <h2 className="text-xl font-bold mb-6 flex items-center border-b border-white/10 pb-4">
        <Package className="mr-2 text-primary" size={20} />
        Muatan Aktif ({filteredActive.length})
      </h2>

      {filteredActive.length === 0 ? (
        <div className="text-center py-16 border border-white/10 border-dashed rounded-2xl mb-12">
          <Package size={48} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-500 font-mono">
            {searchQuery ? `Tidak ditemukan muatan aktif untuk "${searchQuery}"` : 'Belum ada muatan aktif saat ini.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            {paginatedActive.map((shipment: any) => (
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
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                      <span className="text-zinc-500">Status Bayar:</span>
                      <span className={`font-mono px-2 py-0.5 rounded text-[10px] font-bold ${
                        shipment.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {shipment.paymentStatus === 'PAID' ? '✓ LUNAS' : '✗ BELUM BAYAR'}
                      </span>
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
          <div className="mb-12">
            <Pagination currentPage={activePage} totalPages={activeTotalPages} onPageChange={setActivePage} totalItems={filteredActive.length} itemsPerPage={CARDS_PER_PAGE} />
          </div>
        </>
      )}

      {/* History */}
      {filteredPast.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-6 flex items-center border-b border-white/10 pb-4">
            <Ship className="mr-2 text-zinc-500" size={20} />
            Riwayat Pengiriman ({filteredPast.length})
          </h2>
          <div className="bg-[#121217] border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 font-mono text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Paket / Resi</th>
                  <th className="px-6 py-4">Rute</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Pembayaran</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedPast.map((s: any) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold">{s.title}</p>
                      <p className="text-xs text-zinc-500 font-mono">{s.id}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{s.origin} → {s.destination}</td>
                    <td className="px-6 py-4 text-zinc-300">{s.type}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded font-bold font-mono ${s.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {s.paymentStatus === 'PAID' ? '✓ PAID' : '✗ UNPAID'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${s.status === 'ARRIVED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 pb-4">
              <Pagination currentPage={historyPage} totalPages={historyTotalPages} onPageChange={setHistoryPage} totalItems={filteredPast.length} itemsPerPage={TABLE_PER_PAGE} />
            </div>
          </div>
        </>
      )}
    </>
  );
};
