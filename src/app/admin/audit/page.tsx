'use client';

import { useEffect, useState } from 'react';
import Skeleton from '@/components/Skeleton';

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/audit')
            .then(res => res.json())
            .then(data => {
                setLogs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <Skeleton width="100%" height="400px" />;

    return (
        <div>
            <h1 className="title-gradient" style={{ marginBottom: '2rem' }}>Audit Log</h1>
            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Action</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Admin</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>IP</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '10px', fontSize: '0.9rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{log.action}</td>
                                <td style={{ padding: '10px', fontSize: '0.9rem' }}>{log.adminId}</td>
                                <td style={{ padding: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{log.ip}</td>
                                <td style={{ padding: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{log.details && log.details.replace(/"/g, '')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
