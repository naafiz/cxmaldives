'use client';

import { useEffect, useState } from 'react';
import Skeleton from '@/components/Skeleton';

export default function WhitelistPage() {
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newId, setNewId] = useState('');

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        const res = await fetch('/api/admin/whitelist');
        if (res.ok) setList(await res.json());
        setLoading(false);
    };

    const addId = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/whitelist', {
            method: 'POST',
            body: JSON.stringify({ idCard: newId })
        });
        if (res.ok) {
            setNewId('');
            fetchList();
        } else {
            alert('Failed to add. Maybe duplicate?');
        }
    };

    const removeId = async (item: any) => {
        if (!confirm(`Remove ${item.idCard}?`)) return;
        await fetch('/api/admin/whitelist', {
            method: 'DELETE',
            body: JSON.stringify({ id: item.id, idCard: item.idCard })
        });
        fetchList();
    };

    if (loading) return <Skeleton width="100%" height="400px" />;

    return (
        <div>
            <h1 className="title-gradient">Whitelist Management</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Only ID cards listed here can register.</p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <form onSubmit={addId} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        className="input-field"
                        placeholder="ID Card (e.g. A123456)"
                        value={newId}
                        onChange={e => setNewId(e.target.value.toUpperCase())}
                        required
                    />
                    <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Add to Whitelist</button>
                </form>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ textAlign: 'left', padding: '10px' }}>ID Card</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Date Added</th>
                            <th style={{ textAlign: 'right', padding: '10px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 && <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center' }}>Whitelist is empty. Anyone can register (if not enforced) or No one (if enforced).</td></tr>}
                        {list.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '10px' }}>{item.idCard}</td>
                                <td style={{ padding: '10px' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                    <button onClick={() => removeId(item)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
