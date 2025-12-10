'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        idCard: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            if (data.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.75rem' }}>
                    Welcome to <br /> CX Maldives AGM
                </h1>

                {error && (
                    <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', padding: '8px', borderRadius: '8px', color: '#ff6b6b', marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>ID Card Number</label>
                        <input name="idCard" className="input-field" placeholder="AXXXXXX" required onChange={handleChange} value={formData.idCard} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Password</label>
                        <input name="password" type="password" className="input-field" placeholder="••••••••" required onChange={handleChange} value={formData.password} />
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                        <a href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--pk-primary)', textDecoration: 'none' }}>
                            Forgot Password?
                        </a>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Not a member yet? <a href="/register" style={{ color: 'var(--pk-primary)' }}>Register</a>
                    </p>
                </form>
            </div>
        </div>
    );
}
