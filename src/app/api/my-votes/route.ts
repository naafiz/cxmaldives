import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifySession(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const memberId = payload.id as string;

        const votes = await prisma.vote.findMany({
            where: { memberId },
            select: {
                positionId: true,
                candidateId: true,
            },
        });

        // Also check if member has verified "hasVoted" flag, though votes.length > 0 implies it.
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            select: { hasVoted: true }
        });

        return NextResponse.json({
            hasVoted: member?.hasVoted || false,
            votes
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
