import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Ayat() {
    const [data, setData] = useState(null);
    const [surahName, setSurahName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [versesPerPage] = useState(50);
    const { chapter_number } = useParams();

    useEffect(() => {
        axios.get(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapter_number}`)
            .then((response) => {
                setData(response.data.verses);
            })
            .catch((error) => {
                console.error('Error fetching data: ', error);
            });

        axios.get(`https://api.quran.com/api/v4/chapters/${chapter_number}?language=id`)
            .then((response) => {
                setSurahName(response.data.chapter.name_simple);
            })
            .catch((error) => {
                console.error('Error fetching surah name: ', error);
            });
    }, [chapter_number]);

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top when pagination changes
    }, [currentPage]);

    const indexOfLastVerse = currentPage * versesPerPage;
    const indexOfFirstVerse = indexOfLastVerse - versesPerPage;
    const currentVerses = data && data.length > 0 ? data.slice(indexOfFirstVerse, indexOfLastVerse) : [];

    const renderVerses = () => {
        if (currentVerses && currentVerses.length > 0) {
            return (
                <div className="space-y-4">
                    {currentVerses.map((verse, index) => (
                        <div key={verse.id} className="bg-white p-4 rounded shadow" style={{ direction: 'rtl' }}>
                            <h2 className="text-xl font-bold">{`${index + indexOfFirstVerse + 1}. ${verse.text_uthmani}`}</h2>
                            <p className="text-gray-600">{verse.translations && verse.translations[0] && verse.translations[0].text}</p>
                            {/* Add more fields as necessary */}
                        </div>
                    ))}
                </div>
            );
        } else {
            return <p>Loading data...</p>;
        }
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(data && data.length > 0 ? data.length / versesPerPage : 1); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4" style={{ direction: 'ltr' }}>{surahName}</h1>
            {renderVerses()}
            <div className="flex justify-center mt-4">
                {pageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        className={`mx-2 px-4 py-2 rounded ${
                            pageNumber === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                        onClick={() => paginate(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Ayat;