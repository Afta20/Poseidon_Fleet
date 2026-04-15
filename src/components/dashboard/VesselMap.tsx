"use client"
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VesselWithLatestLog } from '@/types';

// Custom Map Marker Icon generator based on vessel type
const getVesselIcon = (vessel: VesselWithLatestLog) => {
  let color = '#a855f7'; // default purple
  let glowColor = 'rgba(168, 85, 247, 0.8)';
  let outerGlow = 'rgba(168, 85, 247, 0.4)';

  if (vessel.type === 'Tanker') {
    color = '#4ade80'; // green-400
    glowColor = 'rgba(74, 222, 128, 0.8)';
    outerGlow = 'rgba(74, 222, 128, 0.4)';
  } else if (vessel.type === 'Cargo') {
    color = '#facc15'; // yellow-400
    glowColor = 'rgba(250, 204, 21, 0.8)';
    outerGlow = 'rgba(250, 204, 21, 0.4)';
  } else if (vessel.type === 'Passenger') {
    color = '#ef4444'; // red-500
    glowColor = 'rgba(239, 68, 68, 0.8)';
    outerGlow = 'rgba(239, 68, 68, 0.4)';
  }

  const isLost = vessel.status === 'Signal Lost';
  const opacity = isLost ? 0.6 : 1;

  return new L.DivIcon({
    className: isLost ? 'custom-icon-lost' : 'custom-icon',
    html: `<div style="
      background-color: ${color};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      box-shadow: 0 0 10px 2px ${glowColor}, 0 0 20px ${outerGlow};
      border: 2px solid white;
      opacity: ${opacity};
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

interface MapProps {
  vessels: VesselWithLatestLog[];
  selectedVesselId?: string | null;
  mapMode?: string;
}

// Component to handle imperative map updates
const MapUpdater = ({ vessels, selectedVesselId }: { vessels: VesselWithLatestLog[], selectedVesselId?: string | null }) => {
  const map = useMap();
  const prevSelectedRef = React.useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Only trigger map movement if the selectedVesselId has explicitly changed
    if (selectedVesselId !== prevSelectedRef.current) {
      if (selectedVesselId) {
        const selected = vessels.find(v => v.id === selectedVesselId);
        if (selected && selected.latestLog.lat && selected.latestLog.lng) {
          map.flyTo([selected.latestLog.lat, selected.latestLog.lng], 6, {
            duration: 1.5
          });
        }
      } else if (prevSelectedRef.current !== undefined && vessels.length > 0) {
        // Optional: zoom out to fit all or go back to center when explicitly deselected
        map.flyTo([vessels[0].latestLog.lat, vessels[0].latestLog.lng], 3, {
           duration: 1.5
        });
      }
      prevSelectedRef.current = selectedVesselId;
    }
  }, [selectedVesselId, vessels, map]);

  return null;
};

const VesselMapComponent: React.FC<MapProps> = ({ vessels, selectedVesselId, mapMode }) => {
  // Try to center on first active vessel, else default center
  const centerPosition: [number, number] = vessels.length > 0 
    ? [vessels[0].latestLog.lat, vessels[0].latestLog.lng]
    : [20, 0];

  // Map style logic (Dark Base Maps only)
  let mapFilterClass = '';
  let tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  
  if (mapMode === 'Weather Overlay') {
     mapFilterClass = 'saturate-[1.5] contrast-[1.2] sepia-[0.3] hue-rotate-[180deg] brightness-[0.7]'; 
  } else if (mapMode === 'Traffic Density') {
     mapFilterClass = 'sepia-[0.6] hue-rotate-[320deg] saturate-[2.5] brightness-[0.9]'; 
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-white/10 glow-border z-0 relative">
      {mapMode === 'Weather Overlay' && (
         <div className="absolute top-4 right-4 z-[400] bg-blue-500/20 border border-blue-500/50 backdrop-blur-md p-2 rounded-lg pointer-events-none data-mock-weather flex flex-col items-end">
             <span className="text-xs font-mono text-blue-300 font-bold tracking-widest">STORM DETECTED</span>
             <span className="text-[10px] text-blue-200 uppercase">Sector 4V • Heavy Rain</span>
         </div>
      )}
      {mapMode === 'Traffic Density' && (
         <div className="absolute top-4 right-4 z-[400] bg-red-500/20 border border-red-500/50 backdrop-blur-md p-2 rounded-lg pointer-events-none data-mock-traffic flex flex-col items-end">
             <span className="text-xs font-mono text-red-300 font-bold tracking-widest">HIGH TRAFFIC VOL</span>
             <span className="text-[10px] text-red-200 uppercase">120+ Vessels in proximity</span>
         </div>
      )}

      <div className={`w-full h-full transition-all duration-1000 ${mapFilterClass}`}>
        <MapContainer 
          center={centerPosition} 
          zoom={3} 
          style={{ height: '100%', width: '100%', background: '#0a0a0c' }}
          attributionControl={false}
        >
          <MapUpdater vessels={vessels} selectedVesselId={selectedVesselId} />
          <TileLayer
            key={tileUrl} // Keep key to force re-render if we ever change it again
            url={tileUrl}
          />
          {vessels.map(vessel => {
            const lat = vessel.latestLog.lat;
            const lng = vessel.latestLog.lng;
            
            if (!lat || !lng) return null;
            
            return (
              <Marker 
                key={vessel.id} 
                position={[lat, lng]} 
                icon={getVesselIcon(vessel)}
              >
                <Popup className="dark-popup">
                  <div className="bg-[#121217] text-white p-2 rounded-md font-sans min-w-[200px]">
                    <h4 className="font-bold text-primary">{vessel.name}</h4>
                    <p className="text-xs font-mono mt-1 text-zinc-400 capitalize">{vessel.type}</p>
                    <p className="text-xs font-mono mt-1 text-zinc-300">Status: {vessel.status}</p>
                    <p className="text-xs font-mono mt-1 text-zinc-300">Speed: {vessel.latestLog.speed.toFixed(1)} KN</p>
                    
                    {/* Real shipment data */}
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Muatan Aktif</p>
                      {(vessel as any).shipments && (vessel as any).shipments.length > 0 ? (
                        <div className="space-y-1">
                          {(vessel as any).shipments.slice(0, 3).map((s: any) => (
                            <div key={s.id} className="bg-black/40 rounded px-2 py-1">
                              <p className="text-xs font-bold text-white">{s.title}</p>
                              <p className="text-[10px] text-zinc-400 font-mono">
                                {s.origin} → {s.destination} • {s.weight}Kg
                              </p>
                              <p className="text-[10px] text-primary font-mono">
                                {s.customer?.name || '-'} • {s.status}
                              </p>
                            </div>
                          ))}
                          {(vessel as any).shipments.length > 3 && (
                            <p className="text-[10px] text-zinc-500 font-mono">+{(vessel as any).shipments.length - 3} muatan lainnya</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">Kosong</p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
             background: #121217;
             color: white;
             border: 1px solid rgba(168, 85, 247, 0.4);
             box-shadow: 0 0 10px rgba(168, 85, 247, 0.2);
        }
        .leaflet-popup-tip {
             background: #121217;
             border: 1px solid rgba(168, 85, 247, 0.4);
        }
      `}</style>
    </div>
  );
}

export default VesselMapComponent;
