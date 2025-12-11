import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';
import { checkAdmin } from '@/lib/auth'; // Assuming checkAdmin is imported from here

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const entries = await prisma.whitelist.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(entries);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { idCard } = await request.json();

        if (!idCard) return NextResponse.json({ error: 'ID Card required' }, { status: 400 });

        const entry = await prisma.whitelist.create({
            data: { idCard: idCard.toUpperCase() }
        });

        await logAdminAction('WHITELIST_ADD', `Added ID: ${idCard}`);

        return NextResponse.json(entry);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, idCard } = await request.json();

        await prisma.whitelist.delete({
            where: { id }
        });

        await logAdminAction('WHITELIST_REMOVE', `Removed ID: ${idCard}`);

        return NextResponse.json({ message: 'Removed' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
