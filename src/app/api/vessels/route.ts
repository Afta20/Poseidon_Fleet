import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const vessels = await db.vessel.findMany({
      include: {
        route: true,
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        shipments: {
          where: { status: { not: 'REJECTED' } },
          include: {
            customer: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const formattedVessels = vessels.map(v => {
      const { logs, ...vesselData } = v;
      return {
        ...vesselData,
        latestLog: logs[0] || {
          id: `dummy-${vesselData.id}`,
          vesselId: vesselData.id,
          fuelLevel: 100,
          speed: 0,
          lat: 0,
          lng: 0,
          timestamp: new Date()
        }
      };
    });

    return NextResponse.json({ vessels: formattedVessels });
  } catch (error) {
    console.error('Vessel GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const session: any = await verifyToken(token);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    if (!data.name || !data.type || !data.status) {
      return NextResponse.json({ error: 'Nama, Tipe, dan Status wajib diisi' }, { status: 400 });
    }

    const vessel = await db.vessel.create({
      data: {
        name: data.name,
        type: data.type,
        status: data.status,
        plateCode: data.plateCode || null,
        capacity: data.capacity ? Number(data.capacity) : null,
        payload: data.payload || null,
        routeId: data.routeId || null,
      }
    });

    return NextResponse.json({ success: true, vessel });
  } catch (error) {
    console.error('Vessel POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
