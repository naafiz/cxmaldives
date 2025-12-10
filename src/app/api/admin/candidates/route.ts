import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return false;
    const payload = await verifySession(token);
    return payload?.role === 'admin';
}

export async function POST(request: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, positionId } = await request.json();
        const candidate = await prisma.candidate.create({
            data: { name, positionId },
        });
        return NextResponse.json(candidate, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error adding candidate' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await request.json(); // Candidate ID
        await prisma.candidate.delete({ where: { id } });
        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting candidate' }, { status: 500 });
    }
}
