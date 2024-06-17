import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetchData } from './useFetchData';

function Ayat() {
    const [currentPage, setCurrentPage] = useState(1);
    const versesPerPage = 50;
    const { chapter_number } = useParams();
    const { data, translations, surahName } = useFetchData('verses', chapter_number);
    const nextChapter = parseInt(chapter_number, 10) + 1;
    const { surahName: nextSurahName } = useFetchData('verses', nextChapter);
    const navigate = useNavigate();

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
        visible: { opacity: 1, y: 0 }
    };

    const renderVerses = () => {
        if (currentVerses.length > 0) {
            return (
                <div className="space-y-6">
                    {currentVerses.map((verse, index) => {
                        const translationIndex = index + indexOfFirstVerse;
                        return (
                            <motion.div
                                key={verse.id}
                                className="bg-white p-6 rounded-lg shadow-lg"
                                style={{ direction: 'ltr' }}
                                initial="hidden"
                                animate="visible"
                                variants={verseContainerVariants}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <h2 className="text-2xl font-bold text-right text-gray-800">{`${index + indexOfFirstVerse + 1}. ${verse.text_uthmani}`}</h2>
                                <p className="text-gray-600 text-left mt-2">
                                    {translations?.[translationIndex]?.translation}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            );
        } else {
            return <p className="text-center text-gray-500">Loading data...</p>;
        }
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const pageNumbers = Array.from({ length: Math.ceil(data?.length / versesPerPage) || 1 }, (_, i) => i + 1);

    const renderBismillah = () => {
        if (currentPage === 1) {
            return (
                <div className="text-center text-2xl font-bold mb-6 text-gray-800">
                    بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </div>
            );
        }
    };

    const renderPagination = () => {
        const isLastPage = currentPage === pageNumbers.length;

        return (
            <div className="flex justify-center mt-6 space-x-2">
                {pageNumbers.map((pageNumber) => (
                    <motion.button
                        key={pageNumber}
                        className={`px-4 py-2 rounded-lg text-sm ${
                            pageNumber === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800'
                        } hover:bg-blue-500 hover:text-white transition duration-300`}
                        onClick={() => paginate(pageNumber)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {pageNumber}
                    </motion.button>
                ))}
                {isLastPage && (
                    <button
                        className="px-4 py-2 rounded-lg text-sm bg-green-600 text-white hover:bg-green-500 transition duration-300"
                        onClick={navigateToNextChapter}
                    >
                        Surat Berikutnya: {nextSurahName}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {renderBismillah()}
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-900" style={{ direction: 'ltr' }}>{surahName}</h1>
            {renderVerses()}
            {renderPagination()}
        </div>
    );
}

export default Ayat;
