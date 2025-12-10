'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Load saved theme or default to dark
        const saved = localStorage.getItem('theme') || 'dark';
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
    }, []);

    const toggleTheme = () => {
        let newTheme = 'dark';
        if (theme === 'dark') newTheme = 'light';
        else if (theme === 'light') newTheme = 'contrast';
        else newTheme = 'dark';

        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            style={{
                // Removed inline positioning, moved to globals.css
            }}
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? '☀️' : theme === 'light' ? '👁️' : '🌙'}
        </button>
    );
}
