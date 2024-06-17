import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetchData } from './useFetchData';

function Surah() {
    const [searchQuery, setSearchQuery] = useState('');
    const { data } = useFetchData('chapters');

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredData = data ? data.filter((surah) => {
        const surahName = surah.name_simple.toLowerCase();
        const translatedName = surah.translated_name.name.toLowerCase();
        const surahId = surah.id.toString();
        const query = searchQuery.toLowerCase();
        return surahName.includes(query) || translatedName.includes(query) || surahId.includes(query);
    }) : [];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-center mb-6">
                <input 
                    type="text" 
                    placeholder="Pencarian Surat" 
                    value={searchQuery} 
                    onChange={handleSearch} 
                    className="p-4 w-full sm:w-1/2 lg:w-1/3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
                />
            </div>
            {data ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredData.map((surah) => (
                        <Link 
                            to={`/ayat/${surah.id}`} 
                            key={surah.id} 
                            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-200"
                        >
                            <div className="text-2xl font-semibold text-gray-800 mb-2">
                                {surah.name_simple}
                            </div>
                            <p className="text-gray-600 mb-1">
                                <span className="font-medium">Arti:</span> {surah.translated_name.name}
                            </p>
                            <p className="text-gray-600 mb-1">
                                <span className="font-medium">Jumlah Ayat:</span> {surah.verses_count}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Surat Ke:</span> {surah.id}
                            </p>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-6">Loading data...</p>
            )}
        </div>
    );
}

export default Surah;
