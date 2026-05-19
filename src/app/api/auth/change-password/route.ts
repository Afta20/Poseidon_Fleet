import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session: any = await verifyToken(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 });
    }

    // Get current user
    const user = await db.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
    }

    // Hash and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: session.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true, message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
