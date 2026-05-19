"use client"
import dynamic from 'next/dynamic';
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
}

export const TrackingMapWrapper = (props: TrackingMapWrapperProps) => {
  return <TrackingMapComponent {...props} />;
};
