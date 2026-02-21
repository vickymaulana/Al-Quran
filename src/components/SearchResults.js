import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { searchVerses, fallbackSearchVerses, fetchTranslations } from './apiService';
import { ThemeContext } from '../ThemeContext';
import { FiSearch, FiArrowRight } from 'react-icons/fi';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const { isDarkTheme } = useContext(ThemeContext);
  const queryParams = useQuery();
  const navigate = useNavigate();
  const q = queryParams.get('query') || '';
  const [searchInput, setSearchInput] = useState(q);
  const searchInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const doSearch = async () => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      setError(null);

      try {
        const res = await searchVerses(q, 50);
        const matches = res?.data?.matches || res?.data?.search?.results || res?.data?.data || [];

        let normalized = [];
        if (Array.isArray(matches) && matches.length > 0) {
          normalized = matches.map((m) => ({
            chapter_id: m.chapter_id || m.chapter || (m.verse_key ? parseInt(m.verse_key.split(':')[0], 10) : null),
            chapter_name: m.chapter_name || m.chapter_name_simple || m.chapter || null,
            verse_number: m.verse_number || m.verse || (m.verse_key ? parseInt(m.verse_key.split(':')[1], 10) : null),
            text_uthmani: m.text_uthmani || m.aya || m.text || m.verse_text || '',
            verse_key: m.verse_key || (m.chapter_id ? `${m.chapter_id}:${m.verse_number}` : m.verse_key),
          }));
        }

        if (normalized.length === 0) {
          const fallback = await fallbackSearchVerses(q);
          const fb = fallback?.data?.matches || [];
          normalized = fb.map((m) => ({
            chapter_id: m.chapter_id, chapter_name: m.chapter_name,
            verse_number: m.verse_number, text_uthmani: m.text_uthmani, verse_key: m.verse_key,
          }));
        }

        const chapterIds = Array.from(new Set(normalized.map((n) => n.chapter_id).filter(Boolean)));
        const translationsMap = {};
        try {
          await Promise.all(
            chapterIds.map(async (cid) => {
              try {
                const tr = await fetchTranslations(cid);
                translationsMap[cid] = tr?.data?.result || tr?.data || [];
              } catch (e) { translationsMap[cid] = []; }
            })
          );
        } catch (e) { }

        const getTranslationText = (arr, verseNumber) => {
          if (!arr || arr.length === 0) return null;
          const idx = Number(verseNumber) - 1;
          if (arr[idx]) return arr[idx].translation || arr[idx].text || arr[idx].translation_text || arr[idx].result || null;
          const found = arr.find((t) => String(t.verse_number) === String(verseNumber) || String(t.verse) === String(verseNumber));
          if (found) return found.translation || found.text || found.translation_text || null;
          return null;
        };

        const enriched = normalized.map((item) => ({
          ...item,
          translation: getTranslationText(translationsMap[item.chapter_id], item.verse_number),
        }));

        setResults(enriched);
      } catch (err) {
        try {
          const fallback = await fallbackSearchVerses(q);
          const fb = fallback?.data?.matches || [];
          const normalized = fb.map((m) => ({
            chapter_id: m.chapter_id, chapter_name: m.chapter_name,
            verse_number: m.verse_number, text_uthmani: m.text_uthmani, verse_key: m.verse_key,
          }));
          const chapterIdsFb = Array.from(new Set(normalized.map((n) => n.chapter_id).filter(Boolean)));
          const translationsMapFb = {};
          try {
            await Promise.all(chapterIdsFb.map(async (cid) => {
              try { const tr = await fetchTranslations(cid); translationsMapFb[cid] = tr?.data?.result || tr?.data || []; } catch (e) { translationsMapFb[cid] = []; }
            }));
          } catch (e) { }
          const getTranslationTextFb = (arr, verseNumber) => {
            if (!arr || arr.length === 0) return null;
            const idx = Number(verseNumber) - 1;
            if (arr[idx]) return arr[idx].translation || arr[idx].text || arr[idx].translation_text || arr[idx].result || null;
            const found = arr.find((t) => String(t.verse_number) === String(verseNumber) || String(t.verse) === String(verseNumber));
            if (found) return found.translation || found.text || found.translation_text || null;
            return null;
          };
          const enrichedFb = normalized.map((item) => ({ ...item, translation: getTranslationTextFb(translationsMapFb[item.chapter_id], item.verse_number) }));
          setResults(enrichedFb);
        } catch (err2) {
          setError('Terjadi kesalahan saat mencari. Coba lagi nanti.');
        }
      } finally {
        setLoading(false);
      }
    };
    doSearch();
  }, [q]);

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-slate-950 text-white' : 'bg-surface-light text-slate-800'}`}>
      {/* Header */}
      <div className={`${isDarkTheme ? 'bg-hero-dark' : 'bg-hero-light'} islamic-pattern-bg`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-14 text-center">
          <FiSearch className="text-3xl text-white/80 mx-auto mb-3" />
          <h1 className="text-2xl md:text-3xl font-poppins font-bold text-white">
            {q ? `Hasil untuk "${q}"` : 'Pencarian'}
          </h1>
          {!loading && results.length > 0 && (
            <p className="text-white/60 text-sm mt-1">{results.length} hasil ditemukan</p>
          )}
          {/* Inline search form */}
          <form
            className="max-w-md mx-auto mt-5 relative"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInput.trim()) {
                navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
              }
            }}
          >
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari ayat atau kata..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoFocus={!q}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/15 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm"
            />
          </form>
        </div>
        <svg viewBox="0 0 1440 40" fill="none" className="w-full h-6 md:h-10">
          <path d="M0 40V20C360 0 720 0 1080 20C1260 30 1380 40 1440 40H0Z" fill={isDarkTheme ? '#020617' : '#f8fafc'} />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-2 pb-16">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className={`text-center py-8 rounded-2xl ${isDarkTheme ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
            {error}
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="text-center py-16">
            <FiSearch className={`mx-auto text-4xl mb-4 ${isDarkTheme ? 'text-slate-700' : 'text-slate-300'}`} />
            <p className={isDarkTheme ? 'text-slate-500' : 'text-slate-400'}>
              {q ? 'Tidak ada hasil ditemukan.' : 'Masukkan kata kunci untuk mencari.'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((r, idx) => (
            <motion.div
              key={`${r.verse_key || idx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.3) }}
              className={`rounded-2xl overflow-hidden border ${isDarkTheme ? 'border-white/5 bg-slate-900/40' : 'border-slate-100 bg-white'} shadow-card`}
            >
              <div className="h-0.5 bg-teal-gradient" />
              <div className="p-5 md:p-6">
                {/* Arabic */}
                <div dir="rtl" lang="ar">
                  <p className={`text-lg sm:text-xl font-bold text-right mb-3 font-amiri leading-[2.2] ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                    {r.text_uthmani}
                  </p>
                </div>
                {/* Translation */}
                {r.translation && (
                  <p className={`text-sm leading-relaxed mb-3 ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`} style={{ direction: 'ltr' }}>
                    {r.translation}
                  </p>
                )}
                {/* Info + Link */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isDarkTheme ? 'text-primary-400' : 'text-primary-600'}`}>
                    {r.chapter_name || `Surat ${r.chapter_id}`} — Ayat {r.verse_number}
                  </span>
                  <Link
                    to={`/ayat/${r.chapter_id}#verse-${r.verse_number}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-400 transition-colors"
                  >
                    Buka <FiArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
