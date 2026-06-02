import React from 'react';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Megamenu } from '@/components/layout/Megamenu';
import PaymentClient from './PaymentClient';

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return redirect('/login');
  const session: any = await verifyToken(token);
  if (!session) return redirect('/login');

  const { id } = await params;
  
  const shipment = await db.shipment.findUnique({
    where: { id }
  });

  if (!shipment || shipment.customerId !== session.id) {
    return redirect('/customer');
  }

  if (shipment.paymentMethod === 'COD' || shipment.paymentStatus === 'PAID') {
    return redirect('/customer');
  }

  const serialized = JSON.parse(JSON.stringify(shipment));

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white">
      <Megamenu />
      <div className="max-w-2xl mx-auto px-4 py-16">
         <PaymentClient shipment={serialized} />
      </div>
    </main>
  );
}
