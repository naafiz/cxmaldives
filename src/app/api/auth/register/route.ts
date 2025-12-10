import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendWhatsAppOTP } from '@/lib/twilio';

export async function POST(request: Request) {
    try {
        const { name, idCard, mobile, email, password } = await request.json();

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

        // Generate 6-digit OTP
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Create Member
        const member = await prisma.member.create({
            data: {
                name,
                idCard,
                mobile,
                email: email || null,
                password: hashedPassword,
                verificationCode,
                verificationExpires,
                isVerified: false,
            },
        });

        // Send OTP via WhatsApp
        try {
            await sendWhatsAppOTP(mobile, verificationCode);
        } catch (error) {
            console.error('Failed to send WhatsApp OTP:', error);
            // Optional: return error or allow registration but warn?
            // For now, valid flow requires OTP.
        }

        return NextResponse.json({ message: 'User created. OTP sent.' }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
