"use client"
import dynamic from 'next/dynamic'
import { VesselWithLatestLog } from '@/types';
import { Loader2 } from 'lucide-react';

const VesselMapComponent = dynamic(() => import('./VesselMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl border border-white/10 glow-border bg-[#0a0a0c] flex justify-center items-center">
        <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  )
});

interface MapProps {
  vessels: VesselWithLatestLog[];
  selectedVesselId?: string | null;
}

export const VesselMap = (props: MapProps) => {
  return <VesselMapComponent {...props} />
}
