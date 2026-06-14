"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from '@/hooks/useSession';
import { Megamenu } from '@/components/layout/Megamenu';
import { ShieldAlert, Users, Anchor, BrainCircuit, Ship, Package, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserCrud } from '@/components/admin/UserCrud';
import { CrewCrud } from '@/components/admin/CrewCrud';
import { BookingCrud } from '@/components/admin/BookingCrud';
import { VesselCrud } from '@/components/admin/VesselCrud';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

export default function AdminDashboard() {
  const { session, loading } = useSession();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['users', 'crew', 'reports', 'bookings', 'vessels'].includes(tab)) {
         setActiveTab(tab);
      }
    }
  }, []);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const handleMenuClick = (key: string, action: string) => {
    if (key === 'admin') setActiveTab(action);
  };

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe: 'mingguan' })
      });
      const data = await res.json();
      if (data.success) {
        setAiReport(data.report);
        toast.success("Report generated successfully");
      } else {
        toast.error(data.error || "Gagal meng-generate report");
      }
    } catch (e) {
      toast.error("Error generating report");
    }
    setReportLoading(false);
  };

  if (loading) return <div className="h-screen w-full flex bg-[#0a0a0c] text-white justify-center items-center">Loading...</div>;

  if (!session || session.role !== 'ADMIN') {
    return (
      <div className="h-screen w-full bg-[#0a0a0c] flex flex-col justify-center items-center text-red-500">
        <ShieldAlert size={64} className="mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold font-mono">UNAUTHORIZED ACCESS</h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white overflow-x-hidden selection:bg-primary/50">
      <Megamenu onMenuClick={handleMenuClick} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold font-mono mb-8 flex items-center text-primary shadow-neon-text">
          <ShieldAlert className="mr-3" /> ADMIN CENTER
        </h1>

        <div className="flex border-b border-white/10 mb-8 space-x-8">
          <button 
            onClick={() => setActiveTab('users')} 
            className={`pb-4 px-2 font-mono uppercase tracking-wider transition-colors ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-zinc-500 hover:text-white'}`}
          >
            <Users size={16} className="inline mr-2" /> Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('crew')} 
            className={`pb-4 px-2 font-mono uppercase tracking-wider transition-colors ${activeTab === 'crew' ? 'border-b-2 border-primary text-primary' : 'text-zinc-500 hover:text-white'}`}
          >
            <Anchor size={16} className="inline mr-2" /> Crew Assignments
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`pb-4 px-2 font-mono uppercase tracking-wider transition-colors ${activeTab === 'reports' ? 'border-b-2 border-primary text-primary' : 'text-zinc-500 hover:text-white'}`}
          >
            <BrainCircuit size={16} className="inline mr-2" /> AI Reports
          </button>
          <button 
            onClick={() => setActiveTab('vessels')} 
            className={`pb-4 px-2 font-mono uppercase tracking-wider transition-colors ${activeTab === 'vessels' ? 'border-b-2 border-primary text-primary' : 'text-zinc-500 hover:text-white'}`}
          >
            <Ship size={16} className="inline mr-2" /> Armada
          </button>
          <button 
            onClick={() => setActiveTab('bookings')} 
            className={`pb-4 px-2 font-mono uppercase tracking-wider transition-colors ${activeTab === 'bookings' ? 'border-b-2 border-primary text-primary' : 'text-zinc-500 hover:text-white'}`}
          >
            <Package size={16} className="inline mr-2" /> Bookings
          </button>
        </div>

        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-[#121217] rounded-xl p-6 border border-primary/20 glow-border"
        >
           {activeTab === 'users' && (
             <div>
               <h2 className="text-xl font-bold mb-4 text-white">System Users</h2>
               <p className="text-zinc-400 mb-6 text-sm">Create, edit, or remove operator accounts.</p>
               <Suspense fallback={<TableSkeleton rows={5} columns={4} />}>
                 <UserCrud />
               </Suspense>
             </div>
           )}

           {activeTab === 'crew' && (
             <div>
               <h2 className="text-xl font-bold mb-4 text-white">Crew Roster</h2>
               <p className="text-zinc-400 mb-6 text-sm">Assign captains and engineers to specific vessels.</p>
               <Suspense fallback={<TableSkeleton rows={5} columns={4} />}>
                 <CrewCrud />
               </Suspense>
             </div>
           )}

           {activeTab === 'reports' && (
             <div className="space-y-6">
               {/* Header Section */}
               <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-[#1a1a24] to-blue-500/10 border border-primary/30 p-6">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                 <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                   <div>
                     <h2 className="text-2xl font-bold text-white flex items-center">
                       <BrainCircuit size={24} className="mr-3 text-primary" />
                       AI Studio Analytics
                     </h2>
                     <p className="text-zinc-400 text-sm mt-2 max-w-lg">
                       Powered by Gemini AI — Analisis otomatis performa armada, efisiensi bahan bakar, dan optimasi rute pelayaran.
                     </p>
                   </div>
                   <button 
                     onClick={generateReport}
                     disabled={reportLoading}
                     className="group relative px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                   >
                     <span className="flex items-center">
                       {reportLoading ? (
                         <>
                           <motion.div
                             animate={{ rotate: 360 }}
                             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                             className="mr-2"
                           >
                             <BrainCircuit size={16} />
                           </motion.div>
                           Analyzing...
                         </>
                       ) : (
                         <>
                           <BrainCircuit size={16} className="mr-2" />
                           Generate Report
                         </>
                       )}
                     </span>
                   </button>
                 </div>
               </div>
               
               {/* Report Content */}
               {reportLoading ? (
                 <div className="bg-[#0d0d12] rounded-xl border border-primary/20 p-8">
                   <div className="flex items-center mb-6">
                     <motion.div
                       animate={{ opacity: [0.3, 1, 0.3] }}
                       transition={{ duration: 2, repeat: Infinity }}
                       className="w-2 h-2 rounded-full bg-primary mr-3"
                     />
                     <span className="text-xs text-primary font-mono uppercase tracking-widest">AI Processing...</span>
                   </div>
                   <div className="space-y-4 animate-pulse">
                     <div className="h-4 bg-zinc-800/60 rounded w-3/4" />
                     <div className="h-4 bg-zinc-800/40 rounded w-full" />
                     <div className="h-4 bg-zinc-800/50 rounded w-5/6" />
                     <div className="h-4 bg-zinc-800/30 rounded w-2/3" />
                     <div className="h-4 bg-zinc-800/40 rounded w-full" />
                     <div className="h-4 bg-zinc-800/50 rounded w-4/5" />
                   </div>
                 </div>
               ) : aiReport ? (
                 <div className="space-y-6">
                   {/* Ringkasan Eksekutif */}
                   <div className="bg-[#0d0d12] rounded-xl border border-primary/30 overflow-hidden glow-border">
                     <div className="flex items-center px-5 py-3 bg-primary/10 border-b border-primary/20">
                       <BrainCircuit size={18} className="text-primary mr-3" />
                       <h3 className="font-bold text-primary font-mono tracking-widest uppercase text-sm">Ringkasan Eksekutif</h3>
                     </div>
                     <div className="p-5 text-zinc-300 font-sans leading-relaxed text-sm">
                       {aiReport.ringkasanEksekutif || "Tidak ada ringkasan tersedia."}
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Analisis Bahan Bakar */}
                     <div className="bg-[#0d0d12] rounded-xl border border-blue-500/30 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.15)] flex flex-col">
                       <div className="flex items-center px-5 py-3 bg-blue-500/10 border-b border-blue-500/20">
                         <Zap size={18} className="text-blue-400 mr-3" />
                         <h3 className="font-bold text-blue-400 font-mono tracking-widest uppercase text-sm">Analisis Bahan Bakar</h3>
                       </div>
                       <div className="p-5 flex-1">
                         <ul className="space-y-3">
                           {aiReport.analisisBahanBakar?.map((item: string, i: number) => (
                             <li key={i} className="flex items-start text-zinc-300 text-sm">
                               <span className="text-blue-500 mr-3 mt-0.5 font-bold">›</span>
                               <span>{item}</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                     </div>

                     {/* Performa Kapal */}
                     <div className="bg-[#0d0d12] rounded-xl border border-emerald-500/30 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.15)] flex flex-col">
                       <div className="flex items-center px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                         <Ship size={18} className="text-emerald-400 mr-3" />
                         <h3 className="font-bold text-emerald-400 font-mono tracking-widest uppercase text-sm">Performa Armada</h3>
                       </div>
                       <div className="p-5 flex-1">
                         <ul className="space-y-3">
                           {aiReport.performaKapal?.map((item: string, i: number) => (
                             <li key={i} className="flex items-start text-zinc-300 text-sm">
                               <span className="text-emerald-500 mr-3 mt-0.5 font-bold">›</span>
                               <span>{item}</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                     </div>
                   </div>

                   {/* Insiden & SOS */}
                   <div className="bg-[#0d0d12] rounded-xl border border-red-500/30 overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                     <div className="flex items-center px-5 py-3 bg-red-500/10 border-b border-red-500/20">
                       <ShieldAlert size={18} className="text-red-400 mr-3" />
                       <h3 className="font-bold text-red-400 font-mono tracking-widest uppercase text-sm">Insiden & SOS</h3>
                     </div>
                     <div className="p-5">
                       <ul className="space-y-3">
                         {aiReport.insidenDanSos?.map((item: string, i: number) => (
                           <li key={i} className="flex items-start text-zinc-300 text-sm">
                             <span className="text-red-500 mr-3 mt-0.5 font-bold">›</span>
                             <span>{item}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   </div>

                   {/* Rekomendasi */}
                   <div className="bg-[#0d0d12] rounded-xl border border-amber-500/30 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                     <div className="flex items-center px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
                       <BrainCircuit size={18} className="text-amber-400 mr-3" />
                       <h3 className="font-bold text-amber-400 font-mono tracking-widest uppercase text-sm">Rekomendasi Strategis</h3>
                     </div>
                     <div className="p-5">
                       <ul className="space-y-3">
                         {aiReport.rekomendasi?.map((item: string, i: number) => (
                           <li key={i} className="flex items-start text-zinc-300 text-sm">
                             <span className="text-amber-500 mr-3 mt-0.5 font-bold">›</span>
                             <span>{item}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   </div>
                 </div>
               ) : (
                 /* Empty State */
                 <div className="relative bg-[#0d0d12] rounded-xl border border-white/5 py-20 flex flex-col items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.03)_0%,transparent_70%)]" />
                   <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                     className="relative mb-6"
                   >
                     <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800" />
                     <BrainCircuit size={28} className="absolute inset-0 m-auto text-zinc-700" />
                   </motion.div>
                   <h3 className="text-lg font-bold text-zinc-500 mb-2">Belum Ada Laporan</h3>
                   <p className="text-zinc-600 text-sm max-w-md text-center font-sans">
                     Klik tombol <span className="text-primary font-semibold">"Generate Report"</span> di atas untuk memulai analisis kinerja armada secara otomatis menggunakan AI.
                   </p>
                 </div>
               )}
             </div>
           )}

           {activeTab === 'vessels' && (
             <div>
               <Suspense fallback={<TableSkeleton rows={5} columns={6} />}>
                 <VesselCrud />
               </Suspense>
             </div>
           )}

           {activeTab === 'bookings' && (
             <div>
               <Suspense fallback={<TableSkeleton rows={5} columns={5} />}>
                 <BookingCrud />
               </Suspense>
             </div>
           )}
        </motion.div>
      </div>
    </main>
  );
}
