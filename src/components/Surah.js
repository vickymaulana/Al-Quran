import React, { useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetchData } from './useFetchData';
import { ThemeContext } from '../ThemeContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { FiSearch } from 'react-icons/fi';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: Math.min(i * 0.03, 0.6), ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function Surah() {
  const { isDarkTheme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const { data } = useFetchData('chapters');
  const debouncedQuery = useDebouncedValue(searchQuery, 200);

  const handleSearch = (event) => setSearchQuery(event.target.value);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const query = debouncedQuery.trim().toLowerCase();
    if (!query) return data;
    return data.filter((surah) => {
      const surahName = surah.name_simple.toLowerCase();
      const translatedName = surah.translated_name.name.toLowerCase();
      const surahId = surah.id.toString();
      return surahName.includes(query) || translatedName.includes(query) || surahId.includes(query);
    });
  }, [data, debouncedQuery]);

  const typeLabels = { Meccan: 'Makkiyah', Medinan: 'Madaniyah' };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-slate-950 text-white' : 'bg-surface-light text-slate-800'}`}>
      {/* Header */}
      <div className={`${isDarkTheme ? 'bg-hero-dark' : 'bg-hero-light'} islamic-pattern-bg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16 text-center">
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-6">
            Daftar Surah
          </h1>
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
            <input
              type="text"
              placeholder="Cari surah..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/15 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm"
            />
          </div>
        </div>
        <div className="relative">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full h-6 md:h-10">
            <path d="M0 40V20C360 0 720 0 1080 20C1260 30 1380 40 1440 40H0Z" fill={isDarkTheme ? '#020617' : '#f8fafc'} />
          </svg>
        </div>
      </div>

      {/* Surah Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-2 pb-16">
        {data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredData.map((surah, i) => (
              <motion.div
                key={surah.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-20px' }}
                variants={fadeUp}
                custom={i}
              >
                <Link
                  to={`/ayat/${surah.id}`}
                  className={`group block rounded-2xl p-5 transition-all duration-300 border ${isDarkTheme
                      ? 'bg-slate-900/50 border-white/5 hover:border-primary-500/30 hover:bg-slate-800/60'
                      : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-card-hover'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Number Badge */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-poppins font-bold text-sm shrink-0 ${isDarkTheme
                        ? 'bg-gradient-to-br from-primary-900/60 to-primary-800/40 text-primary-400 border border-primary-500/20'
                        : 'bg-gradient-to-br from-primary-50 to-primary-100 text-primary-700'
                      }`}>
                      {surah.id}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className={`text-base font-semibold truncate ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                          {surah.name_simple}
                        </h2>
                        <span className={`text-xl font-amiri ${isDarkTheme ? 'text-primary-400' : 'text-primary-600'}`} dir="rtl" lang="ar">
                          {surah.name_arabic}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                          {surah.translated_name.name}
                        </span>
                        <span className={`text-xs ${isDarkTheme ? 'text-slate-600' : 'text-slate-300'}`}>•</span>
                        <span className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                          {surah.verses_count} Ayat
                        </span>
                        <span className={`text-xs ${isDarkTheme ? 'text-slate-600' : 'text-slate-300'}`}>•</span>
                        <span className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                          {typeLabels[surah.revelation_place] || surah.revelation_place}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}

export default Surah;
