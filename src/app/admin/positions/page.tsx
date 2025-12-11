'use client';

import { useEffect, useState } from 'react';
import Skeleton from '@/components/Skeleton';

interface Candidate {
    id: string;
    name: string;
    positionId: string;
}

interface Position {
    id: string;
    title: string;
    description: string;
    candidates: Candidate[];
}

export default function PositionsPage() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPosition, setNewPosition] = useState({ title: '', description: '' });
    const [newCandidate, setNewCandidate] = useState({ name: '', positionId: '' });

    const fetchPositions = async () => {
        const res = await fetch('/api/admin/positions');
        if (res.ok) {
            setPositions(await res.json());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    const createPosition = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/positions', {
            method: 'POST',
            body: JSON.stringify(newPosition),
        });
        setNewPosition({ title: '', description: '' });
        fetchPositions();
    };

    const addCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCandidate.positionId) return;
        await fetch('/api/admin/candidates', {
            method: 'POST',
            body: JSON.stringify(newCandidate),
        });
        setNewCandidate({ name: '', positionId: '' });
        fetchPositions();
    };

    const deleteCandidate = async (id: string) => {
        if (!confirm('Delete candidate?')) return;
        await fetch('/api/admin/candidates', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        fetchPositions();
    };

    if (loading) return <Skeleton width="100%" height="400px" />;

    return (
        <div>
            <h1 className="title-gradient" style={{ marginBottom: '2rem' }}>Positions & Candidates</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="card">
                    <h2 style={{ marginBottom: '1rem' }}>Add Position</h2>
                    <form onSubmit={createPosition} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            placeholder="Title (e.g. President)"
                            className="input-field"
                            value={newPosition.title}
                            onChange={e => setNewPosition({ ...newPosition, title: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Description"
                            className="input-field"
                            value={newPosition.description}
                            onChange={e => setNewPosition({ ...newPosition, description: e.target.value })}
                        />
                        <button className="btn btn-primary">Create Position</button>
                    </form>
                </div>

                <div className="card">
                    <h2 style={{ marginBottom: '1rem' }}>Add Candidate</h2>
                    <form onSubmit={addCandidate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <select
                            className="input-field"
                            value={newCandidate.positionId}
                            onChange={e => setNewCandidate({ ...newCandidate, positionId: e.target.value })}
                            required
                            style={{ color: newCandidate.positionId ? 'var(--text-main)' : 'var(--text-muted)' }}
                        >
                            <option value="">Select Position</option>
                            {positions.map(p => (
                                <option key={p.id} value={p.id} style={{ color: '#000' }}>{p.title}</option>
                            ))}
                        </select>
                        <input
                            placeholder="Candidate Name"
                            className="input-field"
                            value={newCandidate.name}
                            onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
                            required
                        />
                        <button className="btn btn-primary">Add Candidate</button>
                    </form>
                </div>
            </div>

            <h2 style={{ margin: '1rem 0' }}>Current Positions</h2>
            <div style={{ display: 'grid', gap: '2rem' }}>
                {positions.map(p => (
                    <div key={p.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{p.title}</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{p.description}</p>
                            </div>
                            <button
                                onClick={async () => {
                                    if (!confirm('Delete this position? This will delete all candidates and votes associated with it!')) return;
                                    await fetch('/api/admin/positions', { method: 'DELETE', body: JSON.stringify({ id: p.id }) });
                                    fetchPositions();
                                }}
                                style={{ background: 'none', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                            >
                                Delete Position
                            </button>
                        </div>

                        <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Candidates</h4>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {p.candidates.length === 0 && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No candidates yet.</p>}
                            {p.candidates.map((c) => (
                                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                    <span>{c.name}</span>
                                    <button onClick={() => deleteCandidate(c.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
