import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { name, idCard, mobile, email, password } = await request.json();

        // 1. Check Whitelist
        const whitelisted = await prisma.whitelist.findUnique({
            where: { idCard: idCard.toUpperCase() } // Whitelist should be uppercase AXXXXXX
        });

        if (!whitelisted) {
            return NextResponse.json({ error: 'Your ID Card is not whitelisted for registration.' }, { status: 403 });
        }

        if (!name || !idCard || !mobile || !password) {
            return NextResponse.json({ error: 'All fields (except email) are required' }, { status: 400 });
        }

        // Check duplicates
        const existing = await prisma.member.findFirst({
            where: {
                OR: [{ idCard }, { mobile }],
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Member with this ID Card or Mobile already exists' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Member (isVerified defaults to false in schema if not provided, but explicit is good)
        // User requested: keep isVerified = false
        const member = await prisma.member.create({
            data: {
                name,
                idCard,
                mobile,
                email,
                password: hashedPassword,
                isVerified: false, // Explicitly false as requested
            },
        });

        // No OTP sent.
        return NextResponse.json({ message: 'Registration successful. Please login.' }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
