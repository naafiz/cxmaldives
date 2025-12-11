import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'super-secret-key-change-in-prod';
const key = new TextEncoder().encode(SECRET_KEY);

export async function signSession(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function verifySession(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;

        return payload;
    } catch (error) {
        return null;
    }
}

import { cookies } from 'next/headers';

export async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return false;
    const session = await verifySession(token);
    return session?.role === 'admin';
}
