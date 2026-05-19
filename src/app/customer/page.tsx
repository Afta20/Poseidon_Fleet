import React, { Suspense } from 'react';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Megamenu } from '@/components/layout/Megamenu';
import { CustomerShipmentList } from '@/components/tracking/CustomerShipmentList';
import { CardSkeleton } from '@/components/ui/CardSkeleton';

async function ShipmentData({ userId }: { userId: string }) {
  const shipments = await db.shipment.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: 'desc' },
    include: { vessel: true }
  });

  // Serialize for client component
  const serialized = JSON.parse(JSON.stringify(shipments));

  return <CustomerShipmentList shipments={serialized} />;
}

export default async function CustomerDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
           <div>
             <h1 className="text-3xl font-bold font-sans tracking-wide shadow-neon-text">Halo, {(session as any).name}</h1>
             <p className="text-zinc-400 mt-2">Selamat datang di Panel Manajemen Muatan Anda.</p>
           </div>
           <Link 
             href="/customer/booking" 
             className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-transform hover:scale-105 glow-border"
           >
             <Plus size={18} className="mr-2" />
             Pesan Pengiriman (Booking)
           </Link>
        </div>

        <Suspense fallback={
          <div>
            <div className="h-8 bg-zinc-800/50 rounded w-48 mb-6 animate-pulse" />
            <CardSkeleton count={6} columns={3} />
          </div>
        }>
          <ShipmentData userId={(session as any).id} />
        </Suspense>
      </div>
    </main>
  );
}
