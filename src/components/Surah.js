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
        return surahName.includes(searchQuery.toLowerCase()) || translatedName.includes(searchQuery.toLowerCase()) || surahId.includes(searchQuery.toLowerCase());
    }) : [];

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-center">
                <input 
                    type="text" 
                    placeholder="Pencarian Surat" 
                    value={searchQuery} 
                    onChange={handleSearch} 
                    className="p-3 w-full sm:w-1/2 lg:w-1/3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-200"
                />
            </div>
            {data ? (
                <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredData.map((surah) => (
                        <Link to={`/ayat/${surah.id}`} key={surah.id} className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition duration-200">
                            <div className="text-xl font-medium text-black">
                                Surat: {surah.name_simple}
                            </div>
                            <p className="text-gray-600">Arti: {surah.translated_name.name}</p>
                            <p className="text-gray-600">Jumlah Ayat: {surah.verses_count}</p>
                            <p className="text-gray-600">Surat Ke: {surah.id}</p>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-center mt-5">Loading data...</p>
            )}
        </div>
    );
}

export default Surah;