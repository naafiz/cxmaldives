import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

async function checkAdmin() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return false;
    const payload = await verifySession(session);
    return payload && payload.role === 'admin';
}

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const members = await prisma.member.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                idCard: true,
                mobile: true,
                email: true,
                lastLogin: true,
                createdAt: true,
            }
        });
        return NextResponse.json(members);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { ids } = await request.json(); // Expect array of IDs or single ID

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        await prisma.member.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        await logAdminAction('MEMBER_DELETE', `Deleted IDs: ${ids.join(', ')}`);

        return NextResponse.json({ message: 'Members deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete members' }, { status: 500 });
    }
}
