# ☪️ Al-Quran React App v1.0.0

A modern, lightweight, and beautiful Quran reader web application built with **ReactJS**, **Tailwind CSS**, and **Framer Motion**. Designed to provide a serene and seamless experience for reading, listening, and studying the Holy Quran.

![Version](https://img.shields.io/badge/version-1.0.0-14b8a6?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/license-MIT-0d9488?style=for-the-badge)

## ✨ Features

- **📖 Read the Quran:** Full surah views with pagination (50 verses per page) for comfortable reading.
- **🎧 Audio Recitations:** Listen to verses using the built-in floating audio player with multiple Qari options (Mishary Rashid Alafasy, Abdul Baset, and more).
- **📚 Translations & Tafsir:** Indonesian translations for every verse, along with complete Tafsir Jalalayn.
- **🔍 Smart Search:** Search for verses or translations with a dedicated search interface and fallbacks.
- **🧭 Qibla Compass:** Built-in Qibla direction finder using device geolocation and orientation sensors.
- **📈 Tilawah Tracker:** Track your daily reading progress (ayat count and streaks) stored seamlessly.
- **🔖 Bookmarks & Notes:** Save your favorite verses, add personal notes, and export/import your bookmarks as a JSON file.
- **🌓 Adaptive Theme:** Beautiful light and dark modes with Islamic-inspired UI patterns and glassmorphism design.
- **⚙️ Customization:** Adjustable Arabic text size to fit your reading comfort.
- **📱 Responsive:** Fully optimized for mobile, tablet, and desktop screens with smooth animations.
- **💾 Offline Ready:** Saves your preferences, bookmarks, and last-read position in local storage.

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vickymaulana/Al-Quran.git
   cd Al-Quran
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🛠️ Tech Stack

- **Frontend:** React.js (v18)
- **Styling:** Tailwind CSS (v3), DaisyUI
- **Animations:** Framer Motion
- **Icons:** React Icons (Feather)
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **APIs Used:** 
  - [Quran.com API v4](https://quran.com/docs/api) (Surahs, Verses, Audio, Tafsir)
  - [QuranEnc API](https://quranenc.com/en/home) (Translations)

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI components (Navbar, Footer, Modal, etc.)
│   ├── apiService.js    # Centralized API logic and Axios instances
│   ├── AudioPlayer.js   # Global floating audio player
│   └── ...
├── hooks/               # Custom React hooks (useFetchData, useDebouncedValue)
├── utils/               # Helper utilities (storage, clipboard)
├── App.js               # Main application routing
├── ThemeContext.js      # Global state for Dark/Light mode
└── index.css            # Custom Tailwind and CSS overrides
```

## 👨‍💻 Developer

**Vicky Maulana**
- GitHub: [@vickymaulana](https://github.com/vickymaulana)
- Email: [vickymaulanna@gmail.com](mailto:vickymaulanna@gmail.com)

## 📄 License

This project is open-source and available under the [MIT License](LICENSE). Feel free to fork, modify, and improve it!

---
*Dibuat dengan ❤️ menggunakan ReactJS.*