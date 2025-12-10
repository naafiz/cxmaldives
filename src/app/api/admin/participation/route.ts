import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifySession(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const voters = await prisma.member.findMany({
            where: { hasVoted: true },
            select: {
                id: true,
                name: true,
                idCard: true,
                updatedAt: true, // Assuming updatedAt is roughly when they voted if hasVoted changed
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(voters);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
