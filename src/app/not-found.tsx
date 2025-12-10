'use client';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--pk-primary)' }}>404</h1>
            <h2 style={{ marginBottom: '1.5rem' }}>Lost in the digital ocean? 🌊</h2>
            <p style={{ maxWidth: '400px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                We pride ourselves on brilliant customer experience, but even we can&apos;t find the page you&apos;re looking for.
                It might have gone snorkeling.
            </p>
            <button onClick={() => router.push('/login')} className="btn btn-primary">
                Swim back to Login
            </button>
        </div>
    );
}
