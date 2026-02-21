import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
                }
            } finally { setLoading(false); }
        };
        loadTafsir();
        return () => controller.abort();
    }, [verseKey]);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const tafsirText = tafsirData?.text || tafsirData?.tafsir?.text || tafsirData?.resource_name || '';
    const cleanText = tafsirText.replace(/<[^>]*>/g, '');

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={`relative w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col ${isDarkTheme ? 'bg-slate-900 text-white border border-white/5' : 'bg-white text-slate-900'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Accent bar */}
                    <div className="h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-gold-500" />

                    {/* Header */}
                    <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkTheme ? 'border-white/5' : 'border-slate-100'
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDarkTheme ? 'bg-primary-500/10' : 'bg-primary-50'}`}>
                                <FiBook className="text-primary-500" size={18} />
                            </div>
                            <div>
                                <h2 className={`text-base font-poppins font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                                    Tafsir
                                </h2>
                                <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Ayat {verseKey}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl transition-colors ${isDarkTheme ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                                }`}
                            aria-label="Tutup tafsir"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                        {verseText && (
                            <div className={`text-right p-4 rounded-xl ${isDarkTheme ? 'bg-slate-800/50' : 'bg-slate-50'}`} dir="rtl" lang="ar">
                                <p className={`text-xl md:text-2xl leading-[2.2] font-amiri ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>{verseText}</p>
                            </div>
                        )}

                        <div className={`border-t ${isDarkTheme ? 'border-white/5' : 'border-slate-100'}`} />

                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                                <span className="ml-3 text-sm text-slate-400">Memuat tafsir...</span>
                            </div>
                        )}

                        {error && (
                            <div className={`text-center py-8 rounded-xl ${isDarkTheme ? 'bg-red-500/10' : 'bg-red-50'}`}>
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {!loading && !error && cleanText && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold text-primary-500 uppercase tracking-wider">
                                    Tafsir Jalalayn
                                </h3>
                                <p className={`text-sm leading-relaxed whitespace-pre-line ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`} dir="rtl" lang="ar">
                                    {cleanText}
                                </p>
                            </div>
                        )}

                        {!loading && !error && !cleanText && (
                            <p className="text-center text-sm text-slate-400 py-8">
                                Tafsir tidak tersedia untuk ayat ini.
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TafsirModal;
