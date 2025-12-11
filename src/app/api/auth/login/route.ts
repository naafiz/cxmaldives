import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSession } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { idCard, password } = await request.json();

        console.log('Login attempt:', idCard);

        if (!idCard || !password) {
            return NextResponse.json({ error: 'ID Card and Password are required' }, { status: 400 });
        }

        // 1. Check Admin
        const admin = await prisma.admin.findUnique({
            where: { username: idCard },
        });

        if (admin && await bcrypt.compare(password, admin.password)) {
            await logAdminAction('ADMIN_LOGIN', `Admin ${admin.username} logged in`, admin.id);

            const session = await signSession({ id: admin.id, name: admin.username, role: 'admin' });

            (await cookies()).set('session', session, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24, // 24 hours
            });

            return NextResponse.json({ message: 'Login successful', role: 'admin' }, { status: 200 });
        }

        // 2. Check Member
        const member = await prisma.member.findUnique({
            where: { idCard },
        });

        if (!member) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, member.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Log Member Login
        await logAdminAction('MEMBER_LOGIN', `Member ${member.name} (${member.idCard}) logged in`, member.id);

        // Update Last Login
        await prisma.member.update({
            where: { id: member.id },
            data: { lastLogin: new Date() }
        });

        // Create Session
        const session = await signSession({ id: member.id, name: member.name, role: 'member' });

        // Set Cookie
        (await cookies()).set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return NextResponse.json({ message: 'Login successful', role: 'member' }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
