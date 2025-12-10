import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

// Helper to check admin role
export const dynamic = 'force-dynamic';

async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return false;

    const payload = await verifySession(token);
    // In a real app we would have role in DB, here we trust the signed payload 'role' claim
    // or check if username exists in Admin table if we saved ID.
    // We saved { id: member.id, role: 'member' } for members.
    // For admin login, we haven't implemented Admin Login yet!
    // Wait, I implemented Member Login. I need Admin Login API or universal login?
    // I created "Admin" table. 
    // I should update Login API to support Admin or create /api/admin/login?
    // Let's stick to /api/auth/login checking both tables or separate?
    // Simpler: Separate Admin Login or check both.
    // Implementation details: verification below assumes 'role' claim.
    return payload?.role === 'admin';
}

export async function GET() {
    // Public or Admin only? Usually public to see positions to vote.
    // Let's make GET public for voting.
    try {
        const positions = await prisma.position.findMany({
            include: { candidates: true },
        });
        return NextResponse.json(positions);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching positions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { title, description } = await request.json();
        const position = await prisma.position.create({
            data: { title, description },
        });
        return NextResponse.json(position, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error creating position' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await request.json();

        // Manual Cascade Delete
        // 1. Delete Votes for this position
        await prisma.vote.deleteMany({ where: { positionId: id } });

        // 2. Delete Candidates for this position
        await prisma.candidate.deleteMany({ where: { positionId: id } });

        // 3. Delete Position
        await prisma.position.delete({ where: { id } });

        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting position' }, { status: 500 });
    }
}
