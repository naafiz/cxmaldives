import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { mobile, code } = await request.json();

        if (!mobile || !code) {
            return NextResponse.json({ error: 'Mobile and Code are required' }, { status: 400 });
        }

        const member = await prisma.member.findUnique({
            where: { mobile },
        });

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        if (member.isVerified) {
            return NextResponse.json({ message: 'Already verified' }, { status: 200 });
        }

        if (member.verificationCode !== code) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        if (member.verificationExpires && new Date() > member.verificationExpires) {
            return NextResponse.json({ error: 'Code expired' }, { status: 400 });
        }

        await prisma.member.update({
            where: { id: member.id },
            data: {
                isVerified: true,
                verificationCode: null,
                verificationExpires: null,
            },
        });

        // Auto-Login: Create Session
        const session = await signSession({ id: member.id, name: member.name, role: 'member' });

        (await cookies()).set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return NextResponse.json({ message: 'Verification successful. You are now logged in.', redirect: '/vote' }, { status: 200 });
    } catch (error) {
        console.error('Verify error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
