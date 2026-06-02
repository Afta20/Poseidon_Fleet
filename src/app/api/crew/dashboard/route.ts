import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const session: any = await verifyToken(token);
    if (!session || session.role !== 'CREW') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the Crew profile linked to this user
    const crewProfile = await db.crew.findUnique({
      where: { userId: session.id },
      include: {
        vessel: {
          include: {
            shipments: {
              where: {
                status: {
                  in: ['APPROVED', 'IN_TRANSIT']
                }
              }
            },
            logs: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    if (!crewProfile) {
      return NextResponse.json({ error: 'Crew profile not found' }, { status: 404 });
    }

    return NextResponse.json({ crew: crewProfile });
  } catch (error) {
    console.error('Crew API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const session: any = await verifyToken(token);
    if (!session || session.role !== 'CREW') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, shipmentId, newStatus, location, incident } = await req.json();

    const crewProfile = await db.crew.findUnique({
      where: { userId: session.id },
      include: { vessel: true }
    });

    if (!crewProfile || !crewProfile.vesselId) {
      return NextResponse.json({ error: 'No vessel assigned' }, { status: 400 });
    }

    // 1. Cargo Management: Update Shipment Status
    if (action === 'UPDATE_SHIPMENT' && shipmentId && newStatus) {
      const shipment = await db.shipment.update({
        where: { id: shipmentId },
        data: { status: newStatus }
      });
      
      // Log the event
      await db.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          location: location || 'Di Perairan',
          status: newStatus === 'IN_TRANSIT' ? 'Mulai Berlayar' : 'Bongkar Muat / Tiba',
          description: `Diupdate oleh Kapten/Kru: ${crewProfile.name}`
        }
      });
      return NextResponse.json({ success: true, shipment });
    }

    // 2. SOS / Weather Logging
    if (action === 'SOS' || action === 'WEATHER_LOG') {
      const vessel = crewProfile.vessel;
      // Fetch latest coordinates to append to log if available, else 0,0
      const lastLog = await db.log.findFirst({
        where: { vesselId: vessel!.id },
        orderBy: { timestamp: 'desc' }
      });

      const log = await db.log.create({
        data: {
          vesselId: vessel!.id,
          fuelLevel: lastLog?.fuelLevel || 100,
          speed: lastLog?.speed || 0,
          lat: lastLog?.lat || -6.1, // Fallback to Jakarta if no prior log
          lng: lastLog?.lng || 106.8,
          incident: action === 'SOS' ? 'EMERGENCY: ' + incident : 'LOG: ' + incident
        }
      });

      if (action === 'SOS') {
        // Automatically put vessel in 'Delayed' or 'Maintenance' if SOS
        await db.vessel.update({
          where: { id: vessel!.id },
          data: { status: 'Delayed' }
        });
      }

      return NextResponse.json({ success: true, log });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Crew POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
