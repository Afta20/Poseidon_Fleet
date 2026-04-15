import React from 'react';
import { VesselWithLatestLog } from '@/types';
import { AlertCircle, WifiOff, Ship, Battery, Navigation, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '@/hooks/useSession';
import { useState } from 'react';
import { Package, Pencil, Check, X as XIcon } from 'lucide-react';

export const FleetList: React.FC<{ 
  vessels: VesselWithLatestLog[]; 
  loading: boolean;
  onSelectVessel?: (id: string) => void;
  selectedVesselId?: string | null;
  onRefetch?: () => void;
}> = ({ vessels, loading, onSelectVessel, selectedVesselId, onRefetch }) => {
  const { session } = useSession();
  const isAdmin = session?.role === 'ADMIN';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPayload, setTempPayload] = useState('');

  const handleEdit = (vessel: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(vessel.id);
    setTempPayload(vessel.payload || '');
  };

  const handleSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/vessels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: tempPayload })
      });
      setEditingId(null);
      if (onRefetch) onRefetch();
    } catch {
      alert('Failed saving payload');
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-zinc-900 rounded-xl animate-pulse glow-border"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {vessels.map(vessel => {
        const isLost = vessel.status === 'Signal Lost';
        const isDelayed = vessel.status === 'Delayed';
        
        // Define styles based on status
        let statusColor = 'text-green-400';
        let statusShadow = 'drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'; // Emerald glow
        let cardClass = 'bg-[#121217] border border-primary/30 glow-border';

        if (isLost) {
          statusColor = 'text-red-500';
          statusShadow = 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'; // Red glow
          cardClass = 'bg-[#0a0a0c] border border-red-500/50 glow-border-lost grayscale-[50%] opacity-80';
        } else if (isDelayed) {
          statusColor = 'text-amber-400';
          statusShadow = 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'; // Yellow glow
        }

        // Highlight if selected
        const isSelected = selectedVesselId === vessel.id;
        if (isSelected) {
          cardClass += ' ring-2 ring-primary ring-offset-2 ring-offset-[#0a0a0c] scale-[1.02] z-10';
        } else {
          cardClass += ' hover:border-primary/50 cursor-pointer';
        }

        return (
          <motion.div
            key={vessel.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: isSelected ? 1.02 : 1 }}
            onClick={() => onSelectVessel?.(vessel.id)}
            className={`rounded-xl p-5 relative transition-all duration-500 ${cardClass}`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <Ship className={`${statusColor} ${statusShadow} mr-3`} size={24} />
                <div>
                  <h3 className="font-bold text-xl text-white tracking-wide">{vessel.name}</h3>
                  <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">{vessel.type}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`font-mono text-sm font-bold uppercase ${statusColor} ${statusShadow}`}>
                  {vessel.status}
                </span>
                {isLost && (
                  <span className="font-mono text-xs text-red-500/80 flex items-center mt-1 animate-pulse">
                    <AlertCircle size={10} className="mr-1" />
                    No Signal
                  </span>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/10 pt-4">
              {/* Lat Lng */}
              <div className="col-span-2">
                <p className="text-zinc-500 font-mono text-xs mb-1">COORDINATES</p>
                <div className="flex justify-between items-center">
                  <motion.div
                    key={`${vessel.id}-latlng-${vessel.lastUpdated}`}
                    initial={{ color: isLost ? '#ef4444' : '#4ade80' }}
                    animate={{ color: isLost ? '#ef4444' : '#a855f7' }}
                    transition={{ duration: 1 }}
                    className="font-mono text-lg font-bold flex space-x-4"
                  >
                     <span>{vessel.latestLog.lat.toFixed(4)}</span>
                     <span>{vessel.latestLog.lng.toFixed(4)}</span>
                  </motion.div>
                  {isLost && <WifiOff size={16} className="text-red-500 animate-pulse" />}
                </div>
              </div>

              {/* Speed */}
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <div className="flex items-center text-zinc-400 mb-1">
                  <Navigation size={12} className="mr-1" />
                  <span className="font-mono text-xs">SPEED</span>
                </div>
                <div className="font-mono font-bold text-white text-lg">
                  {vessel.latestLog.speed.toFixed(1)} <span className="text-sm font-normal text-zinc-500">KNOTS</span>
                </div>
              </div>

              {/* Fuel */}
              <div className="bg-white/5 rounded-lg p-2 border border-white/5 relative overflow-hidden">
                <div className="flex items-center text-zinc-400 mb-1">
                  <Battery size={12} className="mr-1" />
                  <span className="font-mono text-xs">FUEL</span>
                </div>
                <div className="font-mono font-bold text-white text-lg">
                  {vessel.latestLog.fuelLevel}%
                </div>
                {/* Fuel indicator bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-zinc-800 w-full">
                  <div 
                    className={`h-full ${vessel.latestLog.fuelLevel > 30 ? 'bg-primary' : 'bg-red-500'} transition-all`}
                    style={{ width: `${vessel.latestLog.fuelLevel}%` }}
                  ></div>
                </div>
              </div>

              {/* Shipments / Active Cargo from Customers */}
              <div className="col-span-2 bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-center text-zinc-400 mb-2">
                  <Package size={12} className="mr-1" />
                  <span className="font-mono text-xs">MUATAN AKTIF</span>
                  {(vessel as any).shipments?.length > 0 && (
                    <span className="ml-2 text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-bold">
                      {(vessel as any).shipments.length}
                    </span>
                  )}
                </div>
                {!(vessel as any).shipments || (vessel as any).shipments.length === 0 ? (
                  <span className="font-mono text-xs text-zinc-500 italic">Belum ada muatan dari customer</span>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                    {(vessel as any).shipments.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between bg-black/30 rounded px-2 py-1.5 border border-white/5">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{s.title}</p>
                          <p className="text-zinc-500 text-[10px] font-mono truncate">
                            {s.origin} → {s.destination} • {s.weight}Kg • {s.customer?.name || 'N/A'}
                          </p>
                        </div>
                        <span className={`ml-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          s.status === 'IN_TRANSIT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          s.status === 'ARRIVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          'bg-primary/20 text-primary border border-primary/30'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
