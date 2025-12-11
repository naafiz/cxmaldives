```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifySession(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let settings = await prisma.electionSettings.findFirst();

        if (!settings) {
            // Create default if not exists
            settings = await prisma.electionSettings.create({
                data: {
                    startTime: new Date(),
                    endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // +24h
                    isActive: true,
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = await verifySession(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { startTime, endTime, isActive } = body;

        const settings = await prisma.electionSettings.findFirst();

        const updated = await prisma.electionSettings.update({
            where: { id: settings?.id }, // Assumes exists via GET flow or creates
            data: {
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isActive,
            }
        });

        await logAdminAction('SETTINGS_UPDATE', `Updated election window: ${ new Date(startTime).toLocaleString() } - ${ new Date(endTime).toLocaleString() } `);

        return NextResponse.json({ message: 'Settings updated' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```
