"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Map as MapIcon, BarChart3, ChevronDown, Anchor, Compass, Navigation, Calculator, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const MENU_ITEMS = [
  {
    key: 'fleet',
    label: 'Fleet',
    icon: <Ship size={18} className="mr-2" />,
    submenus: [
      { label: 'All Vessels', icon: <Anchor size={14} className="mr-2" />, action: 'all' },
      { label: 'Tanker Vessels', icon: <Anchor size={14} className="mr-2" />, action: 'Tanker' },
      { label: 'Cargo Vessels', icon: <Anchor size={14} className="mr-2" />, action: 'Cargo' },
      { label: 'Passenger Lines', icon: <Anchor size={14} className="mr-2" />, action: 'Passenger' },
    ]
  },
  {
    key: 'map',
    label: 'Map',
    icon: <MapIcon size={18} className="mr-2" />,
    submenus: [
      { label: 'Regional View', icon: <Compass size={14} className="mr-2" />, action: 'Regional View' },
      { label: 'Weather Overlay', icon: <Compass size={14} className="mr-2" />, action: 'Weather Overlay' },
      { label: 'Traffic Density', icon: <Compass size={14} className="mr-2" />, action: 'Traffic Density' },
    ]
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 size={18} className="mr-2" />,
    submenus: [
      { label: 'Fuel Efficiency', icon: <Navigation size={14} className="mr-2" />, action: 'Fuel Efficiency' },
      { label: 'Maintenance Schedule', icon: <Navigation size={14} className="mr-2" />, action: 'Maintenance' },
      { label: 'Crew Logs', icon: <Navigation size={14} className="mr-2" />, action: 'Crew Logs' },
    ]
  }
];

import { useSession } from '@/hooks/useSession';
import { UserCog } from 'lucide-react'; // Add icon for Admin
import { usePathname } from 'next/navigation';

interface MegamenuProps {
  onMenuClick?: (key: string, action: string) => void;
}

export const Megamenu: React.FC<MegamenuProps> = ({ onMenuClick }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { session } = useSession();
  const pathname = usePathname();

  // Build menu based on role — each role sees a COMPLETELY DIFFERENT interface
  let dynamicMenuItems: typeof MENU_ITEMS = [];

  if (pathname.startsWith('/admin')) {
    // Admin internal view
    dynamicMenuItems = [{
      key: 'dashboard',
      label: 'Kembali ke Dashboard',
      icon: <Navigation size={18} className="mr-2" />,
      submenus: []
    }];
  } else if (pathname.startsWith('/customer')) {
    // Customer portal menu
    dynamicMenuItems = [
      { key: 'customer', label: 'Dashboard Saya', icon: <Package size={18} className="mr-2" />, submenus: [] },
      { key: 'customer/booking', label: 'Pesan Pengiriman', icon: <Ship size={18} className="mr-2" />, submenus: [] },
      { key: 'calculator', label: 'Kalkulator Ongkir', icon: <Calculator size={18} className="mr-2" />, submenus: [] },
    ];
  } else if (session?.role === 'MONITORING' || (session?.role === 'ADMIN' && !pathname.startsWith('/admin'))) {
    // Monitoring dashboard menu (full fleet tools)
    dynamicMenuItems = [...MENU_ITEMS];
    if (session?.role === 'ADMIN') {
      dynamicMenuItems.push({
        key: 'admin',
        label: 'Admin Panel',
        icon: <UserCog size={18} className="mr-2" />,
        submenus: [
          { label: 'Manage Crew', icon: <Anchor size={14} className="mr-2" />, action: 'crew' },
          { label: 'Manage Users', icon: <MapIcon size={14} className="mr-2" />, action: 'users' },
          { label: 'Bookings / Kargo', icon: <Package size={14} className="mr-2" />, action: 'bookings' },
          { label: 'AI Reports', icon: <BarChart3 size={14} className="mr-2" />, action: 'reports' },
        ]
      });
    }
  } else {
    // Public / not logged in — landing page menu
    dynamicMenuItems = [
      { key: 'calculator', label: 'Estimasi Tarif', icon: <Calculator size={18} className="mr-2" />, submenus: [] },
    ];
    if (session?.role === 'CUSTOMER') {
      dynamicMenuItems.push({ key: 'customer', label: 'Dashboard Saya', icon: <Package size={18} className="mr-2" />, submenus: [] });
    }
  }

  // Prepend Home link to all modes to allow easy return to landing page
  dynamicMenuItems.unshift({ key: '', label: 'Beranda', icon: <Compass size={18} className="mr-2" />, submenus: [] });

  return (
    <nav className="relative z-[999] w-full bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/10 text-white shadow-neon-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            >
              <Image src="/favico.png" alt="Logo" width={28} height={28} className="glow-border rounded-full" />
            </motion.div>
            <span className="font-sans font-bold text-xl tracking-widest text-[#f4f4f5] shadow-neon-text">
              POSEIDON<span className="text-primary font-mono ml-1">FLEET</span>
            </span>
          </div>

          <div className="hidden md:flex items-center h-full space-x-1">
            {dynamicMenuItems.map((item) => (
              <div 
                key={item.key} 
                className="h-full relative flex items-center px-4 cursor-pointer"
                onMouseEnter={() => setActiveMenu(item.key)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link href={`/${item.key}`} className={`flex items-center transition-colors duration-200 ${activeMenu === item.key ? 'text-primary' : 'text-gray-300 hover:text-white'}`}>
                  {item.icon}
                  <span className="font-semibold">{item.label}</span>
                  {item.submenus.length > 0 && (
                    <ChevronDown size={14} className={`ml-1 transition-transform ${activeMenu === item.key ? 'rotate-180' : ''}`} />
                  )}
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

                {/* Megamenu Dropdown - Only show if submenus exist */}
                <AnimatePresence>
                  {activeMenu === item.key && item.submenus.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-16 left-1/2 -translate-x-1/2 w-64 bg-[#121217] border border-primary/40 rounded-lg p-4 glow-border shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
                    >
                      <ul className="space-y-3">
                        {item.submenus.map((sub, idx) => (
                          <li key={idx}>
                            <Link 
                              href="#" 
                              className="flex items-center text-gray-300 hover:text-primary transition-colors cursor-pointer group"
                              onClick={(e) => {
                                e.preventDefault();
                                if (item.key === 'admin' && !pathname.startsWith('/admin')) {
                                   window.location.href = `/admin?tab=${sub.action}`;
                                   return;
                                }
                                if (onMenuClick && sub.action) {
                                  onMenuClick(item.key, sub.action);
                                }
                              }}
                            >
                              <span className="p-1 rounded-md bg-white/5 group-hover:bg-primary/20 mr-3">
                                {sub.icon}
                              </span>
                              <span className="font-mono text-sm">{sub.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            
            {session && (
              <button 
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/login';
                }}
                className="ml-4 px-4 py-2 text-sm font-semibold text-red-400 border border-red-500/50 hover:bg-red-500/20 rounded-lg transition-all duration-200 glow-border font-mono tracking-wider"
              >
                LOGOUT
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
