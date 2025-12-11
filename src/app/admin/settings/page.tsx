'use client';

import { useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import "flatpickr/dist/themes/dark.css";
import Skeleton from '@/components/Skeleton';

interface Settings {
    startTime: Date;
    endTime: Date;
    isActive: boolean;
}

export default function VotingWindowPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                setSettings(await res.json());
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

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

    if (loading) return <Skeleton width="100%" height="300px" />;

    return (
        <div>
            <h1 className="title-gradient" style={{ marginBottom: '2rem' }}>Voting Window</h1>
            <div className="card">
                {!settings ? (
                    <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
                        <p>Failed to load settings.</p>
                        <button onClick={() => window.location.reload()} className="btn btn-outline" style={{ marginTop: '10px' }}>Retry</button>
                    </div>
                ) : (
                    <>
                        <h3 style={{ marginBottom: '1rem' }}>Configure Election Duration</h3>
                        <form onSubmit={saveSettings} className="settings-form">
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
                    </>
                )}
            </div>
        </div>
    );
}
