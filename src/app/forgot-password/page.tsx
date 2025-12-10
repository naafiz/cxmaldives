'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [identifier, setIdentifier] = useState(''); // ID Card or Mobile
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setStep('reset');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, code: otp, newPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            router.push('/login');
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
                    Reset Password
                </h1>

                {error && (
                    <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', padding: '8px', borderRadius: '8px', color: '#ff6b6b', marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                {step === 'request' ? (
                    <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Enter your ID Card Number or Mobile Number to receive a reset code via WhatsApp.
                        </p>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>ID Card / Mobile</label>
                            <input
                                className="input-field"
                                placeholder="AXXXXXX or 9XXXXXX"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending Code...' : 'Send Reset Code'}
                        </button>
                        <a href="/login" style={{ textAlign: 'center', color: 'var(--text-utils)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Back to Login
                        </a>
                    </form>
                ) : (
                    <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            Code sent to your mobile.
                        </p>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Verification Code</label>
                            <input
                                className="input-field"
                                placeholder="123456"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>New Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Resetting...' : 'Set New Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
