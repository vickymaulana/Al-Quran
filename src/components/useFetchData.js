import { useState, useEffect } from 'react';
import { fetchChapters, fetchVerses, fetchTranslations, fetchSurahName } from './apiService';

export const useFetchData = (type, chapter_number) => {
    const [data, setData] = useState(null);
    const [translations, setTranslations] = useState(null);
    const [surahName, setSurahName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (type === 'chapters') {
                    const response = await fetchChapters();
                    setData(response.data.chapters);
                } else if (type === 'verses') {
                    const [versesResponse, translationsResponse, surahNameResponse] = await Promise.all([
                        fetchVerses(chapter_number),
                        fetchTranslations(chapter_number),
                        fetchSurahName(chapter_number)
                    ]);

                    setData(versesResponse.data.verses);
                    setTranslations(translationsResponse.data.result);
                    setSurahName(surahNameResponse.data.chapter.name_simple);
                }
            } catch (error) {
                console.error('Error fetching data: ', error);
                // Handle the error here (e.g., show an error message)
            }
        };

        fetchData();
    }, [type, chapter_number]);

    return { data, translations, surahName };
};
