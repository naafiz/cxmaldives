import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Verify Admin Session
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const payload = await verifySession(token);
        if (payload?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { oldPassword, newPassword } = await request.json();

        // Get current admin
        const admin = await prisma.admin.findUnique({
            where: { username: (payload.name as string) || 'admin' } // Casting to string
        });

        if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

        // Verify Old Password
        const isValid = await bcrypt.compare(oldPassword, admin.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
        }

        // Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update
        await prisma.admin.update({
            where: { id: admin.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
