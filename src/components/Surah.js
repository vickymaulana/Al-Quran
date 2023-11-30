import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Surah() {
    const [data, setData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        axios.get('https://api.quran.com/api/v4/chapters?language=id')
            .then((response) => {
                setData(response.data.chapters);
            })
            .catch((error) => {
                console.error('Error fetching data: ', error);
            });
    }, []);

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
        <div>
            <input type="text" placeholder="Pencarian Surat" value={searchQuery} onChange={handleSearch} className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {data ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredData.map((surah) => (
                        <div key={surah.id} className="p-6 bg-white rounded-xl shadow-md">
                            <Link to={`/ayat/${surah.id}`} className="text-xl font-medium text-black">Surat: {surah.name_simple}</Link>
                            <p className="text-gray-500">Arti: {surah.translated_name.name}</p>
                            <p className="text-gray-500">Jumlah Ayat: {surah.verses_count}</p>
                            <p className="text-gray-500">Surat Ke: {surah.id}</p>
                            {/* Add more fields as necessary */}
                        </div>
                    ))}
                </div>
            ) : (
                <p>Loading data...</p>
            )}
        </div>
    );
}

export default Surah;
