import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const vessels = await prisma.vessel.findMany({
      include: {
        route: true,
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 1, // Only get the latest log
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
    console.error('Error fetching vessels API', error);
    return NextResponse.json({ error: 'Failed to fetch vessels' }, { status: 500 });
  }
}
