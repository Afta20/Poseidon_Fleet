"use client"
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { time: '00:00', totalFuel: 85 },
  { time: '04:00', totalFuel: 82 },
  { time: '08:00', totalFuel: 78 },
  { time: '12:00', totalFuel: 75 },
  { time: '16:00', totalFuel: 70 },
  { time: '20:00', totalFuel: 68 },
  { time: '24:00', totalFuel: 65 },
];

export const FuelChart = () => {
  return (
    <div className="w-full h-[300px] bg-[#121217] rounded-xl p-4 border border-white/5 glow-border">
      <div className="mb-4">
        <h3 className="text-white font-bold tracking-wide">Fleet Fuel Consumption</h3>
        <p className="text-zinc-500 font-mono text-xs">Past 24 Hours</p>
      </div>
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={mockData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="#52525b" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0a0a0c', borderColor: '#a855f7', borderRadius: '8px' }}
              itemStyle={{ color: '#ffffff', fontFamily: 'monospace' }}
            />
            <Area 
              type="monotone" 
              dataKey="totalFuel" 
              stroke="#a855f7" 
              fillOpacity={1} 
              fill="url(#colorFuel)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
