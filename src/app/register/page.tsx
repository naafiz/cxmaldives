'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        idCard: '',
        email: '',
        mobile: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validations
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(formData.name)) {
            setError('Name must only contain uppercase and lowercase letters.');
            setLoading(false);
            return;
        }

        const idRegex = /^A\d{6}$/;
        if (!idRegex.test(formData.idCard)) {
            setError('ID Card must start with "A" followed by 6 digits (e.g., A123456).');
            setLoading(false);
            return;
        }

        if (formData.mobile.length !== 7 || isNaN(Number(formData.mobile))) {
            setError('Mobile number must be exactly 7 digits.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Registration failed');

            // Success - Redirect to login
            alert('Registration successful! Please login.');
            router.push('/login');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.75rem' }}>
                    Register for <br /> CX Maldives AGM
                </h1>

                {error && (
                    <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', padding: '8px', borderRadius: '8px', color: '#ff6b6b', marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(255,255,0,0.1)', padding: '10px', borderRadius: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        ⚠️ Please ensure your Name and ID Card match your official documents. This is required for AGM voting rights.
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Full Name</label>
                        <input name="name" className="input-field" placeholder="Your Name" required onChange={handleChange} value={formData.name} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>ID Card Number</label>
                        <input name="idCard" className="input-field" placeholder="AXXXXXX" required onChange={handleChange} value={formData.idCard} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Mobile Number</label>
                        <input name="mobile" type="tel" inputMode="numeric" pattern="[0-9]*" className="input-field" placeholder="7XXXXXX" required onChange={handleChange} value={formData.mobile} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Email Address</label>
                        <input name="email" type="email" className="input-field" placeholder="name@example.com" required onChange={handleChange} value={formData.email} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Password</label>
                        <input name="password" type="password" className="input-field" placeholder="••••••••" required onChange={handleChange} value={formData.password} />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : 'Register'}
                    </button>

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Already a member? <a href="/login" style={{ color: 'var(--pk-primary)' }}>Login</a>
                    </p>
                </form>
            </div>
        </div>
    );
}
