# Al-Quran ReactJS App

This project, named Al-Quran ReactJS, is a modern web application developed using ReactJS and styled with Tailwind CSS. The application integrates with a RESTful API to provide a seamless experience for users.
**Al-Quran — React**

- **Developer:** Vicky Maulana

**Overview:**
- Lightweight Quran reader built with React, Tailwind CSS, Framer Motion and Axios.
- Uses public Quran APIs to fetch surah/verse text and Indonesian translations.

**Features:**
- View full surah and paginate verses (50 verses per page).
- Copy verse link (updates URL hash) and share.
- Bookmark verses (saved to `localStorage`).
- Search (uses API with fallback search if needed).
- Dark/light theme support.

**Quick Start**
- Clone the repo and install dependencies:

```powershell
git clone <repo-url>
cd Al-Quran
npm install
```

- Run the app in development mode:

```powershell
npm start
```

Open `http://localhost:3000`.

**Scripts**
- `npm start` — Run dev server (uses `craco`).
- `npm run build` — Create production build (output in `build/`).
- `npm test` — Run tests.

**Notable Implementation Details**
- Centralized API helpers in `src/components/apiService.js` (axios instances, timeouts, cancellation support).
- Data hook `src/components/useFetchData.js` provides `{ data, translations, surahName, loading, error, refetch }` and uses `AbortController`.
- Bookmarks persist in `localStorage` under the `bookmarkedVerses` key.

**Development Notes & Recommendations**
- The project uses Tailwind v2 compatibility build in `package.json`. Consider upgrading the Tailwind/PostCSS toolchain for newer features.
- The app intentionally fetches translations from a separate provider; network errors are handled gracefully with user-facing loading/error states.

**Contributing**
- Make a branch, open a PR, describe changes. Keep changes focused and add tests if relevant.

**License**
- This project does not include a license file. Add one if you intend to publish.

If you want, I can continue by modernizing other components (`Home.js`, `Surah.js`, search, bookmarks page), add ESLint/Prettier configs, or migrate the project to TypeScript.