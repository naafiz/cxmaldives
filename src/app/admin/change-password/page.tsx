'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
    const router = useRouter();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(''); setErr('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/password', {
                method: 'POST',
                body: JSON.stringify({ oldPassword, newPassword })
            });
            const data = await res.json();

            if (res.ok) {
                setMsg('Password updated successfully! Redirecting...');
                setOldPassword('');
                setNewPassword('');
                // Redirect after 2 seconds
                setTimeout(() => {
                    router.push('/admin');
                }, 2000);
            } else {
                setErr(data.error || 'Failed to update password');
            }
        } catch (error) {
            setErr('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '500px' }}>
            <button onClick={() => router.push('/admin')} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
                ← Back to Dashboard
            </button>

            <div className="card" style={{ padding: '3rem' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '2rem' }}>Change Password</h1>

                <form onSubmit={handleChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Current Password</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ background: 'var(--pk-primary)' }}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>

                    {msg && (
                        <div style={{ padding: '1rem', background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                            {msg}
                        </div>
                    )}
                    {err && (
                        <div style={{ padding: '1rem', background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                            {err}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
