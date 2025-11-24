import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../ThemeContext';

function Bookmarks() {
  const { isDarkTheme } = useContext(ThemeContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default'); // default | surah | verse
  const [openNoteKey, setOpenNoteKey] = useState(null); // key bookmark yang sedang dibuka catatannya
  const [tempNote, setTempNote] = useState(''); // nilai sementara saat edit
  const [selectedKeys, setSelectedKeys] = useState([]); // daftar key yang dipilih untuk bulk action

  useEffect(() => {
    const stored = localStorage.getItem('bookmarkedVerses');
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse bookmarkedVerses', e);
      }
    }
  }, []);

  // Sinkronisasi antar tab jika localStorage berubah
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'bookmarkedVerses') {
        try {
          if (e.newValue) {
            setBookmarks(JSON.parse(e.newValue));
          } else {
            setBookmarks([]);
          }
        } catch (err) {
          console.error('Gagal sinkronisasi bookmarkedVerses', err);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const removeBookmark = (key) => {
    const updated = bookmarks.filter((b) => b.key !== key);
    setBookmarks(updated);
    localStorage.setItem('bookmarkedVerses', JSON.stringify(updated));
  };

  const copyBookmark = (b) => {
    const textToCopy = `${b.text}\n${b.translation}\n(${b.surahName} : ${b.verseNumber})${b.note ? `\nCatatan: ${b.note}` : ''}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch (e) {
          console.error('Copy failed', e);
        }
      });
    }
  };

  const exportBookmarks = () => {
    if (!bookmarks.length) return;
    const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks-quran.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveNote = (key) => {
    const updated = bookmarks.map((b) => {
      if (b.key === key) {
        return { ...b, note: tempNote };
      }
      return b;
    });
    setBookmarks(updated);
    localStorage.setItem('bookmarkedVerses', JSON.stringify(updated));
    setOpenNoteKey(null);
    setTempNote('');
  };

  const startEditNote = (bookmark) => {
    setOpenNoteKey(bookmark.key);
    setTempNote(bookmark.note || '');
  };

  const filtered = bookmarks.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (b.text && b.text.includes(searchTerm)) ||
      (b.translation && b.translation.toLowerCase().includes(term)) ||
      (b.surahName && b.surahName.toLowerCase().includes(term))
    );
  });

  const sorted = [...filtered];
    const toggleSelect = (key) => {
      setSelectedKeys((prev) => {
        if (prev.includes(key)) {
          return prev.filter((k) => k !== key);
        }
        return [...prev, key];
      });
    };

    const clearSelection = () => setSelectedKeys([]);

    const bulkDelete = () => {
      if (!selectedKeys.length) return;
      if (!window.confirm(`Hapus ${selectedKeys.length} bookmark terpilih?`)) return;
      const updated = bookmarks.filter((b) => !selectedKeys.includes(b.key));
      setBookmarks(updated);
      localStorage.setItem('bookmarkedVerses', JSON.stringify(updated));
      clearSelection();
    };
  if (sortOption === 'surah') {
    sorted.sort((a, b) => (a.surahName || '').localeCompare(b.surahName || ''));
  } else if (sortOption === 'verse') {
    sorted.sort((a, b) => (a.verseNumber || 0) - (b.verseNumber || 0));
  }

  return (
    <div className={`min-h-screen py-8 ${
      isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6 text-center">Bookmarks</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Cari ayat / terjemahan / surah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full md:w-1/2 px-3 py-2 rounded border focus:outline-none focus:ring text-sm ${
              isDarkTheme
                ? 'bg-gray-800 border-gray-700 placeholder-gray-400 text-white focus:ring-indigo-500'
                : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-indigo-500'
            }`}
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className={`w-full md:w-48 px-3 py-2 rounded border text-sm focus:outline-none focus:ring ${
              isDarkTheme
                ? 'bg-gray-800 border-gray-700 text-white focus:ring-indigo-500'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'
            }`}
          >
            <option value="default">Urutan Asli</option>
            <option value="surah">Surah A-Z</option>
            <option value="verse">Nomor Ayat</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={exportBookmarks}
            disabled={!bookmarks.length}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              !bookmarks.length
                ? 'cursor-not-allowed opacity-60 ' + (isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-500')
                : (isDarkTheme ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-indigo-600 text-white hover:bg-indigo-500')
            }`}
          >Export JSON</button>
          <button
            onClick={bulkDelete}
            disabled={!selectedKeys.length}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              !selectedKeys.length
                ? 'cursor-not-allowed opacity-60 ' + (isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-500')
                : (isDarkTheme ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-red-600 text-white hover:bg-red-500')
            }`}
          >Hapus Terpilih ({selectedKeys.length})</button>
          {selectedKeys.length > 0 && (
            <button
              onClick={clearSelection}
              className={`px-4 py-2 rounded text-sm font-medium ${isDarkTheme ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >Bersihkan Pilihan</button>
          )}
        </div>
        {sorted.length === 0 ? (
          <p className="text-center">Belum ada bookmark.</p>
        ) : (
          <div className="space-y-6">
            {sorted.map((b) => (
              <div
                key={b.key}
                className={`p-6 rounded-lg shadow-md ${
                  isDarkTheme ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-right flex-1" style={{ direction: 'rtl' }}>
                    {b.text}
                  </h2>
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(b.key)}
                    onChange={() => toggleSelect(b.key)}
                    className="ml-3 mt-1 h-5 w-5 accent-indigo-600"
                    title="Pilih untuk bulk action"
                  />
                </div>
                <p className="mb-2">{b.translation}</p>
                <p className="text-sm mb-4">{b.surahName} : {b.verseNumber}</p>
                {b.note && !openNoteKey ? (
                  <div className="mb-4 text-sm border-l-4 pl-3 ${isDarkTheme ? 'border-indigo-400' : 'border-indigo-600'}">
                    <p className="font-semibold mb-1">Catatan:</p>
                    <p className="whitespace-pre-line">{b.note}</p>
                  </div>
                ) : null}
                {openNoteKey === b.key && (
                  <div className="mb-4">
                    <textarea
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder="Tulis catatan pribadi untuk ayat ini..."
                      className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                        isDarkTheme
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'
                      }`}
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveNote(b.key)}
                        className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
                      >Simpan</button>
                      <button
                        onClick={() => { setOpenNoteKey(null); setTempNote(''); }}
                        className={`px-3 py-1 rounded text-sm ${isDarkTheme ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                      >Batal</button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => removeBookmark(b.key)}
                  className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                >
                  Hapus
                </button>
                <button
                  onClick={() => copyBookmark(b)}
                  className="ml-2 px-3 py-1 rounded bg-green-600 text-white text-sm"
                >Salin</button>
                <button
                  onClick={() => startEditNote(b)}
                  className="ml-2 px-3 py-1 rounded bg-indigo-500 text-white text-sm"
                >
                  {openNoteKey === b.key ? 'Sedang Edit' : (b.note ? 'Edit Catatan' : 'Tambah Catatan')}
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
