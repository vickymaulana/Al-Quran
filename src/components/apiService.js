import axios from 'axios';

export const fetchVerses = (chapter_number) => axios.get(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapter_number}`);
export const fetchTranslations = (chapter_number) => axios.get(`https://quranenc.com/api/v1/translation/sura/indonesian_sabiq/${chapter_number}`);
export const fetchSurahName = (chapter_number) => axios.get(`https://api.quran.com/api/v4/chapters/${chapter_number}?language=id`);
export const fetchChapters = () => axios.get('https://api.quran.com/api/v4/chapters?language=id');