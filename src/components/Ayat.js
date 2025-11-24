import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetchData } from './useFetchData';
import { ThemeContext } from '../ThemeContext';
import { FiBookmark } from 'react-icons/fi';

function Ayat() {
  const { isDarkTheme } = useContext(ThemeContext);
  const versesPerPage = 50;
  const { chapter_number } = useParams();
  const { data, translations, surahName } = useFetchData('verses', chapter_number);
  const nextChapter = parseInt(chapter_number, 10) + 1;
  const { surahName: nextSurahName } = useFetchData('verses', nextChapter);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [copiedVerse, setCopiedVerse] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    const stored = localStorage.getItem('bookmarkedVerses');
    return stored ? JSON.parse(stored) : [];
  });

  const navigateToNextChapter = () => {
    navigate(`/ayat/${nextChapter}`);
    setCurrentPage(1);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // If navigated with a hash (e.g. #verse-10), scroll to that verse and set page.
  const location = useLocation();
  const [highlighted, setHighlighted] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const hash = location.hash || window.location.hash;
    if (!hash) return;

    const match = hash.match(/#?verse-(\d+)/i);
    if (!match) return;

    const verseNumber = parseInt(match[1], 10);
    if (!verseNumber || verseNumber <= 0) return;

    const targetPage = Math.ceil(verseNumber / versesPerPage);
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
      // wait for render/pagination to update
      setTimeout(() => {
        const el = document.getElementById(`verse-${verseNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlighted(verseNumber);
          setTimeout(() => setHighlighted(null), 4000);
        }
      }, 250);
    } else {
      const el = document.getElementById(`verse-${verseNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlighted(verseNumber);
        setTimeout(() => setHighlighted(null), 4000);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, data, currentPage]);

  const indexOfLastVerse = currentPage * versesPerPage;
  const indexOfFirstVerse = indexOfLastVerse - versesPerPage;
  const currentVerses = data?.slice(indexOfFirstVerse, indexOfLastVerse) || [];

  const toggleBookmark = (verseNumber, verseText, translation) => {
    const key = `${chapter_number}:${verseNumber}`;
    const existing = bookmarks.find((b) => b.key === key);
    let updated;
    if (existing) {
      updated = bookmarks.filter((b) => b.key !== key);
    } else {
      updated = [
        ...bookmarks,
        {
          key,
          surahName,
          verseNumber,
          text: verseText,
          translation,
        },
      ];
    }
    setBookmarks(updated);
    localStorage.setItem('bookmarkedVerses', JSON.stringify(updated));
  };

  const verseContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const renderVerses = () => {
    if (currentVerses.length > 0) {
      return (
        <div className="space-y-8">
          {currentVerses.map((verse, index) => {
            const translationIndex = index + indexOfFirstVerse;
            const globalVerseNumber = index + indexOfFirstVerse + 1;
            return (
              <motion.div
                id={`verse-${globalVerseNumber}`}
                key={verse.id}
                className={`${
                  isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                } p-6 rounded-lg shadow-md ${highlighted === globalVerseNumber ? 'ring-4 ring-yellow-300' : ''}`}
                style={{ direction: 'rtl' }}
                initial="hidden"
                animate="visible"
                variants={verseContainerVariants}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <h2 className="text-2xl font-bold text-right mb-4">
                      {`${globalVerseNumber}. ${verse.text_uthmani}`}
                </h2>
                    <div className="flex justify-end items-center gap-2 mt-2">
                      <button
                        onClick={async () => {
                          const url = `${window.location.origin}${window.location.pathname}#verse-${globalVerseNumber}`;
                          try {
                            await navigator.clipboard.writeText(url);
                          } catch (e) {
                            // fallback
                            const tmp = document.createElement('input');
                            tmp.value = url;
                            document.body.appendChild(tmp);
                            tmp.select();
                            document.execCommand('copy');
                            document.body.removeChild(tmp);
                          }
                          window.history.replaceState(null, '', `#verse-${globalVerseNumber}`);
                          setCopiedVerse(globalVerseNumber);
                          setTimeout(() => setCopiedVerse(null), 2000);
                        }}
                        className="text-sm px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 transition"
                        aria-label={`Copy link to verse ${globalVerseNumber}`}
                      >
                        🔗
                      </button>
                      {copiedVerse === globalVerseNumber && (
                        <span className="text-sm text-green-500">!Copied</span>
                      )}
                    </div>
                <p
                  className={`text-left mt-2 ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                  }`}
                  style={{ direction: 'ltr' }}
                >
                  {translations?.[translationIndex]?.translation}
                </p>
                <button
                  onClick={() =>
                    toggleBookmark(
                      index + indexOfFirstVerse + 1,
                      verse.text_uthmani,
                      translations?.[translationIndex]?.translation
                    )
                  }
                  className={`mt-4 p-2 rounded-full border transition-colors ${
                    bookmarks.find(
                      (b) => b.key === `${chapter_number}:${index + indexOfFirstVerse + 1}`
                    )
                      ? 'bg-yellow-400 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-yellow-200'
                  }`}
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

  const totalPages = Math.ceil(data?.length / versesPerPage) || 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const renderBismillah = () => {
    if (currentPage === 1 && chapter_number !== '1' && chapter_number !== '9') {
      return (
        <div
          className={`text-center text-3xl font-bold mb-6 ${
            isDarkTheme ? 'text-white' : 'text-gray-800'
          }`}
          style={{ direction: 'rtl' }}
        >
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
      );
    }
  };

  const renderPagination = () => {
    const isLastPage = currentPage === totalPages;

    return (
      <div className="flex flex-wrap justify-center mt-8 space-x-2">
        {pageNumbers.map((pageNumber) => (
          <motion.button
            key={pageNumber}
            className={`px-4 py-2 rounded-lg text-sm mb-2 transition duration-300 ${
              pageNumber === currentPage
                ? 'bg-blue-600 text-white'
                : `${
                    isDarkTheme
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
      className={`min-h-screen py-8 ${
        isDarkTheme
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800'
      }`}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6 text-center">{surahName}</h1>
        {renderBismillah()}
        {renderVerses()}
        {renderPagination()}
      </div>
    </div>
  );
}

export default Ayat;
