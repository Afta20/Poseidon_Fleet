import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { generateTrackingId } from '@/lib/utils';
import { sendBookingConfirmationEmail } from '@/lib/email';

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

    // For admin creating shipment, customerId can be passed explicitly
    const customerId = data.customerId || session.id;

    const shipment = await db.shipment.create({
      data: {
        id: trackingId,
        title: data.title,
        description: data.description || null,
        senderName: data.senderName || '',
        receiverName: data.receiverName || '',
        phone: data.phone || '',
        sendDate: data.sendDate ? new Date(data.sendDate) : new Date(),
        origin: data.origin,
        destination: data.destination,
        type: data.type,
        deliveryType: data.deliveryType || 'BIASA',
        weight: Number(data.weight),
        volume: data.volume ? Number(data.volume) : null,
        cost: data.cost ? Number(data.cost) : null,
        paymentMethod: data.paymentMethod || 'TRANSFER_BANK',
        paymentStatus: data.paymentStatus || 'UNPAID',
        status: 'PENDING',
        customerId,
      }
    });

    await db.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        location: data.origin,
        status: 'PENDING',
        description: 'Pesanan pengiriman telah dibuat.'
      }
    });

    // Send Email
    const customer = await db.user.findUnique({ where: { id: customerId } });
    if (customer && customer.email) {
      await sendBookingConfirmationEmail(customer.email, customer.name, shipment);
    }

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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const shipments = await db.shipment.findMany({
      where: search
        ? {
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
              { senderName: { contains: search, mode: 'insensitive' } },
              { receiverName: { contains: search, mode: 'insensitive' } },
              { customer: { name: { contains: search, mode: 'insensitive' } } },
            ]
          }
        : undefined,
      include: {
        customer: { select: { name: true, email: true } },
        vessel: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ shipments });
  } catch (error) {
    console.error('Shipment GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
