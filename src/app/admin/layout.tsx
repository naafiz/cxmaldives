'use client';

import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: 'Dashboard', path: '/admin' },
        { name: 'Manage Members', path: '/admin/members' },
        { name: 'Voting Window', path: '/admin/settings' },
        { name: 'Positions & Candidates', path: '/admin/positions' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{ width: '250px', background: 'var(--bg-card)', borderRight: '1px solid var(--glass-border)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ marginBottom: '2rem', paddingLeft: '10px' }} className="title-gradient">CMS Admin</h2>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map(item => {
                        const isActive = pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                style={{
                                    textAlign: 'left',
                                    padding: '10px 15px',
                                    background: isActive ? 'var(--pk-primary)' : 'transparent',
                                    color: isActive ? '#000' : 'var(--text-main)',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    fontWeight: isActive ? 'bold' : 'normal',
                                    transition: '0.2s'
                                }}
                            >
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    <button
                        onClick={() => router.push('/admin/change-password')}
                        style={{ width: '100%', padding: '10px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        Change Password
                    </button>
                    <button
                        onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); }}
                        style={{ width: '100%', padding: '10px', textAlign: 'left', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}
