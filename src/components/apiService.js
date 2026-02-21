import axios from 'axios';

const QURAN_API = axios.create({
	baseURL: 'https://api.quran.com/api/v4',
	timeout: 10000,
});

const QURANENC_API = axios.create({
	baseURL: 'https://quranenc.com/api/v1',
	timeout: 10000,
});

// ===== Reciter IDs for Quran.com Audio API =====
export const RECITERS = [
	{ id: 7, name: 'Mishary Rashid Alafasy' },
	{ id: 1, name: 'Abdul Baset Abdul Samad' },
	{ id: 6, name: 'Mahmoud Khalil Al-Husary' },
	{ id: 4, name: 'Abu Bakr Ash-Shaatree' },
	{ id: 10, name: 'Saad Al-Ghamdi' },
	{ id: 12, name: 'Maher Al Muaiqly' },
];

// ===== Tafsir IDs =====
export const TAFSIRS = [
	{ id: 169, name: 'Tafsir Jalalayn', language: 'ar' },
	{ id: 816, name: 'Tafsir Al-Muyassar', language: 'ar' },
];

// ===== Existing API functions =====
export const fetchVerses = (chapter_number, options = {}) =>
	QURAN_API.get(`/quran/verses/uthmani`, { params: { chapter_number }, signal: options.signal });

export const fetchTranslations = (chapter_number, options = {}) =>
	QURANENC_API.get(`/translation/sura/indonesian_sabiq/${chapter_number}`, { signal: options.signal });

export const fetchSurahName = (chapter_number, options = {}) =>
	QURAN_API.get(`/chapters/${chapter_number}`, { params: { language: 'id' }, signal: options.signal });

export const fetchChapters = (options = {}) =>
	QURAN_API.get('/chapters', { params: { language: 'id' }, signal: options.signal });

export const searchVerses = async (query, per_page = 50, options = {}) => {
	try {
		const encoded = encodeURIComponent(query);
		return await QURAN_API.get('/search', { params: { q: encoded, per_page }, signal: options.signal });
	} catch (err) {
		throw err;
	}
};

export const fallbackSearchVerses = async (query, options = {}) => {
	try {
		const chaptersRes = await fetchChapters(options);
		const chapters = chaptersRes.data.chapters || [];
		const results = [];
		for (let ch of chapters) {
			try {
				const versesRes = await fetchVerses(ch.id, options);
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
				// eslint-disable-next-line no-console
				console.warn('Error fetching verses for chapter', ch.id, e?.message || e);
			}
		}
		return { data: { matches: results } };
	} catch (err) {
		throw err;
	}
};

// ===== Audio API =====
export const fetchAudioForChapter = async (reciterId, chapterId, options = {}) => {
	try {
		const res = await QURAN_API.get(`/recitations/${reciterId}/by_chapter/${chapterId}`, {
			signal: options.signal,
		});
		return res.data;
	} catch (err) {
		throw err;
	}
};

export const getAudioUrl = (audioFile) => {
	if (!audioFile || !audioFile.url) return null;
	const base = 'https://verses.quran.com/';
	return audioFile.url.startsWith('http') ? audioFile.url : `${base}${audioFile.url}`;
};

// ===== Tafsir API =====
export const fetchTafsir = async (verseKey, tafsirId = 169, options = {}) => {
	try {
		const res = await QURAN_API.get(`/tafsirs/${tafsirId}/by_ayah/${verseKey}`, {
			signal: options.signal,
		});
		return res.data;
	} catch (err) {
		throw err;
	}
};