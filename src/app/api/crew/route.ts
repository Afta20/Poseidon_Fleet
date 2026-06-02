import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const crew = await db.crew.findMany({ include: { vessel: true, user: true } });
    const availableUsers = await db.user.findMany({
      where: {
        role: 'CREW',
        crew: null // users that don't have a crew profile yet
      },
      select: { id: true, name: true, email: true }
    });
    return NextResponse.json({ crew, availableUsers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, position, vesselId, userId } = await request.json();
    const crew = await db.crew.create({
      data: { name, position, vesselId: vesselId || null, userId: userId || null }
    });
    return NextResponse.json({ success: true, crew });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
