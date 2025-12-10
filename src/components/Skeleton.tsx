'use client';

export default function Skeleton({ width = '100%', height = '20px', style = {} }: { width?: string, height?: string, style?: any }) {
    return (
        <div
            className="skeleton"
            style={{
                width,
                height,
                backgroundColor: 'var(--glass-border)', /* Fallback */
                borderRadius: 'var(--radius)',
                ...style
            }}
        />
    );
}
