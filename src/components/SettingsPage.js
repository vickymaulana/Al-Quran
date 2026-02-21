import React, { useState, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { RECITERS } from './apiService';
import { FiSettings, FiSun, FiMoon, FiType, FiVolume2 } from 'react-icons/fi';

const SettingsPage = () => {
    const { isDarkTheme, toggleTheme } = useContext(ThemeContext);

    const [fontScale, setFontScale] = useState(() => {
        try { const saved = localStorage.getItem('fontScale'); const v = saved ? parseFloat(saved) : 1; return Number.isFinite(v) ? Math.min(1.6, Math.max(0.8, v)) : 1; } catch { return 1; }
    });

    const [defaultReciter, setDefaultReciter] = useState(() => {
        try { return parseInt(localStorage.getItem('preferredReciter') || '7', 10); } catch { return 7; }
    });

    const [tajweedEnabled, setTajweedEnabled] = useState(() => {
        try { return localStorage.getItem('tajweedEnabled') === 'true'; } catch { return false; }
    });

    const handleFontScale = (val) => {
        const clamped = Math.min(1.6, Math.max(0.8, val));
        setFontScale(clamped);
        localStorage.setItem('fontScale', String(clamped));
    };

    const handleReciterChange = (e) => {
        const id = parseInt(e.target.value, 10);
        setDefaultReciter(id);
        localStorage.setItem('preferredReciter', String(id));
    };

    const handleTajweedToggle = () => {
        const nv = !tajweedEnabled;
        setTajweedEnabled(nv);
        localStorage.setItem('tajweedEnabled', String(nv));
    };

    return (
        <div className={`min-h-screen ${isDarkTheme ? 'bg-slate-950 text-white' : 'bg-surface-light text-slate-800'}`}>
            {/* Header */}
            <div className={`${isDarkTheme ? 'bg-hero-dark' : 'bg-hero-light'} islamic-pattern-bg`}>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-14 text-center">
                    <FiSettings className="text-3xl text-white/80 mx-auto mb-3" />
                    <h1 className="text-3xl font-poppins font-bold text-white">Pengaturan</h1>
                </div>
                <svg viewBox="0 0 1440 40" fill="none" className="w-full h-6 md:h-10">
                    <path d="M0 40V20C360 0 720 0 1080 20C1260 30 1380 40 1440 40H0Z" fill={isDarkTheme ? '#020617' : '#f8fafc'} />
                </svg>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-2 pb-16 space-y-5">
                {/* Theme */}
                <div className={`rounded-2xl p-5 ${isDarkTheme ? 'bg-slate-900/50 border border-white/5' : 'bg-white border border-slate-100'} shadow-card`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isDarkTheme ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                {isDarkTheme ? <FiMoon className="text-blue-400" size={18} /> : <FiSun className="text-amber-500" size={18} />}
                            </div>
                            <div>
                                <h3 className={`font-semibold text-sm ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>Tema Aplikasi</h3>
                                <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {isDarkTheme ? 'Mode Gelap' : 'Mode Terang'}
                                </p>
                            </div>
                        </div>
                        <div
                            className={`toggle-switch ${isDarkTheme ? 'active' : ''}`}
                            onClick={toggleTheme}
                            role="switch"
                            aria-checked={isDarkTheme}
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme(); }}
                        />
                    </div>
                </div>

                {/* Font Size */}
                <div className={`rounded-2xl p-5 ${isDarkTheme ? 'bg-slate-900/50 border border-white/5' : 'bg-white border border-slate-100'} shadow-card`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2.5 rounded-xl ${isDarkTheme ? 'bg-violet-500/10' : 'bg-violet-50'}`}>
                            <FiType className="text-violet-500" size={18} />
                        </div>
                        <div>
                            <h3 className={`font-semibold text-sm ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>Ukuran Teks</h3>
                            <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>Atur ukuran teks Arab dan terjemahan</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleFontScale(fontScale - 0.1)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >A-</button>
                        <input
                            type="range" min="0.8" max="1.6" step="0.1"
                            value={fontScale}
                            onChange={(e) => handleFontScale(parseFloat(e.target.value))}
                            className="flex-1"
                            aria-label="Font size"
                        />
                        <button
                            onClick={() => handleFontScale(fontScale + 0.1)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${isDarkTheme ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >A+</button>
                        <span className={`text-xs w-10 text-right tabular-nums ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                            {(fontScale * 100).toFixed(0)}%
                        </span>
                    </div>
                    {/* Preview */}
                    <div className={`mt-4 p-4 rounded-xl border border-dashed ${isDarkTheme ? 'border-slate-700' : 'border-slate-200'}`}>
                        <p className="text-right font-amiri leading-[2.2]" style={{ fontSize: `${fontScale * 1.5}em` }} dir="rtl" lang="ar">
                            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                        </p>
                        <p className={`mt-2 text-left ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`} style={{ fontSize: `${fontScale}em` }}>
                            Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.
                        </p>
                    </div>
                </div>

                {/* Default Qari */}
                <div className={`rounded-2xl p-5 ${isDarkTheme ? 'bg-slate-900/50 border border-white/5' : 'bg-white border border-slate-100'} shadow-card`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2.5 rounded-xl ${isDarkTheme ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                            <FiVolume2 className="text-emerald-500" size={18} />
                        </div>
                        <div>
                            <h3 className={`font-semibold text-sm ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>Qari Default</h3>
                            <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>Pilih pembaca Al-Quran favorit Anda</p>
                        </div>
                    </div>
                    <select
                        value={defaultReciter}
                        onChange={handleReciterChange}
                        className={`w-full px-4 py-3 rounded-xl text-sm outline-none border ${isDarkTheme
                                ? 'bg-slate-800 border-slate-700 text-white focus:border-primary-500'
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-primary-500'
                            } transition-colors`}
                    >
                        {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>

                {/* Tajweed Toggle */}
                <div className={`rounded-2xl p-5 ${isDarkTheme ? 'bg-slate-900/50 border border-white/5' : 'bg-white border border-slate-100'} shadow-card`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${isDarkTheme ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                                <span className="text-base">🎨</span>
                            </div>
                            <div>
                                <h3 className={`font-semibold text-sm ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>Penanda Tajwid Berwarna</h3>
                                <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {tajweedEnabled ? 'Aktif — warna tajwid ditampilkan' : 'Nonaktif'}
                                </p>
                                <p className="text-[10px] text-amber-500 mt-0.5">⚠️ Fitur dalam pengembangan</p>
                            </div>
                        </div>
                        <div
                            className={`toggle-switch ${tajweedEnabled ? 'active' : ''}`}
                            onClick={handleTajweedToggle}
                            role="switch"
                            aria-checked={tajweedEnabled}
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTajweedToggle(); }}
                        />
                    </div>
                </div>

                {/* App Info */}
                <div className={`rounded-2xl p-6 text-center ${isDarkTheme ? 'bg-slate-900/50 border border-white/5' : 'bg-white border border-slate-100'} shadow-card`}>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow-teal">
                        <span className="text-white text-lg font-bold">☪</span>
                    </div>
                    <p className={`text-base font-poppins font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>Al-Quran App</p>
                    <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>Versi 0.3.0</p>
                    <p className={`text-xs mt-2 ${isDarkTheme ? 'text-slate-600' : 'text-slate-400'}`}>
                        Dibuat dengan ❤️ menggunakan ReactJS
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
