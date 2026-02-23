/**
 * Fuzzy search utility — handles typos, transliteration variants, and partial matches.
 * No external dependencies.
 */

/**
 * Normalize text for comparison: lowercase, strip diacritics, unify transliteration variants.
 */
export const normalize = (str) => {
    if (!str) return '';
    let s = str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip diacritics
        .replace(/[''`ʼ]/g, "'")        // normalize quotes
        .trim();

    // Common Arabic→Latin transliteration equivalences
    const variants = [
        [/dh/g, 'd'], [/th/g, 't'], [/sh/g, 's'], [/kh/g, 'k'],
        [/gh/g, 'g'], [/zh/g, 'z'], [/aa/g, 'a'], [/ee/g, 'i'],
        [/oo/g, 'u'], [/ou/g, 'u'], [/ph/g, 'f'],
        [/[''ʻʿʾ]/g, ''],           // remove hamzah/ain marks
        [/-/g, ''],                   // remove hyphens
        [/\s+/g, ''],                 // remove spaces
    ];
    for (const [pattern, replacement] of variants) {
        s = s.replace(pattern, replacement);
    }
    return s;
};

/**
 * Calculate Levenshtein distance between two strings.
 */
export const levenshtein = (a, b) => {
    if (!a) return b ? b.length : 0;
    if (!b) return a.length;

    const m = a.length;
    const n = b.length;

    // Optimization: if the length difference is already bigger than reasonable, bail
    if (Math.abs(m - n) > Math.max(m, n) * 0.6) return Math.max(m, n);

    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,      // deletion
                dp[i][j - 1] + 1,      // insertion
                dp[i - 1][j - 1] + cost // substitution
            );
        }
    }
    return dp[m][n];
};

/**
 * Calculate similarity score between query and text (0 to 1, 1 = exact match).
 */
export const similarity = (query, text) => {
    const nq = normalize(query);
    const nt = normalize(text);

    if (!nq || !nt) return 0;

    // Exact match
    if (nq === nt) return 1;

    // Substring / startsWith bonus
    if (nt.startsWith(nq)) return 0.95;
    if (nt.includes(nq)) return 0.85;

    // Check if the query matches from the beginning with tolerance
    const minLen = Math.min(nq.length, nt.length);
    let prefixMatch = 0;
    for (let i = 0; i < minLen; i++) {
        if (nq[i] === nt[i]) prefixMatch++;
        else break;
    }
    const prefixScore = prefixMatch / Math.max(nq.length, nt.length);

    // Levenshtein-based similarity
    const dist = levenshtein(nq, nt);
    const maxLen = Math.max(nq.length, nt.length);
    const levScore = 1 - (dist / maxLen);

    // For short queries, also check if the original (un-normalized) text starts with query
    const originalLower = text.toLowerCase().trim();
    const queryLower = query.toLowerCase().trim();
    if (originalLower.startsWith(queryLower)) return 0.93;
    if (originalLower.includes(queryLower)) return 0.83;

    // Combine scores with prefix bonus
    return Math.max(levScore, prefixScore * 0.9);
};

/**
 * Fuzzy match: returns true if similarity is above the threshold.
 */
export const fuzzyMatch = (query, text, threshold = 0.5) => {
    return similarity(query, text) >= threshold;
};

/**
 * Filter and sort an array of objects using fuzzy matching on multiple keys.
 * 
 * @param {string} query - Search query
 * @param {Array} items - Array of objects to search
 * @param {string[]} keys - Object keys to search in
 * @param {number} [threshold=0.45] - Minimum similarity score
 * @returns {Array} Sorted by relevance (best match first)
 */
export const fuzzyFilter = (query, items, keys, threshold = 0.45) => {
    if (!query || !query.trim()) return items;
    if (!items || items.length === 0) return [];

    const q = query.trim();

    const scored = items
        .map((item) => {
            let bestScore = 0;
            for (const key of keys) {
                // Support nested keys like 'translated_name.name'
                const value = key.split('.').reduce((obj, k) => obj?.[k], item);
                if (value != null) {
                    const s = similarity(q, String(value));
                    if (s > bestScore) bestScore = s;
                }
            }
            return { item, score: bestScore };
        })
        .filter(({ score }) => score >= threshold)
        .sort((a, b) => b.score - a.score);

    return scored.map(({ item }) => item);
};

/**
 * Get a "did you mean" suggestion from a list.
 * Returns the best match if it's above minScore but the query doesn't exactly match.
 */
export const getSuggestion = (query, items, keys, minScore = 0.5) => {
    if (!query || !items) return null;
    const q = normalize(query);

    let bestItem = null;
    let bestScore = 0;
    let bestValue = '';

    for (const item of items) {
        for (const key of keys) {
            const value = key.split('.').reduce((obj, k) => obj?.[k], item);
            if (value == null) continue;
            const s = similarity(query, String(value));
            if (s > bestScore) {
                bestScore = s;
                bestItem = item;
                bestValue = String(value);
            }
        }
    }

    // Only suggest if it's a decent match but not exact
    if (bestScore >= minScore && bestScore < 0.95 && normalize(bestValue) !== q) {
        return { item: bestItem, value: bestValue, score: bestScore };
    }
    return null;
};
