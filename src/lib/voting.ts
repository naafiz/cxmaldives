import prisma from '@/lib/prisma';

export async function isVotingOpen() {
    // Verifying voting status solely from Database settings


    try {
        const settings = await prisma.electionSettings.findFirst();

        // If no settings found, fallback to closed or safe default?
        // Let's assume closed if not configured to be safe.
        if (!settings) return false;

        if (!settings.isActive) return false;

        const now = new Date();
        return now >= settings.startTime && now <= settings.endTime;
    } catch (e) {
        console.error("Failed to check voting status", e);
        return false; // Fail safe
    }
}
