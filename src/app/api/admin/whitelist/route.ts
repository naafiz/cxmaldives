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
        const { mobile } = await request.json();

        if (!mobile) return NextResponse.json({ error: 'Mobile required' }, { status: 400 });

        const entry = await prisma.whitelist.create({
            data: { mobile }
        });

        await logAdminAction('WHITELIST_ADD', `Added mobile: ${mobile}`);

        return NextResponse.json(entry);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id, mobile } = await request.json();

        await prisma.whitelist.delete({
            where: { id }
        });

        await logAdminAction('WHITELIST_REMOVE', `Removed mobile: ${mobile}`);

        return NextResponse.json({ message: 'Removed' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
