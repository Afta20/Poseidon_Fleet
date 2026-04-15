import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Clear existing
    await db.log.deleteMany()
    await db.crew.deleteMany()
    await db.vessel.deleteMany()
    await db.route.deleteMany()
    await db.user.deleteMany()

    // Create Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await db.user.create({
      data: {
        email: 'admin@poseidon.fleet',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN'
      }
    });

    // Create routes
    const routePacific = await db.route.create({
      data: { name: 'Trans-Pacific Route' },
    })
    
    const routeAtlantic = await db.route.create({
      data: { name: 'Trans-Atlantic Route' },
    })

    // Create vessels
    const v1 = await db.vessel.create({
      data: {
        name: 'Prime Alpha',
        type: 'Tanker',
        status: 'En Route',
        payload: '100.000 Barel Minyak Mentah',
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

    const v2 = await db.vessel.create({
      data: {
        name: 'Titan Freight',
        type: 'Cargo',
        status: 'Delayed',
        payload: 'Suku Cadang Otomotif (2000 TEU)',
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

    const v3 = await db.vessel.create({
      data: {
        name: 'Ocean Voyager',
        type: 'Passenger',
        status: 'Maintenance',
        payload: '1500 Penumpang & Barang Bawaan',
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

    const v4 = await db.vessel.create({
      data: {
        name: 'Neptune Horizon',
        type: 'Tanker',
        status: 'En Route',
        payload: 'Gas Alam Cair (LNG) Tekanan Tinggi',
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
