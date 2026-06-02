"use client"
import React, { useState, useEffect } from 'react';
import { Ship, AlertTriangle, CloudRain, ShieldAlert, CheckCircle2, ArrowRight, Loader2, Navigation, Package, MapPin, Power, Crosshair, ShieldCheck } from 'lucide-react';
import { Megamenu } from '@/components/layout/Megamenu';
import { useRouter } from 'next/navigation';

export default function CrewDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sosLoading, setSosLoading] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  
  // Quick Logbook States
  const [weatherOpt, setWeatherOpt] = useState('Cerah');
  const [waveOpt, setWaveOpt] = useState('Tenang (< 1m)');
  const [speedOpt, setSpeedOpt] = useState('Normal (14-16 knots)');
  const [notesInput, setNotesInput] = useState('');
  
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  
  // Custom Modals
  const [showSOSConfirm, setShowSOSConfirm] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);

  // Live GPS State
  const [liveCoords, setLiveCoords] = useState({ lat: 0, lng: 0 });

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/crew/dashboard');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const json = await res.json();
      if (json.crew) {
        setData(json.crew);
        // Set initial coords if available
        if (json.crew.vessel?.logs?.[0]) {
           setLiveCoords({ lat: json.crew.vessel.logs[0].lat, lng: json.crew.vessel.logs[0].lng });
        }
      } else {
        setError(json.error || 'Gagal memuat profil kru');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000); // Polling every 5s for responses

    // Simulate Live GPS Drift for immersion
    let animFrame: number;
    const start = Date.now();
    const driftGPS = () => {
      setLiveCoords(prev => {
         if (prev.lat === 0 && prev.lng === 0) return prev;
         const elapsed = (Date.now() - start) / 1000;
         return {
            lat: prev.lat + Math.sin(elapsed) * 0.000005,
            lng: prev.lng + Math.cos(elapsed) * 0.000005
         };
      });
      animFrame = requestAnimationFrame(driftGPS);
    };
    driftGPS();

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animFrame);
    };
  }, [router]);

  const handleUpdateShipment = async (shipmentId: string, newStatus: string) => {
    setUpdateLoading(shipmentId);
    try {
      const res = await fetch('/api/crew/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SHIPMENT',
          shipmentId,
          newStatus,
          location: data?.vessel?.route?.name || 'Di Perairan'
        })
      });
      if (res.ok) {
        fetchDashboard();
      } else {
        alert('Gagal mengupdate muatan');
      }
    } catch (e) {
      alert('Terjadi kesalahan');
    }
    setUpdateLoading(null);
  };

  const triggerSOSConfirm = () => {
    setShowSOSConfirm(true);
  };

  const executeSOS = async () => {
    setShowSOSConfirm(false);
    setSosLoading(true);
    try {
      const res = await fetch('/api/crew/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SOS', incident: 'Kondisi Darurat (Sinyal SOS dari Kru)' })
      });
      if (res.ok) {
        setSosSuccess(true);
        setTimeout(() => setSosSuccess(false), 4000);
      }
    } catch (e) {
      alert('Gagal mengirim SOS');
    }
    setSosLoading(false);
  };

  const handleLogWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogLoading(true);
    
    const combinedLog = `Cuaca: ${weatherOpt} | Ombak: ${waveOpt} | Kcp: ${speedOpt}${notesInput ? ' | Catatan: ' + notesInput : ''}`;
    
    try {
      const res = await fetch('/api/crew/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'WEATHER_LOG', incident: combinedLog })
      });
      if (res.ok) {
        setNotesInput('');
        alert('Logbook berhasil dicatat!');
      }
    } catch (e) {
      alert('Gagal mencatat log');
    }
    setLogLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </main>
    );
  }

  if (error || !data || !data.vessel) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <Megamenu />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <AlertTriangle size={64} className="mx-auto text-amber-500 mb-6" />
          <h1 className="text-3xl font-bold font-mono uppercase tracking-widest mb-4">Akses Ditolak</h1>
          <p className="text-zinc-400 font-mono">{error || 'Anda belum di-assign ke armada kapal manapun. Silakan hubungi Administrator.'}</p>
        </div>
      </main>
    );
  }

  const vessel = data.vessel;
  const shipments = vessel?.shipments || [];
  
  const latestLog = vessel.logs?.[0];
  const isSOSActive = latestLog?.incident?.includes('EMERGENCY') && !latestLog?.incident?.includes('[RESPONDED');
  const isResponded = latestLog?.incident?.includes('[RESPONDED');
  
  let responseText = '';
  if (isResponded) {
     const match = latestLog.incident.match(/\[RESPONDED:\s*(.*?)\]/);
     if (match && match[1]) responseText = match[1];
  }

  return (
    <main className={`min-h-screen ${isSOSActive ? 'bg-red-950/20 shadow-[inset_0_0_100px_rgba(239,68,68,0.15)] animate-pulse' : 'bg-[#050505]'} text-white transition-colors duration-1000`}>
      <Megamenu />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header Profil */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded font-bold text-xs uppercase tracking-widest font-mono">
                {data.position}
              </span>
            </div>
            <h1 className="text-4xl font-bold font-sans tracking-wide">Selamat Bertugas, {data.name}</h1>
            <p className="text-zinc-400 mt-2 font-mono flex items-center gap-2">
              <Ship size={16} className="text-primary" /> Armada Aktif: <span className="text-white font-bold">{vessel.name}</span> ({vessel.type})
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <button 
              onClick={triggerSOSConfirm}
              disabled={sosLoading}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-2 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.8)] transition-all flex items-center justify-center gap-2 tracking-widest animate-pulse"
            >
              <ShieldAlert size={18} />
              {sosLoading ? 'MENGIRIM...' : 'KIRIM SOS'}
            </button>
            <button onClick={() => {
              document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              router.push('/');
            }} className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors">
              <Power size={18} /> <span className="font-mono text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* LIVE GPS HUD */}
        <div className="mb-6 bg-[#121217]/80 backdrop-blur-md border border-white/10 rounded-xl p-3 glow-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crosshair className="text-primary animate-spin-slow" size={24} />
            <div>
              <div className="text-[10px] text-primary font-bold font-mono tracking-widest uppercase">Live GPS Coordinates</div>
              <div className="font-mono text-sm font-bold tracking-wider">
                {liveCoords.lat === 0 ? 'CALIBRATING...' : `${Math.abs(liveCoords.lat).toFixed(6)}° ${liveCoords.lat >= 0 ? 'N' : 'S'} | ${Math.abs(liveCoords.lng).toFixed(6)}° ${liveCoords.lng >= 0 ? 'E' : 'W'}`}
              </div>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[10px] text-zinc-500 font-bold font-mono tracking-widest uppercase">SAT-LINK</div>
            <div className="text-green-400 font-mono text-xs font-bold animate-pulse">CONNECTED</div>
          </div>
        </div>

        {/* SOS RESPONSE BANNER */}
        {isResponded && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 flex items-start gap-4">
            <div className="p-2 bg-emerald-500/20 rounded-full shrink-0">
              <ShieldCheck className="text-emerald-400" size={24} />
            </div>
            <div>
              <h3 className="text-emerald-400 font-bold font-mono text-sm tracking-widest uppercase mb-1">Pusat Merespons SOS</h3>
              <p className="text-sm font-sans text-emerald-100/90 leading-relaxed">
                Bantuan telah diotorisasi dan diluncurkan. <strong>Tindakan: {responseText}</strong>. Harap pastikan keselamatan kru hingga bantuan tiba.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column - Cargo Manifest */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 glow-border">
              <h2 className="text-xl font-bold mb-6 flex items-center pb-4 border-b border-white/10">
                <Package className="mr-3 text-primary" size={24} />
                Manifest Kargo ({shipments.length})
              </h2>

              {shipments.length === 0 ? (
                <div className="text-center py-10 border border-white/5 border-dashed rounded-xl bg-black/30">
                  <Package size={48} className="mx-auto text-zinc-600 mb-4" />
                  <p className="text-zinc-500 font-mono text-sm">Tidak ada muatan aktif di kapal ini.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shipments.map((s: any) => (
                    <div key={s.id} className="bg-black/40 border border-white/5 rounded-xl p-5 hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{s.title}</h3>
                          <p className="text-xs text-zinc-500 font-mono">RESI: {s.id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold font-mono tracking-widest uppercase border ${
                          s.status === 'IN_TRANSIT' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-zinc-400 mb-5 pb-4 border-b border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-600 font-mono uppercase">Origin</span>
                          <span className="font-medium text-white flex items-center gap-1 mt-0.5"><MapPin size={12} className="text-green-400"/> {s.origin}</span>
                        </div>
                        <ArrowRight size={14} className="text-zinc-600" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-600 font-mono uppercase">Dest</span>
                          <span className="font-medium text-white flex items-center gap-1 mt-0.5"><Navigation size={12} className="text-red-400"/> {s.destination}</span>
                        </div>
                        <div className="flex flex-col ml-auto text-right">
                          <span className="text-[10px] text-zinc-600 font-mono uppercase">Berat/Tipe</span>
                          <span className="font-medium text-white mt-0.5">{s.weight} Kg • {s.type}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end">
                        {s.status === 'APPROVED' && (
                          <button 
                            disabled={updateLoading === s.id}
                            onClick={() => handleUpdateShipment(s.id, 'IN_TRANSIT')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold font-mono text-xs tracking-wide transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
                          >
                            {updateLoading === s.id ? 'Memproses...' : 'BERANGKAT (IN TRANSIT)'}
                          </button>
                        )}
                        {s.status === 'IN_TRANSIT' && (
                          <button 
                            disabled={updateLoading === s.id}
                            onClick={() => handleUpdateShipment(s.id, 'ARRIVED')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold font-mono text-xs tracking-wide transition-all shadow-[0_0_15px_rgba(5,150,105,0.3)] flex items-center gap-2 disabled:opacity-50"
                          >
                            {updateLoading === s.id ? 'Memproses...' : <><CheckCircle2 size={14} /> TIBA DI TUJUAN</>}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Logbook & SOS */}
          <div className="space-y-6">
            {/* Weather & Logbook */}
            <div className="bg-[#121217] border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-5">
                <CloudRain size={16} className="text-primary" /> Digital Logbook
              </h3>
              <form onSubmit={handleLogWeather} className="space-y-5">
                
                {/* Cuaca */}
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 block">Kondisi Cuaca</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Cerah', 'Berawan', 'Hujan', 'Badai'].map(opt => (
                      <button key={opt} type="button" onClick={() => setWeatherOpt(opt)} className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-colors border ${weatherOpt === opt ? 'bg-primary/20 text-primary border-primary/50' : 'bg-black/30 text-zinc-500 border-white/5 hover:border-white/20'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ombak */}
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 block">Tinggi Ombak</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Tenang (< 1m)', 'Sedang (1-2m)', 'Tinggi (> 2m)'].map(opt => (
                      <button key={opt} type="button" onClick={() => setWaveOpt(opt)} className={`py-1.5 px-2 rounded-lg text-[10px] font-bold font-mono transition-colors border ${waveOpt === opt ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-black/30 text-zinc-500 border-white/5 hover:border-white/20'}`}>
                        {opt.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Kecepatan */}
                <div>
                  <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 block">Kecepatan Rata-rata</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Lambat (< 10 knots)', 'Normal (14-16 knots)', 'Cepat (> 18 knots)', 'Berhenti (0 knots)'].map(opt => (
                      <button key={opt} type="button" onClick={() => setSpeedOpt(opt)} className={`py-1.5 px-2 rounded-lg text-[10px] font-bold font-mono transition-colors border ${speedOpt === opt ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-black/30 text-zinc-500 border-white/5 hover:border-white/20'}`}>
                        {opt.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2 block">Catatan Tambahan (Opsional)</label>
                  <textarea 
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    rows={2}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary resize-none placeholder:text-zinc-700 font-mono"
                    placeholder="Ketikan rincian singkat jika perlu..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={logLoading}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold font-mono text-xs py-3 rounded-xl transition-all tracking-widest uppercase disabled:opacity-50"
                >
                  {logLoading ? 'Menyimpan...' : 'Catat Log Harian'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* SOS Confirmation Modal */}
      {showSOSConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121217] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
                <AlertTriangle size={32} className="text-red-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Konfirmasi SOS</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Anda akan mengirimkan sinyal bahaya (EMERGENCY) ke Pusat Pemantauan. Alarm akan berbunyi di seluruh dasbor komando. Apakah Anda yakin?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowSOSConfirm(false)}
                  className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  BATAL
                </button>
                <button 
                  onClick={executeSOS}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
                >
                  KIRIM SOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOS Success Toast */}
      {sosSuccess && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-500 text-white px-6 py-4 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-in slide-in-from-bottom-10 fade-in duration-300">
          <AlertTriangle size={20} className="animate-pulse" />
          <span className="font-bold text-sm tracking-wide uppercase">Sinyal Darurat Terkirim!</span>
        </div>
      )}

    </main>
  );
}
