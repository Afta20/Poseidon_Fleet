import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  const session: any = await verifyToken(token);
  if (!session || session.role !== 'ADMIN') return null;
  return session;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vessel = await db.vessel.findUnique({
      where: { id },
      include: { route: true, crews: true }
    });
    if (!vessel) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ vessel });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await req.json();

    const vessel = await db.vessel.update({
      where: { id },
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
    console.error('Vessel PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Unlink shipments referencing this vessel before deleting
    await db.shipment.updateMany({
      where: { vesselId: id },
      data: { vesselId: null }
    });

    await db.crew.updateMany({
      where: { vesselId: id },
      data: { vesselId: null }
    });

    await db.vessel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vessel DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
