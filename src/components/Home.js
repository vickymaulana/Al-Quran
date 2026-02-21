import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { fetchChapters, fetchVerses, fetchTranslations } from './apiService';
import { getPrayerTimesByCoordinates } from './prayerTimeService';
import { hadiths, duas } from './dailyContent';
import { ThemeContext } from '../ThemeContext';
import {
  FiClock, FiBook, FiSunrise, FiCompass, FiStar, FiBarChart2,
  FiSettings, FiBookmark, FiSearch, FiArrowRight, FiRefreshCw, FiMapPin
} from 'react-icons/fi';
import { getJSON, subscribeToStorageKey } from '../utils/storage';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function Home() {
  const { isDarkTheme } = useContext(ThemeContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyVerse, setDailyVerse] = useState(null);
  const [dailyVerseText, setDailyVerseText] = useState('');
  const [dailyVerseTranslation, setDailyVerseTranslation] = useState('');
  const [dailyHadith, setDailyHadith] = useState('');
  const [dailyDua, setDailyDua] = useState('');
  const [chapters, setChapters] = useState([]);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [lastRead, setLastRead] = useState(() => getJSON('lastRead', null));

  const month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
  const year = currentTime.getFullYear();
  const currentDate = currentTime.toLocaleDateString('id-ID');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = subscribeToStorageKey('lastRead', (newValue) => {
      try { setLastRead(newValue ? JSON.parse(newValue) : null); } catch (e) { }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chaptersResponse = await fetchChapters();
        setChapters(chaptersResponse.data.chapters);

        const storedDate = localStorage.getItem('dailyContentDate');
        if (storedDate === currentDate) {
          setDailyVerse(JSON.parse(localStorage.getItem('dailyVerse')));
          setDailyHadith(localStorage.getItem('dailyHadith'));
          setDailyDua(localStorage.getItem('dailyDua'));
          setDailyVerseText(localStorage.getItem('dailyVerseText') || '');
          setDailyVerseTranslation(localStorage.getItem('dailyVerseTranslation') || '');
        } else {
          const randomChapter = chaptersResponse.data.chapters[
            Math.floor(Math.random() * chaptersResponse.data.chapters.length)
          ];
          const randomVerseNumber = Math.floor(Math.random() * randomChapter.verses_count) + 1;
          const newDailyVerse = {
            chapterName: randomChapter.name_simple,
            chapterId: randomChapter.id,
            verseNumber: randomVerseNumber,
            text: `Surat ${randomChapter.name_simple} Ayat ${randomVerseNumber}`
          };
          setDailyVerse(newDailyVerse);
          localStorage.setItem('dailyVerse', JSON.stringify(newDailyVerse));

          const randomHadith = hadiths[Math.floor(Math.random() * hadiths.length)];
          setDailyHadith(randomHadith);
          localStorage.setItem('dailyHadith', randomHadith);

          const randomDua = duas[Math.floor(Math.random() * duas.length)];
          setDailyDua(randomDua);
          localStorage.setItem('dailyDua', randomDua);

          localStorage.setItem('dailyContentDate', currentDate);
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                const response = await axios.get(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const userCity =
                  response?.data?.address?.city ||
                  response?.data?.address?.town ||
                  response?.data?.address?.village || '';
                setCity(userCity);

                const times = await getPrayerTimesByCoordinates(userCity, month, year);
                const todayTimes = times.find(
                  (time) => new Date(time.tanggal).getDate() === currentTime.getDate()
                );
                if (todayTimes) {
                  setPrayerTimes({
                    Fajr: todayTimes.shubuh,
                    Dhuhr: todayTimes.dzuhur,
                    Asr: todayTimes.ashr,
                    Maghrib: todayTimes.magrib,
                    Isha: todayTimes.isya,
                  });
                } else {
                  setError('Waktu sholat tidak ditemukan untuk tanggal ini.');
                }
              } catch (err) {
                console.error('Error during geolocation network requests:', err);
                setError('Tidak dapat mengambil data lokasi atau waktu sholat.');
              }
            },
            (error) => {
              console.error('Error fetching location:', error);
              setError('Tidak dapat mengambil lokasi. Pastikan GPS Anda aktif.');
            }
          );
        } else {
          setError('Geolocation tidak didukung oleh browser ini.');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Terjadi kesalahan saat mengambil data.');
      }
    };

    fetchData();
  }, [month, year, currentTime, currentDate]);

  useEffect(() => {
    const fetchVerseText = async () => {
      if (!dailyVerse) return;
      try {
        const versesResponse = await fetchVerses(dailyVerse.chapterId);
        const verse = versesResponse.data.verses.find(v => v.verse_number === dailyVerse.verseNumber);
        if (verse) {
          setDailyVerseText(verse.text_uthmani);
          localStorage.setItem('dailyVerseText', verse.text_uthmani);
        }

        const translationsResponse = await fetchTranslations(dailyVerse.chapterId);
        const trArr = translationsResponse?.data?.result || translationsResponse?.data || translationsResponse || [];

        const getTranslationText = (arr, verseNumber) => {
          if (!arr) return null;
          if (!Array.isArray(arr) && typeof arr === 'object') arr = Object.values(arr);
          const idx = Number(verseNumber) - 1;
          if (Array.isArray(arr) && arr.length > 0) {
            if (arr[idx]) return arr[idx].translation || arr[idx].text || arr[idx].translation_text || arr[idx].result || null;
            const found = arr.find((t) => String(t.verse_number) === String(verseNumber) || String(t.verse) === String(verseNumber) || String(t.verse_num) === String(verseNumber));
            if (found) return found.translation || found.text || found.translation_text || null;
          }
          return null;
        };

        const trText = getTranslationText(trArr, dailyVerse.verseNumber);
        if (trText) {
          setDailyVerseTranslation(trText);
          localStorage.setItem('dailyVerseTranslation', trText);
        }
      } catch (err) {
        console.error('Error fetching verse text:', err);
      }
    };
    fetchVerseText();
  }, [dailyVerse]);

  useEffect(() => {
    if (!prayerTimes) return;
    const calcNext = () => setNextPrayer(calculateNextPrayer(prayerTimes));
    calcNext();
    const interval = setInterval(calcNext, 30000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB';
  };

  const calculateNextPrayer = (times) => {
    const now = new Date();
    const prayers = [
      { name: 'Subuh', time: times.Fajr },
      { name: 'Dzuhur', time: times.Dhuhr },
      { name: 'Ashar', time: times.Asr },
      { name: 'Maghrib', time: times.Maghrib },
      { name: 'Isya', time: times.Isha },
    ];

    for (let prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = new Date(now);
      prayerTime.setHours(hours, minutes, 0, 0);

      if (prayerTime > now) {
        const timeDiff = prayerTime - now;
        const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        return {
          name: prayer.name,
          time: prayer.time,
          remaining: `${hoursLeft}j ${minutesLeft}m`,
        };
      }
    }
    return null;
  };

  const refreshVerse = () => {
    if (!chapters.length) return;
    const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
    const randomVerseNumber = Math.floor(Math.random() * randomChapter.verses_count) + 1;
    const newDailyVerse = {
      chapterName: randomChapter.name_simple,
      chapterId: randomChapter.id,
      verseNumber: randomVerseNumber,
      text: `Surat ${randomChapter.name_simple} Ayat ${randomVerseNumber}`
    };
    setDailyVerse(newDailyVerse);
    localStorage.setItem('dailyVerse', JSON.stringify(newDailyVerse));
  };

  const prayerNames = { Fajr: 'Subuh', Dhuhr: 'Dzuhur', Asr: 'Ashar', Maghrib: 'Maghrib', Isha: 'Isya' };
  const prayerIcons = { Fajr: '🌅', Dhuhr: '☀️', Asr: '🌤️', Maghrib: '🌇', Isha: '🌙' };

  const quickLinks = [
    { to: '/surah', label: 'Daftar Surah', icon: FiBook, color: 'from-primary-500 to-primary-600' },
    { to: '/bookmarks', label: 'Bookmark', icon: FiBookmark, color: 'from-amber-500 to-amber-600' },
    { to: '/tilawah', label: 'Tilawah', icon: FiBarChart2, color: 'from-emerald-500 to-emerald-600' },
    { to: '/qibla', label: 'Arah Kiblat', icon: FiCompass, color: 'from-cyan-500 to-cyan-600' },
    { to: '/settings', label: 'Pengaturan', icon: FiSettings, color: 'from-slate-500 to-slate-600' },
    { to: '/search', label: 'Pencarian', icon: FiSearch, color: 'from-violet-500 to-violet-600' },
  ];

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-slate-950' : 'bg-surface-light'}`}>

      {/* ===== HERO SECTION ===== */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className={`relative overflow-hidden ${isDarkTheme ? 'bg-hero-dark' : 'bg-hero-light'} islamic-pattern-bg`}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center text-white">
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="text-4xl md:text-6xl font-poppins font-extrabold mb-4 drop-shadow-lg"
            >
              Quranic Journey
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="text-lg md:text-xl text-white/80 mb-3">
              {formatDate(currentTime)}
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="inline-flex items-center gap-3 text-3xl md:text-4xl font-poppins font-bold tabular-nums"
            >
              <FiClock className="text-white/70" />
              <span>{formatTime(currentTime)}</span>
            </motion.div>
            {city && (
              <motion.p variants={fadeUp} custom={3} className="mt-3 flex items-center justify-center gap-1.5 text-white/70">
                <FiMapPin size={14} /> {city}
              </motion.p>
            )}
          </div>
        </div>
        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-8 md:h-12">
            <path
              d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z"
              fill={isDarkTheme ? '#020617' : '#f8fafc'}
            />
          </svg>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-16 space-y-8">

        {/* ===== CONTINUE READING ===== */}
        {lastRead && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to={`/ayat/${lastRead.chapterNumber}#verse-${lastRead.verseNumber}`}
              className={`group glass-card flex items-center justify-between p-5 rounded-2xl ${isDarkTheme ? 'shadow-card-dark' : 'shadow-card'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkTheme ? 'bg-primary-900/40' : 'bg-primary-50'
                  }`}>
                  <FiBook className="text-primary-500 text-xl" />
                </div>
                <div>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                    Lanjutkan Membaca
                  </p>
                  <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                    {lastRead.surahName} <span className="text-primary-500">•</span> Ayat {lastRead.verseNumber}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary-500 group-hover:translate-x-1 transition-transform">
                <span className="text-sm font-medium hidden sm:block">Lanjutkan</span>
                <FiArrowRight size={18} />
              </div>
            </Link>
          </motion.div>
        )}

        {/* ===== MAIN CONTENT GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* -- Daily Verse Card -- */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`lg:col-span-2 glass-card rounded-3xl overflow-hidden ${isDarkTheme ? 'shadow-card-dark' : 'shadow-card'
              }`}
          >
            {/* Gold accent top bar */}
            <div className="h-1 bg-gold-gradient" />
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isDarkTheme ? 'bg-gold-500/10' : 'bg-amber-50'}`}>
                    <FiBook className="text-2xl text-gold-500" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-poppins font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                      Ayat Pilihan Hari Ini
                    </h2>
                    <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                      Renungkan dan amalkan
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ rotate: 180 }}
                  onClick={refreshVerse}
                  className={`p-2.5 rounded-xl transition-colors ${isDarkTheme ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  title="Refresh ayat"
                >
                  <FiRefreshCw size={18} />
                </motion.button>
              </div>

              {/* Arabic text */}
              <div dir="rtl" lang="ar" className="mb-5">
                <p className={`text-2xl md:text-3xl leading-[2.4] text-right font-amiri ${isDarkTheme ? 'text-white' : 'text-slate-800'
                  }`}>
                  {dailyVerseText || (dailyVerse ? dailyVerse.text : 'Memuat ayat...')}
                </p>
              </div>

              {/* Translation */}
              <p className={`text-base leading-relaxed ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                {dailyVerseTranslation || '"Dan sebutlah Tuhanmu dalam hatimu dengan merendahkan diri dan rasa takut, dan dengan tidak mengeraskan suara, pada waktu pagi dan petang, dan janganlah kamu termasuk orang-orang yang lalai."'}
              </p>

              {/* Source & Link */}
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-medium text-primary-500">
                  {dailyVerse ? `${dailyVerse.chapterName} ${dailyVerse.verseNumber}` : "Al-A'raf 7:205"}
                </span>
                {dailyVerse && (
                  <Link
                    to={`/ayat/${dailyVerse.chapterId}#verse-${dailyVerse.verseNumber}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium hover:shadow-glow-teal transition-shadow"
                  >
                    Baca Ayat <FiArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>

          {/* -- Prayer Times Card -- */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className={`glass-card rounded-3xl overflow-hidden ${isDarkTheme ? 'shadow-card-dark' : 'shadow-card'}`}
          >
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 rounded-xl ${isDarkTheme ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                  <FiSunrise className="text-2xl text-orange-500" />
                </div>
                <h2 className={`text-xl font-poppins font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                  Waktu Shalat
                </h2>
              </div>

              {error ? (
                <div className={`text-sm p-3 rounded-xl text-center ${isDarkTheme ? 'text-red-400 bg-red-500/10' : 'text-red-500 bg-red-50'}`}>
                  {error}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {prayerTimes && Object.entries(prayerTimes).map(([name, time]) => {
                    const isNext = nextPrayer && prayerNames[name] === nextPrayer.name;
                    return (
                      <div
                        key={name}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isNext
                          ? `${isDarkTheme ? 'bg-primary-900/30 ring-1 ring-primary-500/30' : 'bg-primary-50 ring-1 ring-primary-200'}`
                          : `${isDarkTheme ? 'bg-slate-800/50' : 'bg-slate-50'}`
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{prayerIcons[name]}</span>
                          <span className={`text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                            {prayerNames[name]}
                          </span>
                        </span>
                        <span className={`text-sm font-semibold tabular-nums ${isNext ? 'text-primary-500' : isDarkTheme ? 'text-white' : 'text-slate-800'
                          }`}>
                          {time}
                        </span>
                      </div>
                    );
                  })}

                  {nextPrayer && (
                    <div className={`mt-3 p-3 rounded-xl text-center ${isDarkTheme ? 'bg-primary-900/20 border border-primary-500/20' : 'bg-primary-50 border border-primary-100'
                      }`}>
                      <p className="text-xs text-primary-500 font-medium uppercase tracking-wider">Shalat berikutnya</p>
                      <p className={`text-lg font-poppins font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                        {nextPrayer.name} — {nextPrayer.time}
                      </p>
                      <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                        {nextPrayer.remaining} lagi
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ===== QUICK NAVIGATION ===== */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4"
        >
          {quickLinks.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.to} variants={fadeUp} custom={i}>
                <Link
                  to={item.to}
                  className={`group flex flex-col items-center gap-2.5 p-5 rounded-2xl transition-all duration-300 ${isDarkTheme
                    ? 'bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-white/10'
                    : 'bg-white hover:shadow-card-hover border border-slate-100'
                    }`}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <span className={`text-xs font-medium text-center ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ===== HADITH & DUA ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hadith Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`glass-card rounded-3xl overflow-hidden ${isDarkTheme ? 'shadow-card-dark' : 'shadow-card'}`}
          >
            <div className="h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-poppins font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                  <FiStar className="text-amber-500" /> Hadits Hari Ini
                </h3>
                <motion.button
                  whileTap={{ rotate: 180 }}
                  onClick={() => {
                    const r = hadiths[Math.floor(Math.random() * hadiths.length)];
                    setDailyHadith(r);
                    localStorage.setItem('dailyHadith', r);
                  }}
                  className={`p-2 rounded-xl transition-colors ${isDarkTheme ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                >
                  <FiRefreshCw size={16} />
                </motion.button>
              </div>
              <p className={`text-base leading-relaxed ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                {dailyHadith || 'Memuat hadits...'}
              </p>
              <p className={`mt-4 text-xs font-medium uppercase tracking-wider ${isDarkTheme ? 'text-slate-600' : 'text-slate-400'}`}>
                HR. Muslim
              </p>
            </div>
          </motion.div>

          {/* Dua Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className={`glass-card rounded-3xl overflow-hidden ${isDarkTheme ? 'shadow-card-dark' : 'shadow-card'}`}
          >
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-poppins font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                  <FiStar className="text-emerald-500" /> Doa Harian
                </h3>
                <motion.button
                  whileTap={{ rotate: 180 }}
                  onClick={() => {
                    const r = duas[Math.floor(Math.random() * duas.length)];
                    setDailyDua(r);
                    localStorage.setItem('dailyDua', r);
                  }}
                  className={`p-2 rounded-xl transition-colors ${isDarkTheme ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                >
                  <FiRefreshCw size={16} />
                </motion.button>
              </div>
              <p className={`text-base leading-relaxed ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                {dailyDua || 'Memuat doa...'}
              </p>
              <p className={`mt-4 text-xs font-medium uppercase tracking-wider ${isDarkTheme ? 'text-slate-600' : 'text-slate-400'}`}>
                QS. Ta Ha 20:114
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Home;