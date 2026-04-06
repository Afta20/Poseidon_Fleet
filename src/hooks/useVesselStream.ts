import { useState, useEffect, useRef, useCallback } from 'react';
import { VesselWithLatestLog } from '@/types';

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
      const loaded: VesselWithLatestLog[] = data.vessels.map((v: any) => ({
        ...v,
        lastUpdated: Date.now()
      }));
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
             // Recover back to En Route or original (simplification to En Route)
             newStatus = 'En Route'; 
          }

          if (newStatus === 'Signal Lost') {
            return {
              ...vessel,
              status: newStatus,
              // don't update lastUpdated or lat/lng
            };
          }

          // Simulate movement
          const latShift = (Math.random() - 0.5) * 0.005;
          const lngShift = (Math.random() - 0.5) * 0.005;
          
          // Speed variance
          const speedVariance = (Math.random() - 0.5) * 2;
          
          return {
            ...vessel,
            status: newStatus,
            lastUpdated: Date.now(),
            latestLog: {
               ...vessel.latestLog,
               lat: vessel.latestLog.lat + latShift,
               lng: vessel.latestLog.lng + lngShift,
               speed: Math.max(0, vessel.latestLog.speed + speedVariance)
            }
          };
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
