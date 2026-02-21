import React, { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../ThemeContext';
import { getJSON, setJSON } from '../utils/storage';
import { copyText } from '../utils/clipboard';
import { motion } from 'framer-motion';
import { FiBookmark, FiTrash2, FiCopy, FiEdit3, FiDownload, FiX, FiCheck, FiSearch } from 'react-icons/fi';

function Bookmarks() {
  const { isDarkTheme } = useContext(ThemeContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [openNoteKey, setOpenNoteKey] = useState(null);
  const [tempNote, setTempNote] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => { setBookmarks(getJSON('bookmarkedVerses', [])); }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'bookmarkedVerses') {
        try { setBookmarks(e.newValue ? JSON.parse(e.newValue) : []); } catch (err) { }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const removeBookmark = (key) => {
    const updated = bookmarks.filter((b) => b.key !== key);
    setBookmarks(updated);
    setJSON('bookmarkedVerses', updated);
  };

  const copyBookmark = async (b) => {
    const textToCopy = `${b.text}\n${b.translation}\n(${b.surahName} : ${b.verseNumber})${b.note ? `\nCatatan: ${b.note}` : ''}`;
    await copyText(textToCopy);
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
    const updated = bookmarks.map((b) => b.key === key ? { ...b, note: tempNote } : b);
    setBookmarks(updated);
    localStorage.setItem('bookmarkedVerses', JSON.stringify(updated));
    setOpenNoteKey(null);
    setTempNote('');
  };

  const startEditNote = (bookmark) => {
    setOpenNoteKey(bookmark.key);
    setTempNote(bookmark.note || '');
  };

  const toggleSelect = (key) => {
    setSelectedKeys((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const clearSelection = () => setSelectedKeys([]);

  const bulkDelete = () => {
    if (!selectedKeys.length) return;
    if (!window.confirm(`Hapus ${selectedKeys.length} bookmark terpilih?`)) return;
    const updated = bookmarks.filter((b) => !selectedKeys.includes(b.key));
    setBookmarks(updated);
    setJSON('bookmarkedVerses', updated);
    clearSelection();
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
  if (sortOption === 'surah') sorted.sort((a, b) => (a.surahName || '').localeCompare(b.surahName || ''));
  else if (sortOption === 'verse') sorted.sort((a, b) => (a.verseNumber || 0) - (b.verseNumber || 0));

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-slate-950 text-white' : 'bg-surface-light text-slate-800'}`}>
      {/* Header */}
      <div className={`${isDarkTheme ? 'bg-hero-dark' : 'bg-hero-light'} islamic-pattern-bg`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-14 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FiBookmark className="text-2xl text-white/80" />
            <h1 className="text-3xl font-poppins font-bold text-white">Bookmarks</h1>
          </div>
          <p className="text-white/60 text-sm">{bookmarks.length} ayat tersimpan</p>
        </div>
        <svg viewBox="0 0 1440 40" fill="none" className="w-full h-6 md:h-10">
          <path d="M0 40V20C360 0 720 0 1080 20C1260 30 1380 40 1440 40H0Z" fill={isDarkTheme ? '#020617' : '#f8fafc'} />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-2 pb-16">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari ayat / terjemahan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none ${isDarkTheme
                ? 'bg-slate-900 border border-white/5 text-white placeholder-slate-500 focus:border-primary-500'
                : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary-500'
                } transition-colors`}
            />
          </div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className={`px-4 py-2.5 rounded-xl text-sm outline-none ${isDarkTheme
              ? 'bg-slate-900 border border-white/5 text-white'
              : 'bg-white border border-slate-200 text-slate-900'
              }`}
          >
            <option value="default">Urutan Asli</option>
            <option value="surah">Surah A-Z</option>
            <option value="verse">Nomor Ayat</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={exportBookmarks}
            disabled={!bookmarks.length}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${!bookmarks.length
              ? 'opacity-40 cursor-not-allowed ' + (isDarkTheme ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400')
              : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-glow-teal'
              }`}
          >
            <FiDownload size={14} /> Export JSON
          </button>
          {selectedKeys.length > 0 && (
            <>
              <button
                onClick={bulkDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <FiTrash2 size={14} /> Hapus ({selectedKeys.length})
              </button>
              <button
                onClick={clearSelection}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${isDarkTheme ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
              >
                Batal Pilih
              </button>
            </>
          )}
        </div>

        {/* Bookmarks list */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <FiBookmark className={`mx-auto text-4xl mb-4 ${isDarkTheme ? 'text-slate-700' : 'text-slate-300'}`} />
            <p className={`text-lg font-medium ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
              Belum ada bookmark
            </p>
            <p className={`text-sm mt-1 ${isDarkTheme ? 'text-slate-600' : 'text-slate-400'}`}>
              Tandai ayat favorit saat membaca Al-Quran
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((b, i) => (
              <motion.div
                key={b.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className={`rounded-2xl overflow-hidden border transition-all ${selectedKeys.includes(b.key)
                  ? isDarkTheme ? 'border-primary-500/30 bg-primary-500/5' : 'border-primary-200 bg-primary-50/50'
                  : isDarkTheme ? 'border-white/5 bg-slate-900/40' : 'border-slate-100 bg-white'
                  }`}
              >
                {/* Gold accent */}
                <div className="h-0.5 bg-gold-gradient" />
                <div className="p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(b.key)}
                      onChange={() => toggleSelect(b.key)}
                      className="mt-2 h-4 w-4 accent-primary-600 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      {/* Arabic */}
                      <p className={`text-xl font-bold text-right font-amiri leading-[2.2] mb-3 ${isDarkTheme ? 'text-white' : 'text-slate-800'}`} dir="rtl" lang="ar">
                        {b.text}
                      </p>
                      <p className={`text-sm leading-relaxed mb-2 ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                        {b.translation}
                      </p>
                      <p className={`text-xs font-medium ${isDarkTheme ? 'text-primary-400' : 'text-primary-600'}`}>
                        {b.surahName} : Ayat {b.verseNumber}
                      </p>

                      {/* Note display */}
                      {b.note && openNoteKey !== b.key && (
                        <div className={`mt-3 text-sm border-l-2 pl-3 ${isDarkTheme ? 'border-primary-500/30 text-slate-400' : 'border-primary-300 text-slate-600'}`}>
                          <p className={`font-semibold text-xs mb-0.5 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Catatan:</p>
                          <p className="whitespace-pre-line">{b.note}</p>
                        </div>
                      )}

                      {/* Note editor */}
                      {openNoteKey === b.key && (
                        <div className="mt-3">
                          <textarea
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            placeholder="Tulis catatan pribadi..."
                            className={`w-full rounded-xl px-3 py-2 text-sm outline-none border ${isDarkTheme
                              ? 'bg-slate-800 border-slate-700 text-white focus:border-primary-500'
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-primary-500'
                              } transition-colors`}
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => saveNote(b.key)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium">
                              <FiCheck size={12} /> Simpan
                            </button>
                            <button onClick={() => { setOpenNoteKey(null); setTempNote(''); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDarkTheme ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                              <FiX size={12} className="inline mr-1" /> Batal
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => removeBookmark(b.key)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                          <FiTrash2 size={14} />
                        </button>
                        <button onClick={() => copyBookmark(b)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors">
                          <FiCopy size={14} />
                        </button>
                        <button onClick={() => startEditNote(b)} className="p-2 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors">
                          <FiEdit3 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookmarks;
