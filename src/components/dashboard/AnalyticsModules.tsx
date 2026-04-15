import React from 'react';
import { Calendar, Users, Wrench, ShieldAlert } from 'lucide-react';

export const MaintenanceModule = () => {
  return (
    <div className="bg-[#121217] rounded-xl p-4 border border-amber-500/30 glow-border h-[250px] flex flex-col">
      <h3 className="text-zinc-400 font-mono text-sm mb-4 flex items-center">
        <Wrench size={16} className="mr-2 text-amber-500" />
        MAINTENANCE SCHEDULE
      </h3>
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {[
          { name: 'Prime Alpha', date: 'In 2 days', type: 'Engine Check', urgent: true },
          { name: 'Titan Freight', date: 'In 14 days', type: 'Hull Cleaning', urgent: false },
          { name: 'Ocean Voyager', date: 'In 30 days', type: 'Routine Inspection', urgent: false },
        ].map((item, i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div>
              <div className="font-bold text-sm">{item.name}</div>
              <div className="text-xs font-mono text-zinc-500 mt-1">{item.type}</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className={`text-xs font-mono font-bold ${item.urgent ? 'text-amber-500' : 'text-zinc-400'}`}>
                {item.date}
              </span>
              {item.urgent && <ShieldAlert size={12} className="text-amber-500 mt-1 animate-pulse" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CrewLogsModule = () => {
  const [crews, setCrews] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/crew')
      .then(res => res.json())
      .then(data => {
        if (data.crew) setCrews(data.crew);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="bg-[#121217] rounded-xl p-4 border border-blue-500/30 glow-border h-[250px] flex flex-col">
      <h3 className="text-zinc-400 font-mono text-sm mb-4 flex items-center">
        <Users size={16} className="mr-2 text-blue-500" />
        ACTIVE CREW LOGS
      </h3>
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {crews.length === 0 ? (
          <div className="text-zinc-500 text-xs font-mono h-full flex items-center justify-center">No crew active.</div>
        ) : crews.map((crew, i) => (
          <div key={i} className="flex flex-col p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-blue-100">{crew.name}</span>
              <span className="text-xs font-mono text-blue-400/70">{crew.position}</span>
            </div>
            <div className="text-xs text-zinc-400">
              Assigned to <span className="text-zinc-600 mx-1">•</span> <span className="font-mono text-primary font-bold">{crew.vessel?.name || 'STANDBY'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
