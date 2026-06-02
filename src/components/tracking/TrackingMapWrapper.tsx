"use client"
import dynamic from 'next/dynamic';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

const TrackingMapComponent = dynamic(() => import('./TrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-xl border border-white/10 glow-border bg-[#0a0a0c] flex flex-col justify-center items-center">
      <Loader2 className="animate-spin text-primary mb-2" size={28} />
      <span className="text-zinc-500 font-mono text-xs">Loading map...</span>
    </div>
  )
});

interface TrackingMapWrapperProps {
  origin: string;
  destination: string;
  vesselName?: string | null;
  vesselType?: string | null;
  vesselLat?: number | null;
  vesselLng?: number | null;
  status: string;
  shipmentId?: string;
}

export const TrackingMapWrapper = (props: TrackingMapWrapperProps) => {
  const { shipmentId, status } = props;
  const [livePos, setLivePos] = useState<{ lat: number; lng: number } | null>(
    props.vesselLat && props.vesselLng ? { lat: props.vesselLat, lng: props.vesselLng } : null
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPosition = useCallback(async () => {
    if (!shipmentId) return;
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/position`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.position?.lat && data.position?.lng) {
        setLivePos({ lat: data.position.lat, lng: data.position.lng });
      }
    } catch {
      // Silent fail — polling will retry
    }
  }, [shipmentId]);

  useEffect(() => {
    // Only poll when the shipment is in-transit (or approved, vessel might start moving)
    const shouldPoll = shipmentId && (status === 'IN_TRANSIT' || status === 'APPROVED');
    if (!shouldPoll) return;

    // Initial fetch immediately
    fetchPosition();

    // Then poll every 5 seconds
    intervalRef.current = setInterval(fetchPosition, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [shipmentId, status, fetchPosition]);

  return (
    <TrackingMapComponent
      {...props}
      vesselLat={livePos?.lat ?? props.vesselLat}
      vesselLng={livePos?.lng ?? props.vesselLng}
    />
  );
};
