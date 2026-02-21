import React, { useState, useEffect, useContext } from 'react';
import { fetchTafsir } from './apiService';
import { ThemeContext } from '../ThemeContext';
import { FiX, FiBook } from 'react-icons/fi';

const TafsirModal = ({ verseKey, verseText, onClose }) => {
    const { isDarkTheme } = useContext(ThemeContext);
    const [tafsirData, setTafsirData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!verseKey) return;
        const controller = new AbortController();

        const loadTafsir = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchTafsir(verseKey, 169, { signal: controller.signal });
                setTafsirData(data?.tafsir || data);
            } catch (err) {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    setError('Gagal memuat tafsir. Coba lagi nanti.');
                    console.error('Tafsir fetch error:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        loadTafsir();
        return () => controller.abort();
    }, [verseKey]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const tafsirText = tafsirData?.text || tafsirData?.tafsir?.text || tafsirData?.resource_name || '';
    // Clean HTML tags from tafsir text
    const cleanText = tafsirText.replace(/<[^>]*>/g, '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className={`relative w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkTheme ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-blue-50'
                    }`}>
                    <div className="flex items-center gap-3">
                        <FiBook className="text-blue-500 text-xl" />
                        <h2 className="text-lg font-bold">Tafsir — {verseKey}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        aria-label="Tutup tafsir"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {/* Original Arabic verse */}
                    {verseText && (
                        <div className="text-right" dir="rtl" lang="ar">
                            <p className="text-2xl leading-loose font-amiri">{verseText}</p>
                        </div>
                    )}

                    <hr className={isDarkTheme ? 'border-gray-700' : 'border-gray-200'} />

                    {/* Tafsir content */}
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                            <span className="ml-3 text-gray-400">Memuat tafsir...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {!loading && !error && cleanText && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wide">
                                Tafsir Jalalayn
                            </h3>
                            <p className="text-base leading-relaxed whitespace-pre-line" dir="rtl" lang="ar">
                                {cleanText}
                            </p>
                        </div>
                    )}

                    {!loading && !error && !cleanText && (
                        <p className="text-center text-gray-400 py-8">
                            Tafsir tidak tersedia untuk ayat ini.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TafsirModal;
