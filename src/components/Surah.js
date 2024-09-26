import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useFetchData } from './useFetchData';
import { ThemeContext } from '../ThemeContext';

function Surah() {
  const { isDarkTheme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const { data } = useFetchData('chapters');

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = data
    ? data.filter((surah) => {
        const surahName = surah.name_simple.toLowerCase();
        const translatedName = surah.translated_name.name.toLowerCase();
        const surahId = surah.id.toString();
        const query = searchQuery.toLowerCase();
        return (
          surahName.includes(query) ||
          translatedName.includes(query) ||
          surahId.includes(query)
        );
      })
    : [];

  return (
    <div
      className={`min-h-screen py-8 ${
        isDarkTheme
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Cari Surat..."
            value={searchQuery}
            onChange={handleSearch}
            className={`w-full sm:w-1/2 lg:w-1/3 p-4 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
              isDarkTheme
                ? 'bg-gray-800 text-white border-gray-700 focus:ring-blue-500'
                : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500'
            }`}
          />
        </div>
        {data ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredData.map((surah) => (
              <Link
                to={`/ayat/${surah.id}`}
                key={surah.id}
                className={`block p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 ${
                  isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">{surah.name_simple}</h2>
                  <span className="text-xl text-gray-500">{surah.id}</span>
                </div>
                <p className="mb-2">
                  <span className="font-medium">Arti:</span>{' '}
                  {surah.translated_name.name}
                </p>
                <p>
                  <span className="font-medium">Jumlah Ayat:</span>{' '}
                  {surah.verses_count}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6">Memuat data...</p>
        )}
      </div>
    </div>
  );
}

export default Surah;
