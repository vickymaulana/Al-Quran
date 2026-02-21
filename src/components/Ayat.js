import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetchData } from './useFetchData';
import { fetchSurahName } from './apiService';
import { ThemeContext } from '../ThemeContext';
import { FiBookmark, FiBook } from 'react-icons/fi';
import { getJSON, setJSON, subscribeToStorageKey } from '../utils/storage';
import { copyText, sharePayload } from '../utils/clipboard';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import AudioPlayer from './AudioPlayer';
import TafsirModal from './TafsirModal';
import { logTilawah } from './TilawahTracker';

function Ayat() {
  const { isDarkTheme } = useContext(ThemeContext);
  const versesPerPage = 50;
  const { chapter_number } = useParams();
  const { data, translations, surahName, loading } = useFetchData('verses', chapter_number);
  const nextChapter = parseInt(chapter_number, 10) + 1;
  const [nextSurahName, setNextSurahName] = useState('');
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [currentPage, setCurrentPage] = useState(1);
  const [copiedVerse, setCopiedVerse] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => getJSON('bookmarkedVerses', []));
  const [playingVerse, setPlayingVerse] = useState(null);
  const [tafsirVerse, setTafsirVerse] = useState(null); // { key: "1:1", text: "..." }
  const timeoutsRef = useRef([]);
  const handledHashRef = useRef(null);
  const versesReadRef = useRef(0);
  const [fontScale, setFontScale] = useState(() => {
    try {
      const saved = localStorage.getItem('fontScale');
      const v = saved ? parseFloat(saved) : 1;
      return Number.isFinite(v) ? Math.min(1.6, Math.max(0.8, v)) : 1;
    } catch (e) {
      return 1;
    }
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
        setNextSurahName(res?.data?.chapter?.name_simple || '');
      } catch (e) {
        // ignore errors for next surah name
      }
    };
    loadNext();
    return () => controller.abort();
  }, [nextChapter]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    try {
      localStorage.setItem('fontScale', String(fontScale));
    } catch (e) { }
  }, [fontScale]);

  // Cross-tab sync for bookmarks
  useEffect(() => {
    const unsub = subscribeToStorageKey('bookmarkedVerses', (newValue) => {
      try {
        setBookmarks(newValue ? JSON.parse(newValue) : []);
      } catch (e) { }
    });
    return unsub;
  }, []);

  // If navigated with a hash (e.g. #verse-10), scroll to that verse and set page.
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

  // cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  // Log tilawah on unmount or chapter change
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

  // Persist last read on page/surah changes
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
        : [
          ...prev,
          { key, surahName, verseNumber, text: verseText, translation },
        ];
      setJSON('bookmarkedVerses', updated);
      return updated;
    });
  };

  const handleVerseChange = useCallback((verseNum) => {
    setPlayingVerse(verseNum);
    // Auto-scroll to the playing verse
    const el = document.getElementById(`verse-${verseNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Check if we need to change page
    const targetPage = Math.ceil(verseNum / versesPerPage);
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [currentPage]);

  const verseContainerVariants = prefersReducedMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  const renderVerses = () => {
    if (currentVerses.length > 0) {
      return (
        <div className="space-y-6" style={{ fontSize: `${fontScale}em` }}>
          {currentVerses.map((verse, index) => {
            const translationIndex = index + indexOfFirstVerse;
            const globalVerseNumber = index + indexOfFirstVerse + 1;
            const isBookmarked = bookmarks.find((b) => b.key === `${chapter_number}:${globalVerseNumber}`);
            const isPlayingThis = playingVerse === globalVerseNumber;
            return (
              <motion.div
                id={`verse-${globalVerseNumber}`}
                key={verse.id}
                className={`${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  } p-6 rounded-xl shadow-md transition-all ${highlighted === globalVerseNumber ? 'ring-4 ring-yellow-300' : ''
                  } ${isPlayingThis ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/30' : ''}`}
                initial="hidden"
                animate="visible"
                variants={verseContainerVariants}
                transition={{ duration: 0.5, delay: Math.min(index * 0.03, 0.5) }}
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
                {/* Verse number badge */}
                <div className="flex items-center justify-between mb-3" style={{ direction: 'ltr' }}>
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${isDarkTheme ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-600'
                    }`}>
                    {globalVerseNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (window.__audioPlayerPlayVerse) {
                          window.__audioPlayerPlayVerse(globalVerseNumber);
                        }
                      }}
                      className="text-sm px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition"
                      aria-label={`Play verse ${globalVerseNumber}`}
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => setTafsirVerse({
                        key: `${chapter_number}:${globalVerseNumber}`,
                        text: verse.text_uthmani,
                      })}
                      className={`text-sm px-2 py-1 rounded transition ${isDarkTheme ? 'bg-purple-700 text-white hover:bg-purple-600' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      aria-label={`Tafsir verse ${globalVerseNumber}`}
                    >
                      <FiBook size={14} className="inline mr-1" />
                      Tafsir
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
                      className="text-sm px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 transition"
                      aria-label={`Copy link to verse ${globalVerseNumber}`}
                    >
                      🔗
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
                      className="text-sm px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                      aria-label={`Share verse ${globalVerseNumber}`}
                    >
                      Share
                    </button>
                    {copiedVerse === globalVerseNumber && (
                      <span className="text-sm text-green-500">✓</span>
                    )}
                  </div>
                </div>

                {/* Arabic text */}
                <div dir="rtl" lang="ar" aria-label={`Ayat ${globalVerseNumber}`}>
                  <h2 className="text-lg sm:text-2xl font-bold text-right mb-4 font-amiri leading-loose">
                    {verse.text_uthmani}
                  </h2>
                </div>

                {/* Translation */}
                <p
                  className={`text-left mt-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} text-sm sm:text-base`}
                  dir="ltr"
                  lang="id"
                >
                  {translations?.[translationIndex]?.translation}
                </p>

                {/* Bookmark */}
                <button
                  onClick={() =>
                    toggleBookmark(
                      globalVerseNumber,
                      verse.text_uthmani,
                      translations?.[translationIndex]?.translation
                    )
                  }
                  className={`mt-4 p-2 rounded-full border transition-colors ${isBookmarked
                      ? 'bg-yellow-400 text-white border-yellow-400'
                      : 'bg-gray-200 text-gray-700 hover:bg-yellow-200 border-gray-300'
                    }`}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                  <FiBookmark />
                </button>
              </motion.div>
            );
          })}
        </div>
      );
    } else {
      return <p className="text-center text-gray-500 mt-6">Memuat data...</p>;
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil((data?.length || 0) / versesPerPage) || 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const renderBismillah = () => {
    if (currentPage === 1 && chapter_number !== '1' && chapter_number !== '9') {
      return (
        <div
          className={`text-center text-3xl font-bold mb-6 font-amiri ${isDarkTheme ? 'text-white' : 'text-gray-800'
            }`}
          dir="rtl"
          lang="ar"
          aria-label="Bismillahirrahmanirrahim"
        >
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
      );
    }
  };

  const renderPagination = () => {
    const isLastPage = currentPage === totalPages;

    return (
      <div className="flex flex-wrap justify-center mt-8 space-x-2 mb-24">
        {pageNumbers.map((pageNumber) => (
          <motion.button
            key={pageNumber}
            className={`px-4 py-2 rounded-lg text-sm mb-2 transition duration-300 ${pageNumber === currentPage
                ? 'bg-blue-600 text-white'
                : `${isDarkTheme
                  ? 'bg-gray-700 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-800 hover:bg-blue-500 hover:text-white'
                }`
              }`}
            onClick={() => paginate(pageNumber)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {pageNumber}
          </motion.button>
        ))}
        {isLastPage && (
          <button
            className="px-4 py-2 rounded-lg text-sm mb-2 bg-green-600 text-white hover:bg-green-500 transition duration-300"
            onClick={navigateToNextChapter}
          >
            Surat Berikutnya: {nextSurahName || 'Surat Berikutnya'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen py-8 ${isDarkTheme
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800'
        }`}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6 text-center">{surahName || 'Memuat...'}</h1>
        {renderBismillah()}
        {loading ? (
          <p className="text-center text-gray-500 mt-6">Memuat data...</p>
        ) : (
          <>
            {renderVerses()}
            {renderPagination()}
            {/* Font size controls */}
            <div className="fixed bottom-20 right-6 flex flex-col gap-2 z-30">
              <button
                onClick={() => setFontScale((s) => Math.max(0.8, Number((s - 0.1).toFixed(2))))}
                className={`${isDarkTheme ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-100'} shadow-md rounded-full px-3 py-2`}
                title="Kecilkan ukuran teks"
              >
                A-
              </button>
              <button
                onClick={() => setFontScale(1)}
                className={`${isDarkTheme ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-100'} shadow-md rounded-full px-3 py-2`}
                title="Reset ukuran teks"
              >
                Reset
              </button>
              <button
                onClick={() => setFontScale((s) => Math.min(1.6, Number((s + 0.1).toFixed(2))))}
                className={`${isDarkTheme ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-800 hover:bg-gray-100'} shadow-md rounded-full px-3 py-2`}
                title="Perbesar ukuran teks"
              >
                A+
              </button>
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
