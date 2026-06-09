"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from '@/hooks/useSession';
import { Megamenu } from '@/components/layout/Megamenu';
import { ShieldAlert, Users, Anchor, BrainCircuit, Ship, Package } from 'lucide-react';
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
  const [aiReport, setAiReport] = useState<string | null>(null);
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
                 <div className="bg-[#0d0d12] rounded-xl border border-primary/20 overflow-hidden">
                   {/* Terminal Header */}
                   <div className="flex items-center justify-between px-5 py-3 bg-black/60 border-b border-white/5">
                     <div className="flex items-center space-x-2">
                       <div className="w-3 h-3 rounded-full bg-red-500/80" />
                       <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                       <div className="w-3 h-3 rounded-full bg-green-500/80" />
                     </div>
                     <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Gemini AI Report • Fleet Analytics</span>
                     <span className="text-[10px] font-mono text-primary">✓ Complete</span>
                   </div>

                   {/* Report Body */}
                   <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                     <div className="font-mono text-sm leading-7 text-zinc-300 whitespace-pre-wrap">
                       {aiReport.split('\n').map((line, i) => {
                         // Section headers (lines starting with ##, **, or all caps)
                         if (line.match(/^#{1,3}\s/) || line.match(/^\*\*.+\*\*$/)) {
                           const cleanLine = line.replace(/^#{1,3}\s/, '').replace(/\*\*/g, '');
                           return (
                             <div key={i} className="text-primary font-bold text-base mt-4 mb-2 flex items-center border-b border-primary/20 pb-2">
                               <span className="w-1 h-4 bg-primary rounded-full mr-3 shrink-0" />
                               {cleanLine}
                             </div>
                           );
                         }
                         // Bullet points
                         if (line.match(/^\s*[-•]\s/)) {
                           return (
                             <div key={i} className="flex items-start pl-4 py-0.5">
                               <span className="text-primary mr-2 mt-1 shrink-0">›</span>
                               <span className="text-zinc-300">{line.replace(/^\s*[-•]\s/, '')}</span>
                             </div>
                           );
                         }
                         // Numbered points
                         if (line.match(/^\s*\d+\.\s/)) {
                           return (
                             <div key={i} className="flex items-start pl-4 py-0.5">
                               <span className="text-emerald-400 mr-2 shrink-0 font-bold">{line.match(/^\s*(\d+)\./)?.[1]}.</span>
                               <span className="text-zinc-300">{line.replace(/^\s*\d+\.\s/, '')}</span>
                             </div>
                           );
                         }
                         // Empty lines
                         if (line.trim() === '') return <div key={i} className="h-3" />;
                         // Normal text
                         return <div key={i} className="text-zinc-400">{line}</div>;
                       })}
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
