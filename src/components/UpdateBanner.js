import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

const UpdateBanner = () => {
    const { isDarkTheme } = useContext(ThemeContext);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handler = () => setShowBanner(true);
        window.addEventListener('sw-update-available', handler);
        return () => window.removeEventListener('sw-update-available', handler);
    }, []);

    if (!showBanner) return null;

    const handleUpdate = () => {
        window.location.reload();
    };

    return (
        <div className={`update-banner fixed top-0 left-0 right-0 z-[60] px-4 py-3 flex items-center justify-center gap-4 shadow-lg ${isDarkTheme
                ? 'bg-blue-900 text-blue-100'
                : 'bg-blue-600 text-white'
            }`}>
            <span className="text-sm font-medium">
                🆕 Versi baru tersedia!
            </span>
            <button
                onClick={handleUpdate}
                className="px-3 py-1 rounded-lg bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 transition"
            >
                Perbarui Sekarang
            </button>
            <button
                onClick={() => setShowBanner(false)}
                className="text-white/80 hover:text-white text-lg ml-2"
                aria-label="Tutup"
            >
                ✕
            </button>
        </div>
    );
};

export default UpdateBanner;
