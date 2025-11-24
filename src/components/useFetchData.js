import { useState, useEffect, useCallback } from 'react';
import { fetchChapters, fetchVerses, fetchTranslations, fetchSurahName } from './apiService';

export const useFetchData = (type, chapter_number) => {
    const [data, setData] = useState(null);
    const [translations, setTranslations] = useState(null);
    const [surahName, setSurahName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async (signal) => {
        setLoading(true);
        setError(null);
        try {
            if (type === 'chapters') {
                const response = await fetchChapters({ signal });
                setData(response.data.chapters);
            } else if (type === 'verses') {
                const [versesResponse, translationsResponse, surahNameResponse] = await Promise.all([
                    fetchVerses(chapter_number, { signal }),
                    fetchTranslations(chapter_number, { signal }),
                    fetchSurahName(chapter_number, { signal }),
                ]);

                setData(versesResponse.data.verses);
                // Support different translation payload shapes safely
                setTranslations(translationsResponse?.data?.result || translationsResponse?.data || null);
                setSurahName(surahNameResponse?.data?.chapter?.name_simple || '');
            }
        } catch (err) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') return;
            // eslint-disable-next-line no-console
            console.error('Error fetching data: ', err);
            setError('Gagal mengambil data');
        } finally {
            setLoading(false);
        }
    }, [type, chapter_number]);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    const refetch = useCallback(() => {
        const controller = new AbortController();
        load(controller.signal);
    }, [load]);

    return { data, translations, surahName, error, loading, refetch };
};
