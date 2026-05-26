import { useState, useEffect, useRef } from 'react';
import { VesselWithLatestLog, VesselStatus } from '@/types';
import { PORT_DATABASE } from '@/lib/ports';

function findPortCoords(name: string): [number, number] | null {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  for (const port of PORT_DATABASE) {
    if (port.alias.some(a => lower.includes(a))) {
      return port.coords;
    }
  }
  return null;
}

// Utility to play sonar ping using Web Audio API
const playPing = () => {
  if (typeof window === 'undefined') return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (error) {
    console.error("Audio block", error)
  }
};

export const useVesselStream = () => {
  const [vessels, setVessels] = useState<VesselWithLatestLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Keep track of references to avoid stale closures in intervals
  const vesselsRef = useRef(vessels);
  
  useEffect(() => {
    vesselsRef.current = vessels;
  }, [vessels]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch('/api/vessels');
      const data = await res.json();
      const loaded: VesselWithLatestLog[] = data.vessels.map((v: any) => {
        const activeShipment = v.shipments?.find((s: any) => s.status === 'IN_TRANSIT');
        return {
          ...v,
          progress: activeShipment ? 0.35 : 0.0, // Start 35% along the way for demo vibrancy
          lastUpdated: Date.now()
        };
      });
      setVessels(loaded);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Simulator interval
  useEffect(() => {
    if (loading || vessels.length === 0) return;

    const interval = setInterval(() => {
      setVessels((prevVessels) => {
        let hasSignalLost = false;

        const updated = prevVessels.map(vessel => {
          // 4% chance to lose signal temporarily if was online,
          // 20% chance to recover if was lost
          const isCurrentlyLost = vessel.status === 'Signal Lost';
          const randomFactor = Math.random();
          
          let newStatus = vessel.status;
          
          if (!isCurrentlyLost && randomFactor < 0.04) {
             newStatus = 'Signal Lost';
             hasSignalLost = true;
          } else if (isCurrentlyLost && randomFactor < 0.20) {
             newStatus = 'En Route'; 
          }

          if (newStatus === 'Signal Lost') {
            return {
              ...vessel,
              status: newStatus,
            };
          }

          // Smart live route movement if carrying active kargo that is IN_TRANSIT
          const activeShipment = (vessel as any).shipments?.find((s: any) => s.status === 'IN_TRANSIT');

          if (activeShipment) {
            const originCoords = findPortCoords(activeShipment.origin) || [1.290270, 103.851959]; // default Singapore
            const destCoords = findPortCoords(activeShipment.destination) || [-6.10, 106.88]; // default Jakarta
            
            // Advance route progress by 1.5% every 5 seconds
            let nextProgress = (vessel.progress || 0.35) + 0.015;
            if (nextProgress > 1.0) {
              nextProgress = 0.0; // Loop back for infinite loop demo
            }

            const currentLat = originCoords[0] + (destCoords[0] - originCoords[0]) * nextProgress;
            const currentLng = originCoords[1] + (destCoords[1] - originCoords[1]) * nextProgress;
            const speedVariance = (Math.random() - 0.5) * 1.5;

             return {
              ...vessel,
              status: 'En Route' as VesselStatus,
              progress: nextProgress,
              lastUpdated: Date.now(),
              latestLog: {
                 ...vessel.latestLog,
                 lat: currentLat,
                 lng: currentLng,
                 speed: Math.max(12.0, 15.5 + speedVariance)
              }
            };
          } else {
            // Stationary drifting around the latest shipment's target port (or original coords)
            const latestShipment = (vessel as any).shipments?.[0]; // shipments sorted by createdAt desc
            let targetPortCoords: [number, number] | null = null;
            
            if (latestShipment) {
              // If the cargo has arrived, the ship is parked at the destination port!
              // Otherwise, it is parked at the origin port preparing to load or waiting
              const portName = latestShipment.status === 'ARRIVED' ? latestShipment.destination : latestShipment.origin;
              targetPortCoords = findPortCoords(portName);
            }
            
            const baseLat = targetPortCoords ? targetPortCoords[0] : (vessel.latestLog?.lat && vessel.latestLog.lat !== 0 ? vessel.latestLog.lat : -6.08);
            const baseLng = targetPortCoords ? targetPortCoords[1] : (vessel.latestLog?.lng && vessel.latestLog.lng !== 0 ? vessel.latestLog.lng : 106.89);
            
            const latShift = (Math.random() - 0.5) * 0.0004;
            const lngShift = (Math.random() - 0.5) * 0.0004;

            return {
              ...vessel,
              status: (newStatus === 'En Route' ? 'In Port' : newStatus) as VesselStatus, // Fallback if no active shipment
              progress: 0,
              lastUpdated: Date.now(),
              latestLog: {
                 ...vessel.latestLog,
                 lat: baseLat + latShift,
                 lng: baseLng + lngShift,
                 speed: 0
              }
            };
          }
        });

        if (hasSignalLost) {
          playPing();
        }

        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [loading]);

  return { vessels, loading, refetch: fetchInitialData };
};
