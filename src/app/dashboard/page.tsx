'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/my-votes');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setHasVoted(data.hasVoted);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="title-gradient">Dashboard</h1>
                <button onClick={handleLogout} className="btn btn-outline">Logout</button>
            </div>

            <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Welcome to CX Maldives</h2>

                {hasVoted ? (
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Thank you for casting your vote in CX Maldives AGM.
                    </p>
                ) : (
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Your membership is active. Please proceed to cast your vote for the AGM.
                    </p>
                )}

                <button onClick={() => router.push('/vote')} className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '15px 30px' }}>
                    {hasVoted ? 'See How You Voted' : 'Go to Voting Page'}
                </button>
            </div>
        </div>
    );
}
