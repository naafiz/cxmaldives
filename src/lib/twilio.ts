import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER || 'whatsapp:+14155238886'; // Default to Sandbox
const contentSid = process.env.TWILIO_CONTENT_SID || 'HX229f5a04fd0510ce1b071852155d3e75';

// Initialize client if credentials exist
const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export async function sendWhatsAppOTP(mobile: string, otp: string) {
    if (!client) {
        console.log('Twilio credentials missing. MOCK sending OTP:', otp, 'to', mobile);
        return true;
    }

    // Ensure E.164 format for Maldives if not present
    let toMobile = mobile.replace(/\D/g, ''); // Remove non-digits
    if (toMobile.length === 7) {
        toMobile = `+960${toMobile}`;
    } else if (!toMobile.startsWith('+')) {
        toMobile = `+${toMobile}`;
    }

    // Prefix with whatsapp:
    const to = `whatsapp:${toMobile}`;

    try {
        console.log(`Sending WhatsApp OTP via Twilio to ${to}...`);

        const message = await client.messages.create({
            from: fromNumber,
            contentSid: contentSid,
            contentVariables: JSON.stringify({ "1": otp }),
            to: to
        });

        console.log('Twilio Message SID:', message.sid);
        return true;
    } catch (error) {
        console.error('Twilio Error:', error);
        // Fallback or re-throw? For now, we want to know if it fails.
        throw error;
    }
}
