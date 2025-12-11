'use client';

import { useEffect, useState, useCallback } from 'react';
import Skeleton from '@/components/Skeleton';

interface Member {
    id: string;
    name: string;
    idCard: string;
    mobile: string;
    email: string;
    lastLogin: string | null;
}

export default function ManageMembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string[]>([]);

    const fetchMembers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/members');
            if (res.ok) {
                setMembers(await res.json());
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const toggleSelect = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(x => x !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selected.length === members.length) {
            setSelected([]);
        } else {
            setSelected(members.map(m => m.id));
        }
    };

    const deleteMembers = async (ids: string[]) => {
        if (!confirm(`Are you sure you want to delete ${ids.length} member(s)?`)) return;

        await fetch('/api/admin/members', {
            method: 'DELETE',
            body: JSON.stringify({ ids })
        });

        setSelected([]);
        fetchMembers();
    };

    if (loading) return (
        <div>
            <Skeleton width="200px" height="40px" style={{ marginBottom: '20px' }} />
            <Skeleton width="100%" height="400px" />
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="title-gradient">Manage Members</h1>
                {selected.length > 0 && (
                    <button
                        onClick={() => deleteMembers(selected)}
                        className="btn btn-primary"
                        style={{ background: '#ff6b6b', borderColor: '#ff6b6b' }}
                    >
                        Delete Selected ({selected.length})
                    </button>
                )}
            </div>

            <div className="card">
                {members.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>There are currently no registered members.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>
                                    <input
                                        type="checkbox"
                                        checked={members.length > 0 && selected.length === members.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>ID Card</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Mobile</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Last Login</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(m => (
                                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(m.id)}
                                            onChange={() => toggleSelect(m.id)}
                                        />
                                    </td>
                                    <td style={{ padding: '10px' }}>{m.name}</td>
                                    <td style={{ padding: '10px' }}>{m.idCard}</td>
                                    <td style={{ padding: '10px' }}>{m.mobile}</td>
                                    <td style={{ padding: '10px' }}>{m.email}</td>
                                    <td style={{ padding: '10px', color: m.lastLogin ? 'inherit' : 'var(--text-muted)' }}>
                                        {m.lastLogin ? new Date(m.lastLogin).toLocaleString() : 'Never'}
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => deleteMembers([m.id])}
                                            style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
