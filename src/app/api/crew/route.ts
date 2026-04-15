import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const crew = await db.crew.findMany({ include: { vessel: true } });
    return NextResponse.json({ crew });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, position, vesselId } = await request.json();
    const crew = await db.crew.create({
      data: { name, position, vesselId: vesselId || null }
    });
    return NextResponse.json({ success: true, crew });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
