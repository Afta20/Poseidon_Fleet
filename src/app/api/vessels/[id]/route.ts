import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    const { id } = await params;

    const vessel = await db.vessel.update({
      where: { id },
      data: {
        payload: data.payload,
        // Allow updating other fields optionally if needed
        ...(data.status && { status: data.status }),
      }
    });

    return NextResponse.json({ success: true, vessel });
  } catch (error: any) {
    console.error('Update vessel error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update vessel' }, { status: 500 });
  }
}
