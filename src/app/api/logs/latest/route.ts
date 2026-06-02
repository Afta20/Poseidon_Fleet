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
    // Only Admin or Monitoring can see the live feed
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MONITORING')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the 10 most recent logs
    const logs = await db.log.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        vessel: {
          select: { name: true, type: true }
        }
      }
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Live Logs API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const session: any = await verifyToken(token);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MONITORING')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { logId, responseType } = await req.json();
    if (!logId) return NextResponse.json({ error: 'Missing logId' }, { status: 400 });

    const log = await db.log.findUnique({ where: { id: logId } });
    if (!log || !log.incident) return NextResponse.json({ error: 'Log not found' }, { status: 404 });

    if (log.incident.includes('[RESPONDED')) {
       return NextResponse.json({ success: true }); // Already responded
    }

    const typeStr = responseType ? `: ${responseType}` : '';

    await db.log.update({
      where: { id: logId },
      data: { incident: `${log.incident} [RESPONDED${typeStr}]` }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SOS Response Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
