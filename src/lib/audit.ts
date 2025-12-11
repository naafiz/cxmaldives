import prisma from './prisma';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { verifySession } from './auth';

export async function logAdminAction(action: string, details?: string, actorId?: string) {
    try {
        const headerStore = await headers();
        const ip = headerStore.get('x-forwarded-for') || 'unknown';

        let adminId = actorId || 'system';

        if (!actorId) {
            const cookieStore = await cookies();
            const session = cookieStore.get('session')?.value;

            if (session) {
                const payload = await verifySession(session);
                if (payload && payload.id) adminId = payload.id as string;
            }
        }

        await prisma.auditLog.create({
            data: {
                action,
                details: details ? JSON.stringify(details) : undefined,
                ip,
                adminId,
            }
        });
    } catch (e) {
        console.error('Failed to write audit log:', e);
    }
}
