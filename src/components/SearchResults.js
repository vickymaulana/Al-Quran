import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchVerses, fallbackSearchVerses, fetchTranslations } from './apiService';
import { ThemeContext } from '../ThemeContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const { isDarkTheme } = useContext(ThemeContext);
  const queryParams = useQuery();
  const q = queryParams.get('query') || '';

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const doSearch = async () => {
      if (!q.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Try main search endpoint first
        const res = await searchVerses(q, 50);
        // The structure may vary; try some common shapes
        const matches = res?.data?.matches || res?.data?.search?.results || res?.data?.data || [];

        // Normalize matches to objects containing chapter_id, verse_number, text_uthmani, chapter_name
        let normalized = [];
        if (Array.isArray(matches) && matches.length > 0) {
          normalized = matches.map((m) => ({
            chapter_id: m.chapter_id || m.chapter || (m.verse_key ? parseInt(m.verse_key.split(':')[0], 10) : null),
            chapter_name: m.chapter_name || m.chapter_name_simple || m.chapter || null,
            verse_number: m.verse_number || m.verse || (m.verse_key ? parseInt(m.verse_key.split(':')[1], 10) : null),
            text_uthmani: m.text_uthmani || m.aya || m.text || m.verse_text || '',
            verse_key: m.verse_key || (m.chapter_id ? `${m.chapter_id}:${m.verse_number}` : m.verse_key),
          }));
        }

        // If normalized empty, try fallback
        if (normalized.length === 0) {
          const fallback = await fallbackSearchVerses(q);
          const fb = fallback?.data?.matches || [];
          normalized = fb.map((m) => ({
            chapter_id: m.chapter_id,
            chapter_name: m.chapter_name,
            verse_number: m.verse_number,
            text_uthmani: m.text_uthmani,
            verse_key: m.verse_key,
          }));
        }

        // Fetch translations for all unique chapters in results
        const chapterIds = Array.from(new Set(normalized.map((n) => n.chapter_id).filter(Boolean)));
        const translationsMap = {};
        try {
          await Promise.all(
            chapterIds.map(async (cid) => {
              try {
                const tr = await fetchTranslations(cid);
                // expect array in tr.data.result (based on useFetchData usage)
                translationsMap[cid] = tr?.data?.result || tr?.data || [];
              } catch (e) {
                translationsMap[cid] = [];
              }
            })
          );
        } catch (e) {
          // ignore and continue
        }

        const getTranslationText = (arr, verseNumber) => {
          if (!arr || arr.length === 0) return null;
          const idx = Number(verseNumber) - 1;
          if (arr[idx]) {
            return arr[idx].translation || arr[idx].text || arr[idx].translation_text || arr[idx].result || null;
          }
          const found = arr.find((t) => String(t.verse_number) === String(verseNumber) || String(t.verse) === String(verseNumber));
          if (found) return found.translation || found.text || found.translation_text || null;
          return null;
        };

        const enriched = normalized.map((item) => ({
          ...item,
          translation: getTranslationText(translationsMap[item.chapter_id], item.verse_number),
        }));

        setResults(enriched);
      } catch (err) {
        // If primary search failed, attempt fallback
        try {
          const fallback = await fallbackSearchVerses(q);
          const fb = fallback?.data?.matches || [];
          const normalized = fb.map((m) => ({
            chapter_id: m.chapter_id,
            chapter_name: m.chapter_name,
            verse_number: m.verse_number,
            text_uthmani: m.text_uthmani,
            verse_key: m.verse_key,
          }));

          const chapterIdsFb = Array.from(new Set(normalized.map((n) => n.chapter_id).filter(Boolean)));
          const translationsMapFb = {};
          try {
            await Promise.all(
              chapterIdsFb.map(async (cid) => {
                try {
                  const tr = await fetchTranslations(cid);
                  translationsMapFb[cid] = tr?.data?.result || tr?.data || [];
                } catch (e) {
                  translationsMapFb[cid] = [];
                }
              })
            );
          } catch (e) {}

          const getTranslationTextFb = (arr, verseNumber) => {
            if (!arr || arr.length === 0) return null;
            const idx = Number(verseNumber) - 1;
            if (arr[idx]) return arr[idx].translation || arr[idx].text || arr[idx].translation_text || arr[idx].result || null;
            const found = arr.find((t) => String(t.verse_number) === String(verseNumber) || String(t.verse) === String(verseNumber));
            if (found) return found.translation || found.text || found.translation_text || null;
            return null;
          };

          const enrichedFb = normalized.map((item) => ({
            ...item,
            translation: getTranslationTextFb(translationsMapFb[item.chapter_id], item.verse_number),
          }));

          setResults(enrichedFb);
        } catch (err2) {
          setError('Terjadi kesalahan saat mencari. Coba lagi nanti.');
        }
      } finally {
        setLoading(false);
      }
    };

    doSearch();
  }, [q]);

  return (
    <div className={`min-h-screen py-8 ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-blue-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Hasil Pencarian untuk: "{q}"</h1>

        {loading && <p>Memuat hasil...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && results.length === 0 && !error && (
          <p className="text-gray-500">Tidak ada hasil ditemukan.</p>
        )}

        <div className="space-y-4">
          {results.map((r, idx) => (
            <div key={`${r.verse_key || idx}`} className={`p-4 rounded-lg shadow-md ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`} style={{direction: 'rtl'}}>
              <h2 className="text-lg sm:text-xl font-bold text-right mb-2">{r.text_uthmani}</h2>
              {r.translation && (
                <p className="text-left mt-2 italic text-gray-700 dark:text-gray-300" style={{ direction: 'ltr' }}>
                  {r.translation}
                </p>
              )}
              <p className="text-left mt-2">Surat: {r.chapter_name || r.chapter_id} — Ayat: {r.verse_number}</p>
              <div className="mt-3">
                <Link to={`/ayat/${r.chapter_id}#verse-${r.verse_number}`} className="text-blue-500 hover:underline inline-block">Buka surat ini</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
