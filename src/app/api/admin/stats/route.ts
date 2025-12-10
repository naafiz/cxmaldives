import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifySession(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all positions
        const positions = await prisma.position.findMany({
            include: {
                candidates: {
                    include: {
                        _count: {
                            select: { votes: true }
                        }
                    }
                }
            }
        });

        // Format data: Position Title, Candidates [{ name, count }]
        const stats = positions.map(p => ({
            id: p.id,
            title: p.title,
            candidates: p.candidates.map(c => ({
                id: c.id,
                name: c.name,
                count: c._count.votes
            }))
        }));

        return NextResponse.json(stats);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
