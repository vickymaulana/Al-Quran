import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetchData } from './useFetchData';
import { fetchSurahName } from './apiService';
import { ThemeContext } from '../ThemeContext';
import { FiBookmark, FiBook, FiLink, FiShare2, FiPlay, FiChevronRight } from 'react-icons/fi';
import { getJSON, setJSON, subscribeToStorageKey } from '../utils/storage';
import { copyText, sharePayload } from '../utils/clipboard';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import AudioPlayer from './AudioPlayer';
import TafsirModal from './TafsirModal';
import { logTilawah } from './TilawahTracker';
import { getSurahNameKemenag } from '../utils/surahNamesKemenag';
import SEO from './SEO';

function Ayat() {
  const { isDarkTheme } = useContext(ThemeContext);
  const versesPerPage = 50;
  const { chapter_number } = useParams();
  const { data, translations, latinData, surahName, loading } = useFetchData('verses', chapter_number);
  const nextChapter = parseInt(chapter_number, 10) + 1;
  const [nextSurahName, setNextSurahName] = useState('');
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [currentPage, setCurrentPage] = useState(1);
  const [copiedVerse, setCopiedVerse] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => getJSON('bookmarkedVerses', []));
  const [playingVerse, setPlayingVerse] = useState(null);
  const [tafsirVerse, setTafsirVerse] = useState(null);
  const timeoutsRef = useRef([]);
  const handledHashRef = useRef(null);
  const versesReadRef = useRef(0);
  const [fontScale, setFontScale] = useState(() => {
    try {
      const saved = localStorage.getItem('fontScale');
      const v = saved ? parseFloat(saved) : 1;
      return Number.isFinite(v) ? Math.min(1.6, Math.max(0.8, v)) : 1;
    } catch (e) { return 1; }
  });
  const [showLatin, setShowLatin] = useState(() => {
    try { return localStorage.getItem('showLatin') !== 'false'; } catch (e) { return true; }
  });

  const navigateToNextChapter = () => {
    navigate(`/ayat/${nextChapter}`);
    setCurrentPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadNext = async () => {
      try {
        const res = await fetchSurahName(nextChapter, { signal: controller.signal });
        const apiName = res?.data?.chapter?.name_simple || '';
        setNextSurahName(getSurahNameKemenag(nextChapter, apiName));
      } catch (e) { }
    };
    loadNext();
    return () => controller.abort();
  }, [nextChapter]);

  useEffect(() => { window.scrollTo(0, 0); }, [currentPage]);

  useEffect(() => {
    try { localStorage.setItem('fontScale', String(fontScale)); } catch (e) { }
  }, [fontScale]);

  useEffect(() => {
    try { localStorage.setItem('showLatin', String(showLatin)); } catch (e) { }
  }, [showLatin]);

  useEffect(() => {
    const unsub = subscribeToStorageKey('bookmarkedVerses', (newValue) => {
      try { setBookmarks(newValue ? JSON.parse(newValue) : []); } catch (e) { }
    });
    return unsub;
  }, []);

  const location = useLocation();
  const [highlighted, setHighlighted] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const hash = location.hash || window.location.hash;
    if (!hash) return;
    if (handledHashRef.current === hash) return;
    const match = hash.match(/#?verse-(\d+)/i);
    if (!match) return;
    const verseNumber = parseInt(match[1], 10);
    if (!verseNumber || verseNumber <= 0) return;
    const targetPage = Math.ceil(verseNumber / versesPerPage);

    const scrollToVerse = (vNum) => {
      let attempts = 0;
      const maxAttempts = 15;
      const tryFind = () => {
        if (!location.pathname || !location.pathname.includes(`/ayat/${chapter_number}`)) return;
        const el = document.getElementById(`verse-${vNum}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlighted(vNum);
          const t = setTimeout(() => setHighlighted(null), 4000);
          timeoutsRef.current.push(t);
        } else if (attempts < maxAttempts) {
          attempts += 1;
          setTimeout(tryFind, 100);
        }
      };
      tryFind();
    };

    handledHashRef.current = hash;
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
      scrollToVerse(verseNumber);
    } else {
      scrollToVerse(verseNumber);
    }
  }, [location.pathname, location.hash, data, currentPage, chapter_number]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    versesReadRef.current = 0;
    return () => {
      if (versesReadRef.current > 0 && surahName) {
        logTilawah(Number(chapter_number), surahName, versesReadRef.current);
      }
    };
  }, [chapter_number, surahName]);

  const indexOfLastVerse = currentPage * versesPerPage;
  const indexOfFirstVerse = indexOfLastVerse - versesPerPage;
  const currentVerses = data?.slice(indexOfFirstVerse, indexOfLastVerse) || [];

  useEffect(() => {
    if (!surahName || !chapter_number) return;
    setJSON('lastRead', {
      chapterNumber: Number(chapter_number),
      verseNumber: indexOfFirstVerse + 1,
      surahName,
      updatedAt: Date.now(),
    });
  }, [chapter_number, currentPage, surahName, indexOfFirstVerse]);

  const toggleBookmark = (verseNumber, verseText, translation) => {
    const key = `${chapter_number}:${verseNumber}`;
    setBookmarks((prev) => {
      const existing = prev.find((b) => b.key === key);
      const updated = existing
        ? prev.filter((b) => b.key !== key)
        : [...prev, { key, surahName, verseNumber, text: verseText, translation }];
      setJSON('bookmarkedVerses', updated);
      return updated;
    });
  };

  const handleVerseChange = useCallback((verseNum) => {
    setPlayingVerse(verseNum);
    const el = document.getElementById(`verse-${verseNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const targetPage = Math.ceil(verseNum / versesPerPage);
    if (targetPage !== currentPage) setCurrentPage(targetPage);
  }, [currentPage]);

  const verseContainerVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

  const totalPages = Math.ceil((data?.length || 0) / versesPerPage) || 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-slate-950 text-white' : 'bg-surface-light text-slate-800'}`}>
      {surahName && (
        <SEO
          title={`Surat ${surahName}`}
          description={`Baca Surat ${surahName}${data ? ` (${data.length} Ayat)` : ''} lengkap dengan teks Arab, terjemahan Bahasa Indonesia, transliterasi latin, tafsir, dan audio murottal.`}
          path={`/ayat/${chapter_number}`}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            name: `Surat ${surahName}`,
            headline: `Surat ${surahName} — Al-Quran`,
            description: `Baca Surat ${surahName} lengkap dengan terjemahan dan tafsir.`,
          }}
        />
      )}

      {/* Surah Header */}
      <div className={`${isDarkTheme ? 'bg-hero-dark' : 'bg-hero-light'} islamic-pattern-bg`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-14 text-center">
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-1">
            {surahName || 'Memuat...'}
          </h1>
          {data && (
            <p className="text-white/60 text-sm">{data.length} Ayat</p>
          )}
        </div>
        <svg viewBox="0 0 1440 40" fill="none" className="w-full h-6 md:h-10">
          <path d="M0 40V20C360 0 720 0 1080 20C1260 30 1380 40 1440 40H0Z" fill={isDarkTheme ? '#020617' : '#f8fafc'} />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-2 pb-24">
        {/* Bismillah */}
        {currentPage === 1 && chapter_number !== '1' && chapter_number !== '9' && (
          <div className={`text-center mb-8 py-6 rounded-2xl ${isDarkTheme ? 'bg-slate-900/50' : 'bg-white'} shadow-card`}>
            <p className={`text-3xl md:text-4xl font-amiri ${isDarkTheme ? 'text-white' : 'text-slate-800'}`} dir="rtl" lang="ar" aria-label="Bismillahirrahmanirrahim">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Verses */}
            <div className="space-y-4" style={{ fontSize: `${fontScale}em` }}>
              {currentVerses.map((verse, index) => {
                const translationIndex = index + indexOfFirstVerse;
                const globalVerseNumber = index + indexOfFirstVerse + 1;
                const isBookmarked = bookmarks.find((b) => b.key === `${chapter_number}:${globalVerseNumber}`);
                const isPlayingThis = playingVerse === globalVerseNumber;

                return (
                  <motion.div
                    id={`verse-${globalVerseNumber}`}
                    key={verse.id}
                    className={`group rounded-2xl p-5 md:p-6 transition-all border ${highlighted === globalVerseNumber
                      ? `ring-2 ${isDarkTheme ? 'ring-amber-500/50 bg-amber-500/5' : 'ring-amber-400/50 bg-amber-50'}`
                      : isPlayingThis
                        ? `${isDarkTheme ? 'ring-1 ring-primary-500/30 bg-primary-500/5 border-primary-500/20' : 'ring-1 ring-primary-300 bg-primary-50 border-primary-200'}`
                        : `${isDarkTheme ? 'bg-slate-900/40 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:border-slate-200'}`
                      } shadow-card`}
                    initial="hidden"
                    animate="visible"
                    variants={verseContainerVariants}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.5) }}
                    onMouseEnter={() => {
                      versesReadRef.current += 1;
                      setJSON('lastRead', {
                        chapterNumber: Number(chapter_number),
                        verseNumber: globalVerseNumber,
                        surahName,
                        updatedAt: Date.now(),
                      });
                    }}
                  >
                    {/* Verse Header */}
                    <div className="flex items-center justify-between mb-4" style={{ direction: 'ltr' }}>
                      {/* Number badge */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${isDarkTheme
                        ? 'bg-primary-900/40 text-primary-400 border border-primary-500/20'
                        : 'bg-primary-50 text-primary-700'
                        }`}>
                        {globalVerseNumber}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.__audioPlayerPlayVerse?.(globalVerseNumber)}
                          className={`p-2 rounded-lg transition-colors ${isDarkTheme ? 'hover:bg-slate-700 text-emerald-400' : 'hover:bg-emerald-50 text-emerald-600'
                            }`}
                          aria-label={`Play verse ${globalVerseNumber}`}
                        >
                          <FiPlay size={14} />
                        </button>
                        <button
                          onClick={() => setTafsirVerse({
                            key: `${chapter_number}:${globalVerseNumber}`,
                            text: verse.text_uthmani,
                          })}
                          className={`p-2 rounded-lg transition-colors ${isDarkTheme ? 'hover:bg-slate-700 text-violet-400' : 'hover:bg-violet-50 text-violet-600'
                            }`}
                          aria-label={`Tafsir verse ${globalVerseNumber}`}
                        >
                          <FiBook size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            const url = `${window.location.origin}${window.location.pathname}#verse-${globalVerseNumber}`;
                            await copyText(url);
                            window.history.replaceState(null, '', `#verse-${globalVerseNumber}`);
                            setCopiedVerse(globalVerseNumber);
                            const t = setTimeout(() => setCopiedVerse(null), 2000);
                            timeoutsRef.current.push(t);
                            setJSON('lastRead', {
                              chapterNumber: Number(chapter_number),
                              verseNumber: globalVerseNumber,
                              surahName,
                              updatedAt: Date.now(),
                            });
                          }}
                          className={`p-2 rounded-lg transition-colors ${copiedVerse === globalVerseNumber
                            ? 'text-emerald-500'
                            : isDarkTheme ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                          aria-label={`Copy link to verse ${globalVerseNumber}`}
                        >
                          <FiLink size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            const shareUrl = `${window.location.origin}${window.location.pathname}#verse-${globalVerseNumber}`;
                            const shareText = `${surahName} • Ayat ${globalVerseNumber}\n\n${verse.text_uthmani}\n\n${translations?.[translationIndex]?.translation || ''}`.trim();
                            await sharePayload({ title: `${surahName} ${globalVerseNumber}`, text: shareText, url: shareUrl });
                            setJSON('lastRead', {
                              chapterNumber: Number(chapter_number),
                              verseNumber: globalVerseNumber,
                              surahName,
                              updatedAt: Date.now(),
                            });
                          }}
                          className={`p-2 rounded-lg transition-colors ${isDarkTheme ? 'hover:bg-slate-700 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
                            }`}
                          aria-label={`Share verse ${globalVerseNumber}`}
                        >
                          <FiShare2 size={14} />
                        </button>
                        <button
                          onClick={() => toggleBookmark(globalVerseNumber, verse.text_uthmani, translations?.[translationIndex]?.translation)}
                          className={`p-2 rounded-lg transition-all ${isBookmarked
                            ? 'text-amber-500 bg-amber-500/10'
                            : isDarkTheme ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        >
                          <FiBookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Arabic text */}
                    <div dir="rtl" lang="ar" aria-label={`Ayat ${globalVerseNumber}`}>
                      <p className={`text-lg sm:text-2xl font-bold text-right mb-4 font-amiri leading-[2.4] ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                        {verse.text_uthmani}
                      </p>
                    </div>

                    {/* Latin transliteration */}
                    {showLatin && latinData && latinData[index + indexOfFirstVerse] && (
                      <p
                        className={`text-left text-sm italic mb-3 leading-relaxed ${isDarkTheme ? 'text-primary-400' : 'text-primary-700'}`}
                        dir="ltr"
                        lang="id"
                      >
                        {latinData[index + indexOfFirstVerse].teksLatin}
                      </p>
                    )}

                    {/* Translation */}
                    <p
                      className={`text-left text-sm sm:text-base leading-relaxed ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}
                      dir="ltr"
                      lang="id"
                    >
                      {translations?.[translationIndex]?.translation}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap justify-center mt-10 gap-2 mb-24">
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${pageNumber === currentPage
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-teal'
                    : `${isDarkTheme
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`
                    }`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              {currentPage === totalPages && nextChapter <= 114 && (
                <button
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md hover:shadow-lg transition-shadow flex items-center gap-1.5"
                  onClick={navigateToNextChapter}
                >
                  {nextSurahName || 'Surat Berikutnya'} <FiChevronRight size={16} />
                </button>
              )}
            </div>

            {/* Font size & Latin toggle */}
            <div className="fixed bottom-20 right-4 flex flex-col gap-1.5 z-30">
              {[
                { label: 'A-', fn: () => setFontScale((s) => Math.max(0.8, Number((s - 0.1).toFixed(2)))) },
                { label: 'R', fn: () => setFontScale(1) },
                { label: 'A+', fn: () => setFontScale((s) => Math.min(1.6, Number((s + 0.1).toFixed(2)))) },
                { label: showLatin ? 'Aa' : 'Aa', fn: () => setShowLatin((s) => !s), isLatin: true },
              ].map((btn) => (
                <button
                  key={btn.label + (btn.isLatin ? '-latin' : '')}
                  onClick={btn.fn}
                  className={`w-10 h-10 rounded-xl text-xs font-bold shadow-lg transition-all ${btn.isLatin
                    ? (showLatin
                      ? 'bg-primary-500 text-white border border-primary-400'
                      : `${isDarkTheme ? 'bg-slate-800 text-slate-500 hover:bg-slate-700 border border-white/5' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-200'}`)
                    : `${isDarkTheme
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`
                    }`}
                  title={btn.isLatin ? (showLatin ? 'Sembunyikan Latin' : 'Tampilkan Latin') : ''}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Audio Player */}
      {data && data.length > 0 && (
        <AudioPlayer
          chapterId={chapter_number}
          totalVerses={data.length}
          onVerseChange={handleVerseChange}
        />
      )}

      {/* Tafsir Modal */}
      {tafsirVerse && (
        <TafsirModal
          verseKey={tafsirVerse.key}
          verseText={tafsirVerse.text}
          onClose={() => setTafsirVerse(null)}
        />
      )}
    </div>
  );
}

export default Ayat;
