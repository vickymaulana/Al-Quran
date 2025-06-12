import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../ThemeContext';

function Bookmarks() {
  const { isDarkTheme } = useContext(ThemeContext);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('bookmarkedVerses');
    if (stored) {
      setBookmarks(JSON.parse(stored));
    }
  }, []);

  const removeBookmark = (key) => {
    const updated = bookmarks.filter((b) => b.key !== key);
    setBookmarks(updated);
    localStorage.setItem('bookmarkedVerses', JSON.stringify(updated));
  };

  return (
    <div className={`min-h-screen py-8 ${
      isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6 text-center">Bookmarks</h1>
        {bookmarks.length === 0 ? (
          <p className="text-center">Belum ada bookmark.</p>
        ) : (
          <div className="space-y-6">
            {bookmarks.map((b) => (
              <div
                key={b.key}
                className={`p-6 rounded-lg shadow-md ${
                  isDarkTheme ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <h2 className="text-2xl font-bold mb-2 text-right" style={{ direction: 'rtl' }}>
                  {b.text}
                </h2>
                <p className="mb-2">{b.translation}</p>
                <p className="text-sm mb-4">{b.surahName} : {b.verseNumber}</p>
                <button
                  onClick={() => removeBookmark(b.key)}
                  className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookmarks;
