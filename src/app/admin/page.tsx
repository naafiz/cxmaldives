'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/Skeleton';

export default function AdminDashboardPage() {
    // const router = useRouter(); // Unused
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            await Promise.all([fetchStats(), fetchStatus()]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        const res = await fetch('/api/admin/stats');
        if (res.ok) setStats(await res.json());
    };

    const fetchStatus = async () => {
        const res = await fetch('/api/election-status');
        if (res.ok) setStatus(await res.json());
    }

    function ParticipationList() {
        const [voters, setVoters] = useState<any[]>([]);
        const [listLoading, setListLoading] = useState(true);

        useEffect(() => {
            fetch('/api/admin/participation')
                .then(res => res.json())
                .then(data => {
                    setVoters(Array.isArray(data) ? data : []);
                    setListLoading(false);
                })
                .catch(err => setListLoading(false));
        }, []);

        if (listLoading) return <div>Loading participation data...</div>;

        return (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>ID Card</th>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Voted At</th>
                    </tr>
                </thead>
                <tbody>
                    {voters.map(v => (
                        <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '10px' }}>{v.name}</td>
                            <td style={{ padding: '10px' }}>{v.idCard}</td>
                            <td style={{ padding: '10px' }}>{new Date(v.updatedAt).toLocaleString()}</td>
                        </tr>
                    ))}
                    {voters.length === 0 && (
                        <tr>
                            <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No one has voted yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    if (loading) return <Skeleton width="100%" height="500px" />;

    const hasElection = status && status.positionCount > 0;

    return (
        <div>
            <h1 className="title-gradient" style={{ marginBottom: '2rem' }}>Dashboard Home</h1>

            {!hasElection && (
                <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem' }}>
                    <h2>No Active Election</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                        There are no voting positions configured. Go to "Positions & Candidates" to set up an election.
                    </p>
                </div>
            )}

            {/* Analytics Section */}
            {hasElection && (
                <>
                    <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Voting Analytics</h2>
                    <div style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>
                        {stats.map(s => (
                            <div key={s.id} className="card">
                                <h3>{s.title}</h3>
                                <div style={{ marginTop: '1rem' }}>
                                    {s.candidates.map((c: any) => {
                                        const max = Math.max(...s.candidates.map((x: any) => x.count), 1);
                                        const width = (c.count / max) * 100;
                                        return (
                                            <div key={c.id} style={{ marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                    <span>{c.name}</span>
                                                    <span style={{ fontWeight: 'bold' }}>{c.count}</span>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${width}%`, background: 'var(--pk-primary)', height: '100%' }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Participation Section */}
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Participation Audit</h2>
            <div className="card" style={{ marginBottom: '3rem', maxHeight: '400px', overflowY: 'auto' }}>
                <ParticipationList />
            </div>
        </div>
    );
}
