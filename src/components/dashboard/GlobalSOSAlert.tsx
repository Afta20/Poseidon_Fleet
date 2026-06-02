import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface Log {
  id: string;
  incident: string | null;
  vesselId: string;
}

export const GlobalSOSAlert = ({ onGoToLogs }: { onGoToLogs: () => void }) => {
  const [hasSOS, setHasSOS] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs/latest');
      if (res.ok) {
        const data = await res.json();
        
        const unrespondedSOS = data.logs.some((l: Log) => 
           l.incident?.includes('EMERGENCY') && !l.incident?.includes('[RESPONDED')
        );

        if (unrespondedSOS) {
          setHasSOS(true);
          setIsExiting(false);
          if (!alarmIntervalRef.current) {
            playSOSAlarm(); // play immediately once
            alarmIntervalRef.current = setInterval(playSOSAlarm, 3000); // repeat every 3s
          }
        } else {
          if (alarmIntervalRef.current) {
             clearInterval(alarmIntervalRef.current);
             alarmIntervalRef.current = null;
          }
          // If we currently have SOS and it's resolved, trigger exit animation
          if (hasSOS && !isExiting) {
             setIsExiting(true);
             setTimeout(() => {
                setHasSOS(false);
                setIsExiting(false);
             }, 300); // match duration-300
          } else if (!hasSOS) {
             setHasSOS(false);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const int = setInterval(fetchLogs, 5000);
    return () => {
       clearInterval(int);
       if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, []);

  const playSOSAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBeep = (timeOffset: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + timeOffset + 0.3);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime + timeOffset);
        gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + timeOffset + 0.05);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + timeOffset + 0.3);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + timeOffset);
        osc.stop(audioCtx.currentTime + timeOffset + 0.3);
      };

      playBeep(0);
      playBeep(0.4);
      playBeep(0.8);
    } catch (e) {
      console.log('Audio autoplay blocked by browser.');
    }
  };

  if (!hasSOS && !isExiting) return null;

  return (
    <div className={`bg-red-600 border-b-4 border-red-800 px-6 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(239,68,68,0.4)] relative overflow-hidden animate-in fade-in slide-in-from-top-10 duration-300 ${isExiting ? 'animate-out fade-out slide-out-to-top-10 fill-mode-forwards' : ''}`}>
      {/* Background Pulse Effect */}
      <div className="absolute inset-0 bg-red-500 animate-pulse opacity-50 mix-blend-overlay"></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="bg-white/20 p-2 rounded-full border border-white/30 animate-bounce">
          <AlertTriangle size={32} className="text-white" />
        </div>
        <div>
          <h2 className="text-white font-black text-xl tracking-widest uppercase">Peringatan Darurat SOS!</h2>
          <p className="text-red-100 font-mono text-sm tracking-wider">Sebuah kapal memancarkan sinyal darurat dan membutuhkan respons segera.</p>
        </div>
      </div>

      <button 
        onClick={onGoToLogs}
        className="relative z-10 bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        Tanggapi Sekarang <ArrowRight size={18} />
      </button>
    </div>
  );
};
