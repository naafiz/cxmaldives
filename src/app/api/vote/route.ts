import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { isVotingOpen } from '@/lib/voting';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifySession(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const memberId = payload.id as string;

        // 1. Check if voting is open
        if (!isVotingOpen()) {
            return NextResponse.json({ error: 'Voting is not open at this time.' }, { status: 403 });
        }

        // 2. Fetch Member to check status
        const member = await prisma.member.findUnique({ where: { id: memberId } });
        if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        // if (!member.isVerified) return NextResponse.json({ error: 'Member not verified' }, { status: 403 }); // Removed verification check
        if (member.hasVoted) return NextResponse.json({ error: 'You have already voted.' }, { status: 403 });

        // 3. Parse Votes
        // Expected body: { votes: [ { positionId: "...", candidateId: "..." }, ... ] }
        const { votes } = await request.json();

        if (!votes || !Array.isArray(votes) || votes.length === 0) {
            return NextResponse.json({ error: 'Invalid votes data' }, { status: 400 });
        }

        // 4. Record Votes Transactionally
        // We update Member.hasVoted = true AND create Vote records.
        await prisma.$transaction(async (tx) => {
            // Re-check hasVoted in transaction lock if DB supports it (SQLite is serializable usually)
            const m = await tx.member.findUnique({ where: { id: memberId } });
            if (m?.hasVoted) throw new Error('Already voted');

            await tx.member.update({
                where: { id: memberId },
                data: { hasVoted: true },
            });

            for (const v of votes) {
                await tx.vote.create({
                    data: {
                        memberId,
                        positionId: v.positionId,
                        candidateId: v.candidateId,
                    },
                });
            }
        });

        return NextResponse.json({ message: 'Vote cast successfully' });
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'Already voted') {
            return NextResponse.json({ error: 'You have already voted.' }, { status: 403 });
        }
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
