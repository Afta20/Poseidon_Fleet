"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Map as MapIcon, BarChart3, ChevronDown, Anchor, Compass, Navigation } from 'lucide-react';
import Link from 'next/link';

const MENU_ITEMS = [
  {
    key: 'fleet',
    label: 'Fleet',
    icon: <Ship size={18} className="mr-2" />,
    submenus: [
      { label: 'Tanker Vessels', icon: <Anchor size={14} className="mr-2" /> },
      { label: 'Cargo Vessels', icon: <Anchor size={14} className="mr-2" /> },
      { label: 'Passenger Lines', icon: <Anchor size={14} className="mr-2" /> },
    ]
  },
  {
    key: 'map',
    label: 'Map',
    icon: <MapIcon size={18} className="mr-2" />,
    submenus: [
      { label: 'Regional View', icon: <Compass size={14} className="mr-2" /> },
      { label: 'Weather Overlay', icon: <Compass size={14} className="mr-2" /> },
      { label: 'Traffic Density', icon: <Compass size={14} className="mr-2" /> },
    ]
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 size={18} className="mr-2" />,
    submenus: [
      { label: 'Fuel Efficiency', icon: <Navigation size={14} className="mr-2" /> },
      { label: 'Maintenance Schedule', icon: <Navigation size={14} className="mr-2" /> },
      { label: 'Crew Logs', icon: <Navigation size={14} className="mr-2" /> },
    ]
  }
];

export const Megamenu = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="relative z-50 w-full bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/10 text-white shadow-neon-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            >
              <Compass className="text-primary glow-border rounded-full" size={24} />
            </motion.div>
            <span className="font-sans font-bold text-xl tracking-widest text-[#f4f4f5] shadow-neon-text">
              UMKM<span className="text-primary font-mono ml-1">UNYU-UNYU</span>
            </span>
          </div>

          <div className="hidden md:flex items-center h-full space-x-1">
            {MENU_ITEMS.map((item) => (
              <div 
                key={item.key} 
                className="h-full relative flex items-center px-4 cursor-pointer"
                onMouseEnter={() => setActiveMenu(item.key)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link href={`/${item.key}`} className={`flex items-center transition-colors duration-200 ${activeMenu === item.key ? 'text-primary' : 'text-gray-300 hover:text-white'}`}>
                  {item.icon}
                  <span className="font-semibold">{item.label}</span>
                  <ChevronDown size={14} className={`ml-1 transition-transform ${activeMenu === item.key ? 'rotate-180' : ''}`} />
                </Link>

                {/* Animated Bottom Border Glow */}
                {activeMenu === item.key && (
                  <motion.div
                    layoutId="megamenu-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, boxShadow: '0 0 8px #a855f7' }}
                    exit={{ opacity: 0 }}
                  />
                )}

                {/* Megamenu Dropdown */}
                <AnimatePresence>
                  {activeMenu === item.key && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-16 left-1/2 -translate-x-1/2 w-64 bg-[#121217] border border-primary/40 rounded-lg p-4 glow-border"
                    >
                      <ul className="space-y-3">
                        {item.submenus.map((sub, idx) => (
                          <li key={idx} className="flex items-center text-gray-300 hover:text-primary transition-colors cursor-pointer group">
                            <span className="p-1 rounded-md bg-white/5 group-hover:bg-primary/20 mr-3">
                              {sub.icon}
                            </span>
                            <span className="font-mono text-sm">{sub.label}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
