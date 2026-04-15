"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { Megamenu } from '@/components/layout/Megamenu';
import { ShieldAlert, Users, Anchor, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserCrud } from '@/components/admin/UserCrud';
import { CrewCrud } from '@/components/admin/CrewCrud';
import { BookingCrud } from '@/components/admin/BookingCrud';
import { Package } from 'lucide-react';

export default function AdminDashboard() {
  const { session, loading } = useSession();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['users', 'crew', 'reports', 'bookings'].includes(tab)) {
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
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error generating report");
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
               <UserCrud />
             </div>
           )}

           {activeTab === 'crew' && (
             <div>
               <h2 className="text-xl font-bold mb-4 text-white">Crew Roster</h2>
               <p className="text-zinc-400 mb-6 text-sm">Assign captains and engineers to specific vessels.</p>
               <CrewCrud />
             </div>
           )}

           {activeTab === 'reports' && (
             <div>
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-white">AI Studio Analytics</h2>
                   <p className="text-zinc-400 text-sm">Generate automated insights on fuel and route performance.</p>
                 </div>
                 <button 
                   onClick={generateReport}
                   disabled={reportLoading}
                   className="bg-primary/20 hover:bg-primary/40 border border-primary text-primary px-6 py-2 rounded-lg font-mono font-bold uppercase transition flex items-center disabled:opacity-50"
                 >
                   {reportLoading ? 'Analyzing...' : 'Generate Report'}
                 </button>
               </div>
               
               {aiReport ? (
                 <div className="bg-black/40 p-6 rounded-lg font-mono text-sm leading-relaxed border border-primary/20 whitespace-pre-wrap text-emerald-400">
                   {aiReport}
                 </div>
               ) : (
                 <div className="bg-black/50 p-4 rounded-lg font-mono text-zinc-500 flex flex-col justify-center items-center py-20 border border-white/5">
                   <BrainCircuit size={48} className="mb-4 opacity-50" />
                   Awaiting analysis trigger.
                 </div>
               )}
             </div>
           )}

           {activeTab === 'bookings' && (
             <div>
               <BookingCrud />
             </div>
           )}
        </motion.div>
      </div>
    </main>
  );
}
