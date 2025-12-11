import prisma from './prisma';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { verifySession } from './auth';

export async function logAdminAction(action: string, details?: string) {
    try {
        const headerStore = await headers();
        const ip = headerStore.get('x-forwarded-for') || 'unknown';

        const cookieStore = await cookies();
        const session = cookieStore.get('session')?.value;
        let adminId = 'system';

        if (session) {
            const payload = await verifySession(session);
            if (payload && payload.id) adminId = payload.id as string;
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
