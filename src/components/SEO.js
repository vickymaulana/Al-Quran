import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Al-Quran Online';
const BASE_URL = 'https://mab.my.id';

/**
 * Reusable SEO component for per-page meta tags.
 *
 * @param {object} props
 * @param {string} props.title - Page title
 * @param {string} [props.description] - Meta description
 * @param {string} [props.path] - Current path (e.g. '/surah')
 * @param {string} [props.type] - OG type: 'website' | 'article'
 * @param {object} [props.jsonLd] - JSON-LD structured data object
 */
const SEO = ({
    title,
    description = 'Baca, dengarkan, dan pelajari Al-Quran dengan terjemahan dan tafsir Bahasa Indonesia. Lengkap dengan audio murottal, jadwal sholat, dan kompas kiblat.',
    path = '',
    type = 'website',
    jsonLd,
}) => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Baca & Pelajari Al-Quran`;
    const url = `${BASE_URL}${path}`;

    return (
        <Helmet>
            {/* Primary */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={`${BASE_URL}/logo512.png`} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="id_ID" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`${BASE_URL}/logo512.png`} />

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
