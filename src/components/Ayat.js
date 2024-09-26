import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetchData } from './useFetchData';
import { ThemeContext } from '../ThemeContext';

function Ayat() {
  const { isDarkTheme } = useContext(ThemeContext);
  const versesPerPage = 50;
  const { chapter_number } = useParams();
  const { data, translations, surahName } = useFetchData('verses', chapter_number);
  const nextChapter = parseInt(chapter_number, 10) + 1;
  const { surahName: nextSurahName } = useFetchData('verses', nextChapter);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);

  const navigateToNextChapter = () => {
    navigate(`/ayat/${nextChapter}`);
    setCurrentPage(1);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const indexOfLastVerse = currentPage * versesPerPage;
  const indexOfFirstVerse = indexOfLastVerse - versesPerPage;
  const currentVerses = data?.slice(indexOfFirstVerse, indexOfLastVerse) || [];

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
            return (
              <motion.div
                key={verse.id}
                className={`${
                  isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                } p-6 rounded-lg shadow-md`}
                style={{ direction: 'rtl' }}
                initial="hidden"
                animate="visible"
                variants={verseContainerVariants}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <h2 className="text-2xl font-bold text-right mb-4">
                  {`${index + indexOfFirstVerse + 1}. ${verse.text_uthmani}`}
                </h2>
                <p
                  className={`text-left mt-2 ${
                    isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                  }`}
                  style={{ direction: 'ltr' }}
                >
                  {translations?.[translationIndex]?.translation}
                </p>
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
