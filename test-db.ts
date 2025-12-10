import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        const count = await prisma.member.count();
        console.log(`Member count: ${count}`);

        console.log('Checking ElectionSettings...');
        const settings = await prisma.electionSettings.findFirst();
        console.log('ElectionSettings:', settings);

        if (!settings) {
            console.log('Creating default settings...');
            const newSettings = await prisma.electionSettings.create({
                data: {
                    startTime: new Date(),
                    endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // +24h
                    isActive: true,
                }
            });
            console.log('Created:', newSettings);
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
