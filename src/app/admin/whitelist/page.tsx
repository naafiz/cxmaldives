'use client';

import { useEffect, useState, useCallback } from 'react';
import Skeleton from '@/components/Skeleton';

interface WhitelistItem {
    id: string;
    mobile: string;
    createdAt: string;
}

export default function WhitelistPage() {
    const [list, setList] = useState<WhitelistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMobile, setNewMobile] = useState('');

    const fetchList = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/whitelist');
            if (res.ok) setList(await res.json());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const addMobile = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/whitelist', {
            method: 'POST',
            body: JSON.stringify({ mobile: newMobile })
        });
        if (res.ok) {
            setNewMobile('');
            fetchList();
        } else {
            alert('Failed to add. Maybe duplicate?');
        }
    };

    const removeMobile = async (item: WhitelistItem) => {
        if (!confirm(`Remove ${item.mobile}?`)) return;
        await fetch('/api/admin/whitelist', {
            method: 'DELETE',
            body: JSON.stringify({ id: item.id, mobile: item.mobile })
        });
        fetchList();
    };

    if (loading) return <Skeleton width="100%" height="400px" />;

    return (
        <div>
            <h1 className="title-gradient">Whitelist Management</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Only Mobile Numbers listed here can register.</p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <form onSubmit={addMobile} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        className="input-field"
                        placeholder="Mobile Number (e.g. 960xxxxxxx)"
                        value={newMobile}
                        onChange={e => setNewMobile(e.target.value)}
                        required
                    />
                    <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Add to Whitelist</button>
                </form>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Mobile Number</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Date Added</th>
                            <th style={{ textAlign: 'right', padding: '10px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 && <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center' }}>Whitelist is empty. Anyone can register (if not enforced) or No one (if enforced).</td></tr>}
                        {list.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '10px' }}>{item.mobile}</td>
                                <td style={{ padding: '10px' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                    <button onClick={() => removeMobile(item)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
