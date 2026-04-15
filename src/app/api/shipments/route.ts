import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { generateTrackingId } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const session: any = await verifyToken(token);
    if (!session || (session.role !== 'CUSTOMER' && session.role !== 'ADMIN')) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const trackingId = generateTrackingId();
    
    const shipment = await db.shipment.create({
      data: {
         id: trackingId,
         title: data.title,
         description: data.description,
         origin: data.origin,
         destination: data.destination,
         type: data.type,
         weight: data.weight,
         volume: data.volume,
         status: 'PENDING',
         customerId: session.id,
      }
    });

    // Create an initial tracking event
    await db.trackingEvent.create({
       data: {
          shipmentId: shipment.id,
          location: data.origin,
          status: 'PENDING',
          description: 'Shipment booking requested by customer.'
       }
    });

    return NextResponse.json({ success: true, shipment });
  } catch (error) {
    console.error('Shipment POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
   try {
     const cookieStore = await cookies();
     const token = cookieStore.get('session')?.value;
     if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     
     const session: any = await verifyToken(token);
     if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
 
     const shipments = await db.shipment.findMany({
        include: {
           customer: { select: { name: true, email: true } },
           vessel: true
        },
        orderBy: { createdAt: 'desc' }
     });
 
     return NextResponse.json({ shipments });
   } catch (error) {
     console.error('Shipment GET error:', error);
     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
 }
