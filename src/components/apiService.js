import axios from 'axios';

export const fetchVerses = (chapter_number) => axios.get(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapter_number}`);
export const fetchTranslations = (chapter_number) => axios.get(`https://quranenc.com/api/v1/translation/sura/indonesian_sabiq/${chapter_number}`);
export const fetchSurahName = (chapter_number) => axios.get(`https://api.quran.com/api/v4/chapters/${chapter_number}?language=id`);
export const fetchChapters = () => axios.get('https://api.quran.com/api/v4/chapters?language=id');

// Search verses using api.quran.com search endpoint. If the external search fails,
// the fallbackSearch will attempt to search by fetching chapters and verses.
export const searchVerses = async (query, per_page = 50) => {
	try {
		const encoded = encodeURIComponent(query);
		const res = await axios.get(`https://api.quran.com/api/v4/search?q=${encoded}&per_page=${per_page}`);
		return res;
	} catch (err) {
		// Re-throw to allow caller to attempt fallback
		throw err;
	}
};

// Fallback: fetch chapters and search the uthmani verse text for the query string.
export const fallbackSearchVerses = async (query) => {
	try {
		const chaptersRes = await fetchChapters();
		const chapters = chaptersRes.data.chapters || [];

		// Limit concurrency by processing sequentially to avoid overwhelming the API.
		const results = [];
		for (let ch of chapters) {
			try {
				const versesRes = await fetchVerses(ch.id);
				const verses = versesRes.data.verses || [];
				for (let v of verses) {
					const text = (v.text_uthmani || '').toLowerCase();
					if (text.includes(query.toLowerCase())) {
						results.push({
							chapter_id: ch.id,
							chapter_name: ch.name_simple,
							verse_number: v.verse_number,
							text_uthmani: v.text_uthmani,
							verse_key: v.verse_key || `${ch.id}:${v.verse_number}`,
						});
					}
				}
			} catch (e) {
				// ignore chapter fetch errors and continue
				console.warn('Error fetching verses for chapter', ch.id, e.message);
			}
		}
		return { data: { matches: results } };
	} catch (err) {
		throw err;
	}
};