'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Flatpickr from 'react-flatpickr';
import "flatpickr/dist/themes/dark.css";

export default function AdminPage() {
    const router = useRouter();
    // ... existing ...

    function ParticipationList() {
        const [voters, setVoters] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetch('/api/admin/participation')
                .then(res => res.json())
                .then(data => {
                    setVoters(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(err => setLoading(false));
        }, []);

        if (loading) return <div>Loading participation data...</div>;

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



    const [positions, setPositions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [newPosition, setNewPosition] = useState({ title: '', description: '' });
    const [newCandidate, setNewCandidate] = useState({ name: '', positionId: '' });

    // New features
    const [stats, setStats] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchPositions();
        fetchStats();
        fetchSettings();
    }, []);

    const fetchPositions = async () => {
        try {
            const res = await fetch('/api/admin/positions');
            if (res.status === 401) {
                router.push('/login');
                return;
            }
            const data = await res.json();
            setPositions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        const res = await fetch('/api/admin/stats');
        if (res.ok) setStats(await res.json());
    };

    const fetchSettings = async () => {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
            const data = await res.json();
            // Ensure dates are valid for input
            // API returns ISO string, we keep it as string or date. DatePicker handles Date or parseable string.
            // But state management needs consistency.
            // setSettings({ startTime: new Date(data.startTime), ... }) might be safer if we want types correct.
            // Current code passes new Date(settings.startTime) to props.
            // So we can just set data directly.
            setSettings(data);
        }
    };

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        await fetch('/api/admin/settings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
        setSavingSettings(false);
        alert('Settings saved');
    };

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

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="title-gradient">Admin Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => router.push('/admin/change-password')} className="btn btn-outline" style={{ borderColor: 'var(--pk-primary)', color: 'var(--pk-primary)' }}>
                        Change Password
                    </button>
                    <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); }} className="btn btn-outline">
                        Logout
                    </button>
                </div>
            </div>

            {/* Analytics Section */}
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

            {/* Participation Section */}
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Participation Audit</h2>
            <div className="card" style={{ marginBottom: '3rem', maxHeight: '400px', overflowY: 'auto' }}>
                <ParticipationList />
            </div>

            {/* Settings Section */}
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Voting Configuration</h2>
            <div className="card" style={{ marginBottom: '3rem' }}>
                {!settings && !loading && (
                    <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
                        <p>Failed to load settings.</p>
                        <button onClick={fetchSettings} className="btn btn-outline" style={{ marginTop: '10px' }}>Retry</button>
                    </div>
                )}
                {settings && (

                    <form onSubmit={saveSettings} className="settings-form">
                        <h3>Election Window</h3>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Start Time</label>
                            <Flatpickr
                                value={settings.startTime}
                                onChange={([date]) => setSettings({ ...settings, startTime: date })}
                                options={{ enableTime: true, dateFormat: "F j, Y h:i K", time_24hr: false }}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>End Time</label>
                            <Flatpickr
                                value={settings.endTime}
                                onChange={([date]) => setSettings({ ...settings, endTime: date })}
                                options={{ enableTime: true, dateFormat: "F j, Y h:i K", time_24hr: false }}
                                className="input-field"
                            />
                        </div>
                        <button className="btn btn-primary" disabled={savingSettings}>
                            {savingSettings ? 'Saving...' : 'Update Window'}
                        </button>
                    </form>
                )}


            </div>

            {/* Management Section */}
            <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Management</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
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

            <h2 style={{ margin: '3rem 0 1rem' }}>Election Positions</h2>
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
                            {p.candidates.map((c: any) => (
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
