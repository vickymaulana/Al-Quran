import React, { useState, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { RECITERS } from './apiService';
import { FiSettings, FiSun, FiMoon, FiType, FiVolume2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const SettingsPage = () => {
    const { isDarkTheme, toggleTheme } = useContext(ThemeContext);

    const [fontScale, setFontScale] = useState(() => {
        try {
            const saved = localStorage.getItem('fontScale');
            const v = saved ? parseFloat(saved) : 1;
            return Number.isFinite(v) ? Math.min(1.6, Math.max(0.8, v)) : 1;
        } catch { return 1; }
    });

    const [defaultReciter, setDefaultReciter] = useState(() => {
        try {
            return parseInt(localStorage.getItem('preferredReciter') || '7', 10);
        } catch { return 7; }
    });

    const [tajweedEnabled, setTajweedEnabled] = useState(() => {
        try {
            return localStorage.getItem('tajweedEnabled') === 'true';
        } catch { return false; }
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

    const sectionClass = `rounded-2xl p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg`;

    return (
        <div className={`min-h-screen py-8 ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-blue-50 text-gray-900'}`}>
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <FiSettings className="text-3xl text-blue-500" />
                    <h1 className="text-3xl font-bold">Pengaturan</h1>
                </div>

                <div className="space-y-6">
                    {/* Theme */}
                    <div className={sectionClass}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isDarkTheme ? <FiMoon className="text-xl text-blue-400" /> : <FiSun className="text-xl text-yellow-500" />}
                                <div>
                                    <h3 className="font-semibold">Tema Aplikasi</h3>
                                    <p className="text-sm text-gray-400">{isDarkTheme ? 'Mode Gelap' : 'Mode Terang'}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`px-4 py-2 rounded-lg transition ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                {isDarkTheme ? '☀️ Terang' : '🌙 Gelap'}
                            </button>
                        </div>
                    </div>

                    {/* Font Size */}
                    <div className={sectionClass}>
                        <div className="flex items-center gap-3 mb-4">
                            <FiType className="text-xl text-purple-500" />
                            <div>
                                <h3 className="font-semibold">Ukuran Teks</h3>
                                <p className="text-sm text-gray-400">Atur ukuran teks Arab dan terjemahan</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleFontScale(fontScale - 0.1)}
                                className={`px-3 py-1 rounded ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                                A-
                            </button>
                            <input
                                type="range"
                                min="0.8"
                                max="1.6"
                                step="0.1"
                                value={fontScale}
                                onChange={(e) => handleFontScale(parseFloat(e.target.value))}
                                className="flex-1 h-2 accent-purple-500"
                                aria-label="Font size"
                            />
                            <button
                                onClick={() => handleFontScale(fontScale + 0.1)}
                                className={`px-3 py-1 rounded ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                                A+
                            </button>
                            <span className="text-sm text-gray-400 w-12 text-right">{(fontScale * 100).toFixed(0)}%</span>
                        </div>
                        {/* Preview */}
                        <div className="mt-4 p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                            <p className="text-right font-amiri leading-loose" style={{ fontSize: `${fontScale * 1.5}em` }} dir="rtl" lang="ar">
                                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                            </p>
                            <p className="mt-2 text-left" style={{ fontSize: `${fontScale}em` }}>
                                Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.
                            </p>
                        </div>
                    </div>

                    {/* Default Qari */}
                    <div className={sectionClass}>
                        <div className="flex items-center gap-3 mb-4">
                            <FiVolume2 className="text-xl text-green-500" />
                            <div>
                                <h3 className="font-semibold">Qari Default</h3>
                                <p className="text-sm text-gray-400">Pilih pembaca Al-Quran favorit Anda</p>
                            </div>
                        </div>
                        <select
                            value={defaultReciter}
                            onChange={handleReciterChange}
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDarkTheme
                                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-green-500'
                                }`}
                        >
                            {RECITERS.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tajweed Toggle */}
                    <div className={sectionClass}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {tajweedEnabled
                                    ? <FiToggleRight className="text-xl text-green-500" />
                                    : <FiToggleLeft className="text-xl text-gray-400" />
                                }
                                <div>
                                    <h3 className="font-semibold">Penanda Tajwid Berwarna</h3>
                                    <p className="text-sm text-gray-400">
                                        {tajweedEnabled ? 'Aktif — warna tajwid ditampilkan' : 'Nonaktif'}
                                    </p>
                                    <p className="text-xs text-yellow-500 mt-1">⚠️ Fitur ini dalam pengembangan</p>
                                </div>
                            </div>
                            <button
                                onClick={handleTajweedToggle}
                                className={`px-4 py-2 rounded-lg transition ${tajweedEnabled
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : (isDarkTheme ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                                    }`}
                            >
                                {tajweedEnabled ? 'Aktif' : 'Nonaktif'}
                            </button>
                        </div>
                    </div>

                    {/* App Info */}
                    <div className={`${sectionClass} text-center`}>
                        <p className="text-lg font-bold">Al-Quran App</p>
                        <p className="text-sm text-gray-400">Versi 0.3.0</p>
                        <p className="text-xs text-gray-500 mt-2">
                            Dibuat dengan ❤️ menggunakan ReactJS
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
