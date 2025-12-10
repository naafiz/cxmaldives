import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Check Admin Settings
        const settings = await prisma.electionSettings.findFirst();

        const now = new Date();
        const startTime = settings?.startTime ? new Date(settings.startTime) : new Date();
        const endTime = settings?.endTime ? new Date(settings.endTime) : new Date();

        // "isOpen" means: Master Switch is ON AND (Time is within window OR we are in "Testing Mode" which isn't implemented via env var, relying on dates).
        // Logic: if not active, then closed. If active, check dates.
        const isActive = settings?.isActive ?? true;
        const isTimeValid = now >= startTime && now <= endTime;

        const isOpen = isActive && isTimeValid;

        // Check Positions
        const positionCount = await prisma.position.count();

        return NextResponse.json({
            isOpen,
            isActive,
            isTimeValid,
            positionCount,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching status' }, { status: 500 });
    }
}
