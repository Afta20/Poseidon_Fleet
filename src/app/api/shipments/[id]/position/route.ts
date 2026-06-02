import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public endpoint: returns the latest vessel position for a shipment
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const shipment = await db.shipment.findUnique({
      where: { id },
      select: {
        status: true,
        origin: true,
        destination: true,
        vessel: {
          select: {
            id: true,
            name: true,
            type: true,
            logs: {
              orderBy: { timestamp: 'desc' },
              take: 1,
              select: { lat: true, lng: true, speed: true, timestamp: true },
            },
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const log = shipment.vessel?.logs?.[0] || null;

    return NextResponse.json({
      status: shipment.status,
      vessel: shipment.vessel ? {
        id: shipment.vessel.id,
        name: shipment.vessel.name,
        type: shipment.vessel.type,
      } : null,
      position: log ? {
        lat: log.lat,
        lng: log.lng,
        speed: log.speed,
        timestamp: log.timestamp,
      } : null,
    });
  } catch (error) {
    console.error('Shipment position GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
