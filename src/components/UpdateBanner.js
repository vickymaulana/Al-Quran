import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../ThemeContext';
import { FiX, FiRefreshCw } from 'react-icons/fi';

const UpdateBanner = () => {
    const { isDarkTheme } = useContext(ThemeContext);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handler = () => setShowBanner(true);
        window.addEventListener('sw-update-available', handler);
        return () => window.removeEventListener('sw-update-available', handler);
    }, []);

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className={`fixed top-0 left-0 right-0 z-[60] px-4 py-3 flex items-center justify-center gap-3 shadow-lg backdrop-blur-xl ${isDarkTheme
                            ? 'bg-primary-900/80 text-primary-100 border-b border-primary-700/30'
                            : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white'
                        }`}
                >
                    <FiRefreshCw className="animate-spin" size={14} />
                    <span className="text-sm font-medium">
                        Versi baru tersedia!
                    </span>
                    <button
                        onClick={() => window.location.reload()}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${isDarkTheme
                                ? 'bg-white/15 hover:bg-white/25 text-white'
                                : 'bg-white text-primary-600 hover:bg-primary-50'
                            }`}
                    >
                        Perbarui
                    </button>
                    <button
                        onClick={() => setShowBanner(false)}
                        className="text-white/60 hover:text-white transition-colors ml-1"
                        aria-label="Tutup"
                    >
                        <FiX size={16} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UpdateBanner;
