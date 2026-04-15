import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const session: any = await verifyToken(token);
    if (!session || session.role !== 'ADMIN') {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    const shipment = await db.shipment.update({
      where: { id },
      data: {
         status: data.status,
         vesselId: data.vesselId || null,
      }
    });

    if (data.status) {
       await db.trackingEvent.create({
          data: {
             shipmentId: shipment.id,
             location: 'Sistem Terpusat',
             status: data.status,
             description: `Status diperbarui menjadi ${data.status} oleh Admin.`
          }
       });
    }

    return NextResponse.json({ success: true, shipment });
  } catch (error) {
    console.error('Shipment PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
   try {
     const { id } = await params;
     const cookieStore = await cookies();
     const token = cookieStore.get('session')?.value;
     if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     
     const session: any = await verifyToken(token);
     if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
 
     await db.shipment.delete({ where: { id } });
     return NextResponse.json({ success: true });
   } catch (error) {
     console.error('Shipment DELETE error:', error);
     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
 }
