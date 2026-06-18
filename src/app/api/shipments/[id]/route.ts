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
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const shipment = await db.shipment.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, email: true } },
        vessel: true,
        events: { orderBy: { timestamp: 'desc' } }
      }
    });
    if (!shipment) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json({ shipment });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();

    const existingShipment = await db.shipment.findUnique({ where: { id } });
    if (!existingShipment) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const isLocked = ['APPROVED', 'IN_TRANSIT', 'ARRIVED'].includes(existingShipment.status);
    
    // Allow status and vesselId updates even if locked, but block full data edits
    if (isLocked) {
      const isTryingToEditData = Object.keys(data).some(key => !['status', 'vesselId', 'eventLocation', 'eventDescription'].includes(key));
      if (isTryingToEditData) {
        return NextResponse.json({ error: 'Pesanan yang sudah diproses tidak dapat diubah' }, { status: 403 });
      }
    }

    const updateData: any = {};

    // Status update
    if (data.status !== undefined) updateData.status = data.status;
    if (data.vesselId !== undefined) updateData.vesselId = data.vesselId || null;

    // Full edit fields
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.senderName !== undefined) updateData.senderName = data.senderName;
    if (data.receiverName !== undefined) updateData.receiverName = data.receiverName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.origin !== undefined) updateData.origin = data.origin;
    if (data.destination !== undefined) updateData.destination = data.destination;
    if (data.weight !== undefined) updateData.weight = Number(data.weight);
    if (data.volume !== undefined) updateData.volume = data.volume ? Number(data.volume) : null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.deliveryType !== undefined) updateData.deliveryType = data.deliveryType;
    if (data.cost !== undefined) updateData.cost = data.cost ? Number(data.cost) : null;
    if (data.sendDate !== undefined) updateData.sendDate = new Date(data.sendDate);
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;


    const shipment = await db.shipment.update({
      where: { id },
      data: updateData
    });

    // Log tracking event on status change
    if (data.status) {
      await db.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          location: data.eventLocation || 'Sistem Terpusat',
          status: data.status,
          description: data.eventDescription || `Status diperbarui menjadi ${data.status} oleh Admin.`
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
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const shipment = await db.shipment.findUnique({ where: { id } });
    if (!shipment) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const isLocked = ['APPROVED', 'IN_TRANSIT', 'ARRIVED'].includes(shipment.status);
    if (isLocked) {
      return NextResponse.json({ error: 'Pesanan yang sudah diproses tidak dapat dihapus' }, { status: 403 });
    }

    await db.shipment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Shipment DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
