import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Clear existing
    await prisma.log.deleteMany()
    await prisma.vessel.deleteMany()
    await prisma.route.deleteMany()

    // Create routes
    const routePacific = await prisma.route.create({
      data: { name: 'Trans-Pacific Route' },
    })
    
    const routeAtlantic = await prisma.route.create({
      data: { name: 'Trans-Atlantic Route' },
    })

    // Create vessels
    const v1 = await prisma.vessel.create({
      data: {
        name: 'Prime Alpha',
        type: 'Tanker',
        status: 'En Route',
        routeId: routePacific.id,
        logs: {
          create: {
            fuelLevel: 85,
            speed: 14.5,
            lat: 1.290270, // Singapore
            lng: 103.851959,
          }
        }
      }
    })

    const v2 = await prisma.vessel.create({
      data: {
        name: 'Titan Freight',
        type: 'Cargo',
        status: 'Delayed',
        routeId: routeAtlantic.id,
        logs: {
          create: {
            fuelLevel: 45,
            speed: 10.2,
            lat: 51.9225, // Rotterdam
            lng: 4.47917,
          }
        }
      }
    })

    const v3 = await prisma.vessel.create({
      data: {
        name: 'Ocean Voyager',
        type: 'Passenger',
        status: 'Maintenance',
        routeId: routePacific.id,
        logs: {
          create: {
            fuelLevel: 20,
            speed: 0,
            lat: 34.0522, // Los Angeles
            lng: -118.2437,
          }
        }
      }
    })

    const v4 = await prisma.vessel.create({
      data: {
        name: 'Neptune Horizon',
        type: 'Tanker',
        status: 'En Route',
        routeId: routePacific.id,
        logs: {
          create: {
            fuelLevel: 60,
            speed: 18.0,
            lat: 22.3193, // Hong Kong
            lng: 114.1694,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Seeded successfully',
      vessels: [v1.name, v2.name, v3.name, v4.name]
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
