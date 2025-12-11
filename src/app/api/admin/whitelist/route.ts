import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const list = await prisma.whitelist.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(list);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { idCard } = await request.json();
        if (!idCard) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.whitelist.create({
            data: { idCard: idCard.trim().toUpperCase() }
        });

        await logAdminAction('WHITELIST_ADD', `Added ${idCard}`);
        return NextResponse.json({ message: 'Added' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed or Duplicate' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id, idCard } = await request.json();
        await prisma.whitelist.delete({ where: { id } });

        await logAdminAction('WHITELIST_REMOVE', `Removed ${idCard}`);
        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
