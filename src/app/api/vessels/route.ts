import { NextResponse } from 'next/server'

// Mock vessel data as fallback when database is not available
const MOCK_VESSELS = [
  {
    id: 'v1',
    name: 'Poseidon Alpha',
    type: 'Tanker',
    status: 'En Route',
    routeId: 'r1',
    route: { id: 'r1', name: 'Trans-Pacific Route' },
    latestLog: {
      id: 'log-1',
      vesselId: 'v1',
      fuelLevel: 85,
      speed: 14.5,
      lat: 1.290270,
      lng: 103.851959,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'v2',
    name: 'Titan Freight',
    type: 'Cargo',
    status: 'Delayed',
    routeId: 'r2',
    route: { id: 'r2', name: 'Trans-Atlantic Route' },
    latestLog: {
      id: 'log-2',
      vesselId: 'v2',
      fuelLevel: 45,
      speed: 10.2,
      lat: 51.9225,
      lng: 4.47917,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'v3',
    name: 'Ocean Voyager',
    type: 'Passenger',
    status: 'Maintenance',
    routeId: 'r1',
    route: { id: 'r1', name: 'Trans-Pacific Route' },
    latestLog: {
      id: 'log-3',
      vesselId: 'v3',
      fuelLevel: 20,
      speed: 0,
      lat: 34.0522,
      lng: -118.2437,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'v4',
    name: 'Neptune Horizon',
    type: 'Tanker',
    status: 'En Route',
    routeId: 'r1',
    route: { id: 'r1', name: 'Trans-Pacific Route' },
    latestLog: {
      id: 'log-4',
      vesselId: 'v4',
      fuelLevel: 60,
      speed: 18.0,
      lat: 22.3193,
      lng: 114.1694,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'v5',
    name: 'Trident Express',
    type: 'Cargo',
    status: 'In Port',
    routeId: 'r2',
    route: { id: 'r2', name: 'Trans-Atlantic Route' },
    latestLog: {
      id: 'log-5',
      vesselId: 'v5',
      fuelLevel: 92,
      speed: 0,
      lat: -6.1175,
      lng: 106.8286,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'v6',
    name: 'Aegean Star',
    type: 'Passenger',
    status: 'En Route',
    routeId: 'r1',
    route: { id: 'r1', name: 'Trans-Pacific Route' },
    latestLog: {
      id: 'log-6',
      vesselId: 'v6',
      fuelLevel: 72,
      speed: 12.8,
      lat: 35.6762,
      lng: 139.6503,
      timestamp: new Date().toISOString(),
    },
  },
];

export async function GET() {
  try {
    // Try database first
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const vessels = await prisma.vessel.findMany({
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

    await prisma.$disconnect();

    if (vessels.length === 0) {
      // Database is empty — return mock data
      return NextResponse.json({ vessels: MOCK_VESSELS });
    }

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
    console.error('Database unavailable, using mock data:', error);
    // Fallback to mock data when database is not available
    return NextResponse.json({ vessels: MOCK_VESSELS });
  }
}
