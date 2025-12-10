import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { identifier, code, newPassword } = await request.json();

        if (!identifier || !code || !newPassword) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { idCard: identifier },
                    { mobile: identifier }
                ]
            }
        });

        if (!member) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (member.verificationCode !== code) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        if (member.verificationExpires && new Date() > member.verificationExpires) {
            return NextResponse.json({ error: 'Code expired' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update Member
        await prisma.member.update({
            where: { id: member.id },
            data: {
                password: hashedPassword,
                verificationCode: null,
                verificationExpires: null,
                isVerified: true, // Implicitly verify them if they pass OTP? Yes.
            },
        });

        return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });

    } catch (error) {
        console.error('Reset error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
