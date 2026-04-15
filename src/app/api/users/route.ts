import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email in use' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { email, name, password: hashedPassword, role: role || 'CUSTOMER' },
      select: { id: true, email: true, name: true, role: true }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
