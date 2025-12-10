import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWhatsAppOTP } from '@/lib/twilio';

export async function POST(request: Request) {
    try {
        const { identifier } = await request.json();

        if (!identifier) {
            return NextResponse.json({ error: 'ID Card or Mobile is required' }, { status: 400 });
        }

        // Find member by ID Card OR Mobile
        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { idCard: identifier },
                    { mobile: identifier }
                ]
            }
        });

        if (!member) {
            // For security, do not reveal if user does not exist. Just pretend to send.
            // But for detailed UX, we might want to say "Not found". Let's say "If an account exists..."
            // Or for this internal app, just say "User not found".
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate Code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // ...

        // Update Member
        await prisma.member.update({
            where: { id: member.id },
            data: {
                verificationCode,
                verificationExpires,
            },
        });

        // Send WhatsApp
        await sendWhatsAppOTP(member.mobile, verificationCode);

        return NextResponse.json({ message: 'Code sent successfully' }, { status: 200 });

    } catch (error) {
        console.error('Forgot Password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
