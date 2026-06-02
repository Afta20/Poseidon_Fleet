"use client"
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, Info } from 'lucide-react';

interface Log {
  id: string;
  timestamp: string;
  incident: string | null;
  vessel: { name: string; type: string };
  vesselId: string;
}

export const LiveLogsFeed = ({ onSelectVessel }: { onSelectVessel?: (id: string) => void }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs/latest');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        
        // Check for unresponded SOS (UI only, Alarm is handled by GlobalSOSAlert)
        const hasUnrespondedSOS = data.logs.some((l: Log) => 
           l.incident?.includes('EMERGENCY') && !l.incident?.includes('[RESPONDED')
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const int = setInterval(fetchLogs, 5000);
    return () => clearInterval(int);
  }, []);
  const handleRespond = async (logId: string, responseType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/logs/latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, responseType })
      });
      if (res.ok) {
        fetchLogs(); // refresh immediately
      }
    } catch (err) {
      console.error(err);
    }
  };

  const RESPONSE_OPTIONS = [
    { label: 'Helikopter SAR', icon: '🚁', color: 'bg-emerald-500' },
    { label: 'Kirim Tugboat', icon: '🚤', color: 'bg-blue-500' },
    { label: 'Coast Guard', icon: '🛡️', color: 'bg-indigo-500' },
    { label: 'Evakuasi', icon: '⚓', color: 'bg-orange-500' }
  ];

  return (
    <div className="bg-[#121217] border border-white/10 rounded-2xl glow-border flex flex-col h-full">
      <div className="p-5 border-b border-white/5">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Info className="text-primary" size={20} />
          Live Captain's Log
        </h2>
        <p className="text-xs text-zinc-500 font-mono mt-1">Real-time updates dari seluruh armada</p>
      </div>
      
      <div className="p-4 overflow-y-auto max-h-[400px] flex-1 space-y-3 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-center text-zinc-600 font-mono text-xs py-8">
            Belum ada catatan log terbaru.
          </div>
        ) : (
          logs.map(log => {
            const isSOS = log.incident?.includes('EMERGENCY');
            const isResponded = log.incident?.includes('[RESPONDED');
            
            // Extract response text if present: e.g. [RESPONDED: Helikopter SAR]
            let responseText = 'Bantuan telah dikirim';
            if (isResponded) {
               const match = log.incident?.match(/\[RESPONDED:\s*(.*?)\]/);
               if (match && match[1]) {
                  responseText = match[1];
               }
            }

            let bgClass = 'bg-black/40 border-white/5 hover:border-white/10';
            if (isSOS) {
               if (isResponded) {
                  bgClass = 'bg-red-500/5 border-red-500/10 opacity-70';
               } else {
                  bgClass = 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
               }
            }

            return (
              <div 
                key={log.id} 
                onClick={() => onSelectVessel && onSelectVessel(log.vesselId)}
                className={`p-3 rounded-lg border text-sm font-mono transition-all cursor-pointer ${bgClass}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold uppercase tracking-widest text-[10px] ${isSOS ? (isResponded ? 'text-red-400/50' : 'text-red-400') : 'text-primary'}`}>
                    {log.vessel.name}
                  </span>
                  <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {isSOS ? (
                  <div className="space-y-2">
                    <div className={`${isResponded ? 'text-red-300/50' : 'text-red-300'} text-xs font-sans font-medium flex gap-2 items-start`}>
                      <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${!isResponded ? 'animate-pulse' : ''}`} />
                      <span>{log.incident?.replace('EMERGENCY: ', '').replace(/\[RESPONDED.*?\]/g, '')}</span>
                    </div>
                    {isResponded ? (
                      <div className="text-[10px] text-green-400/80 font-bold bg-green-500/10 px-2 py-1 rounded inline-block">
                        ✓ Bantuan: {responseText}
                      </div>
                    ) : (
                      <div className="pt-2">
                        <div className="text-[9px] text-zinc-500 mb-1">PILIH TINDAKAN RESPON:</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {RESPONSE_OPTIONS.map(opt => (
                            <button 
                              key={opt.label}
                              onClick={(e) => handleRespond(log.id, opt.label, e)}
                              className={`text-[9px] ${opt.color} hover:opacity-80 text-white px-2 py-1.5 rounded font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1`}
                            >
                              <span>{opt.icon}</span> {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-zinc-300 text-xs font-sans leading-relaxed">
                    {log.incident || 'Laporan rutin dikirim tanpa catatan khusus.'}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
