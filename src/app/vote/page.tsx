'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VotingPage() {
    const router = useRouter();
    const [positions, setPositions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selections, setSelections] = useState<{ [key: string]: string }>({}); // positionId -> candidateId
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false); // Used to trigger fetch of updated status or just local UI update
    const [hasVoted, setHasVoted] = useState(false);

    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [posRes, voteRes, statusRes] = await Promise.all([
                fetch('/api/admin/positions'),
                fetch('/api/my-votes'),
                fetch('/api/election-status')
            ]);

            if (posRes.status === 401) { router.push('/login'); return; }

            const posData = await posRes.json();
            setPositions(posData);

            if (voteRes.ok) {
                const voteData = await voteRes.json();
                if (voteData.hasVoted) {
                    setHasVoted(true);
                    const votesMap: any = {};
                    voteData.votes.forEach((v: any) => { votesMap[v.positionId] = v.candidateId; });
                    setSelections(votesMap);
                }
            }

            if (statusRes.ok) {
                setStatus(await statusRes.json());
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectCandidate = (positionId: string, candidateId: string) => {
        if (hasVoted) return; // Read only
        setSelections(prev => ({ ...prev, [positionId]: candidateId }));
    };

    const submitVote = async () => {
        // Validation: Check if all positions have a selection
        if (positions.length > Object.keys(selections).length) {
            alert('Please select a vote for every position before submitting.');
            return;
        }

        if (!confirm('Are you sure you want to submit your vote? This cannot be undone.')) return;

        setSubmitting(true);
        setError('');

        const votes = Object.entries(selections).map(([positionId, candidateId]) => ({
            positionId,
            candidateId,
        }));

        try {
            const res = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ votes }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Voting failed');

            setSuccess(true);
            setHasVoted(true);
            window.scrollTo(0, 0);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    // Block if closed (unless verifying own vote)
    const isClosed = status && (!status.isOpen || status.positionCount === 0);
    if (isClosed && !hasVoted) {
        return (
            <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
                <h1 className="title-gradient">Voting Closed</h1>
                <div className="card" style={{ marginTop: '2rem', padding: '3rem' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                        {status?.positionCount === 0 ? "There are no positions to vote for." : "The voting window is currently closed."}
                    </p>
                    <button onClick={() => router.push('/dashboard')} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h1 className="title-gradient" style={{ marginBottom: '2rem', textAlign: 'center' }}>Official Ballot</h1>

            {hasVoted && (
                <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--pk-primary)', background: 'rgba(0, 128, 128, 0.1)' }}>
                    <h2 style={{ color: 'var(--pk-primary)', textAlign: 'center', marginBottom: '0.5rem' }}>
                        {success ? 'Vote Submitted Successfully' : 'You have already voted'}
                    </h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        You cannot change your vote. Your selections are shown below.
                    </p>
                </div>
            )}

            {error && (
                <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', padding: '10px', borderRadius: '8px', color: '#ff6b6b', marginBottom: '2rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {positions.map(p => (
                <div key={p.id} className="card" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem' }}>{p.title}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{p.description}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {p.candidates.length === 1 ? (
                            // Single Candidate UI: Yes/No
                            (() => {
                                const c = p.candidates[0];
                                const isSelected = selections[p.id] === c.id;
                                const isNo = selections[p.id] === 'NO_VOTE';

                                return (
                                    <div key={c.id} style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                                        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{c.name}</h3>
                                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => selectCandidate(p.id, c.id)}
                                                disabled={hasVoted}
                                                style={{
                                                    padding: '10px 30px',
                                                    borderRadius: 'var(--radius)',
                                                    border: 'none',
                                                    background: isSelected ? 'var(--pk-primary)' : 'rgba(255,255,255,0.1)',
                                                    color: '#fff',
                                                    cursor: hasVoted ? 'default' : 'pointer',
                                                    transition: '0.2s',
                                                    flex: 1,
                                                    maxWidth: '200px',
                                                    opacity: hasVoted && !isSelected ? 0.3 : 1
                                                }}
                                            >
                                                YES / APPROVE
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (hasVoted) return;
                                                    // For single candidate, NO means explicitly opting out of YES, 
                                                    // effectively abstaining or rejecting.
                                                    // We record it as 'NO_VOTE' or similar if backend handles it, 
                                                    // or here just ensure a selection is made.
                                                    // User asked validation: "Need to select their vote".
                                                    // So we must record a "NO" selection state.
                                                    setSelections(prev => ({ ...prev, [p.id]: 'NO_VOTE' }));
                                                }}
                                                disabled={hasVoted}
                                                style={{
                                                    padding: '10px 30px',
                                                    borderRadius: 'var(--radius)',
                                                    border: 'none',
                                                    // Highlight if explicitly NO selected
                                                    background: isNo ? '#ff6b6b' : 'rgba(255,255,255,0.1)',
                                                    color: '#fff',
                                                    cursor: hasVoted ? 'default' : 'pointer',
                                                    transition: '0.2s',
                                                    flex: 1,
                                                    maxWidth: '200px',
                                                    opacity: hasVoted && !isNo ? 0.3 : 1
                                                }}
                                            >
                                                NO / REJECT
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()
                        ) : (
                            // Multiple Candidates
                            p.candidates.map((c: any) => {
                                const isSelected = selections[p.id] === c.id;
                                const isGrayedOut = hasVoted && !isSelected;

                                return (
                                    <div
                                        key={c.id}
                                        onClick={() => selectCandidate(p.id, c.id)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius)',
                                            border: isSelected ? '2px solid var(--pk-primary)' : '1px solid var(--glass-border)',
                                            background: isSelected ? 'rgba(0,128,128,0.2)' : 'rgba(255,255,255,0.05)',
                                            cursor: hasVoted ? 'default' : 'pointer',
                                            transition: '0.2s',
                                            textAlign: 'center',
                                            opacity: isGrayedOut ? 0.3 : 1
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ))}

            {!hasVoted && (
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button
                        onClick={submitVote}
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{ fontSize: '1.2rem', padding: '15px 40px' }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Official Vote'}
                    </button>
                </div>
            )}

            {hasVoted && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button onClick={() => router.push('/dashboard')} className="btn btn-outline">
                        Back to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
}
