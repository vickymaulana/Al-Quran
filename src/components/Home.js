import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import { motion } from 'framer-motion';
import axios from 'axios';
import { fetchChapters } from './apiService';
import { getPrayerTimesByCoordinates } from './prayerTimeService';
import { hadiths, duas } from './dailyContent';
import { ThemeContext } from '../ThemeContext';
import { FiClock, FiBook, FiSunrise, FiCompass, FiStar } from 'react-icons/fi';

function Home() {
  const { isDarkTheme } = useContext(ThemeContext);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyVerse, setDailyVerse] = useState('');
  const [dailyHadith, setDailyHadith] = useState('');
  const [dailyDua, setDailyDua] = useState('');
  const [chapters, setChapters] = useState([]);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);

  const month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
  const year = currentTime.getFullYear();
  const currentDate = currentTime.toLocaleDateString('id-ID');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chaptersResponse = await fetchChapters();
        setChapters(chaptersResponse.data.chapters);

        const storedDate = localStorage.getItem('dailyContentDate');
        if (storedDate === currentDate) {
          setDailyVerse(localStorage.getItem('dailyVerse'));
          setDailyHadith(localStorage.getItem('dailyHadith'));
          setDailyDua(localStorage.getItem('dailyDua'));
        } else {
          const randomChapter =
            chaptersResponse.data.chapters[
              Math.floor(Math.random() * chaptersResponse.data.chapters.length)
            ];
          const randomVerseNumber =
            Math.floor(Math.random() * randomChapter.verses_count) + 1;
          const newDailyVerse = `Surat ${randomChapter.name_simple} Ayat ${randomVerseNumber}`;
          setDailyVerse(newDailyVerse);
          localStorage.setItem('dailyVerse', newDailyVerse);

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
              const { latitude, longitude } = position.coords;

              const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const userCity =
                response.data.address.city ||
                response.data.address.town ||
                response.data.address.village;
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

      if (prayerTimes) {
        setNextPrayer(calculateNextPrayer(prayerTimes));
      }
    };

    fetchData();
  }, [month, year, currentTime, currentDate]);

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTime = (time) => {
    return (
      time.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB'
    );
  };

  const { formattedDate, formattedTime } = {
    formattedDate: formatDate(currentTime),
    formattedTime: formatTime(currentTime),
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
          remaining: `${hoursLeft}h ${minutesLeft}m`,
        };
      }
    }
    return null;
  };

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-blue-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header dengan Gradient */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className={`inline-block rounded-2xl p-8 shadow-xl ${
            isDarkTheme 
              ? 'bg-gradient-to-br from-blue-800 to-purple-900'
              : 'bg-gradient-to-br from-blue-600 to-purple-600'
          }`}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-poppins">
              Quranic Journey
            </h1>
            <div className="text-white space-y-2">
              <p className="text-xl">{formatDate(currentTime)}</p>
              <div className="flex items-center justify-center gap-2 text-3xl font-medium">
                <FiClock className="inline-block" />
                {formatTime(currentTime)}
              </div>
              {city && <p className="text-lg mt-2">📍 {city}</p>}
            </div>
          </div>
        </motion.header>

        {/* Grid Konten Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Ayat Harian */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`col-span-1 lg:col-span-2 rounded-3xl p-8 ${
              isDarkTheme ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
            } shadow-xl`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${
                isDarkTheme ? 'bg-gray-700' : 'bg-blue-100'
              }`}>
                <FiBook className="text-3xl text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold">Ayat Pilihan Hari Ini</h2>
            </div>
            <p className={`text-2xl leading-relaxed mb-4 text-right font-amiri ${
              isDarkTheme ? 'text-white' : 'text-black'
            }`}>
              ﴾وَٱذۡكُر رَّبَّكَ فِی نَفۡسِكَ تَضَرُّعࣰا وَخِیفَةࣰ وَدُونَ ٱلۡجَهۡرِ مِنَ ٱلۡقَوۡلِ بِٱلۡغُدُوِّ وَٱلۡـَٔاصَالِ وَلَا تَكُن مِّنَ ٱلۡغَـٰفِلِینَ﴿
            </p>
            <p className={`text-lg ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
              "Dan sebutlah Tuhanmu dalam hatimu dengan merendahkan diri dan rasa takut, 
              dan dengan tidak mengeraskan suara, pada waktu pagi dan petang, 
              dan janganlah kamu termasuk orang-orang yang lalai."
            </p>
            <p className="mt-4 text-lg font-medium text-blue-500">
              Al-A'raf 7:205
            </p>
          </motion.div>

          {/* Waktu Shalat */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-3xl p-8 ${
              isDarkTheme ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
            } shadow-xl`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${
                isDarkTheme ? 'bg-gray-700' : 'bg-orange-100'
              }`}>
                <FiSunrise className="text-3xl text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold">Waktu Shalat</h2>
            </div>
            
            {error ? (
              <div className="text-red-400">{error}</div>
            ) : (
              <div className="space-y-4">
                {prayerTimes && Object.entries(prayerTimes).map(([name, time]) => (
                  <div key={name} className={`flex justify-between items-center p-4 rounded-xl ${
                    isDarkTheme ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'
                  }`}>
                    <span className="font-medium">{name}</span>
                    <span className="text-lg font-semibold">{time}</span>
                  </div>
                ))}
                {nextPrayer && (
                  <div className={`mt-6 p-4 rounded-xl ${
                    isDarkTheme ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
                  } text-center`}>
                    <p className="font-medium">Shalat berikutnya:</p>
                    <p className="text-xl font-bold">{nextPrayer.name} - {nextPrayer.time}</p>
                    <p className="text-sm">({nextPrayer.remaining} lagi)</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigasi Cepat */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <Link
            to="/surah"
            className={`p-6 rounded-2xl flex flex-col items-center transition-transform hover:scale-105 ${
              isDarkTheme ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-white hover:bg-blue-50 text-gray-900'
            }`}
          >
            <FiCompass className="text-4xl text-blue-500 mb-3" />
            <span className="text-lg font-medium">Daftar Surah</span>
          </Link>
          
          <Link
            to="/bookmarks"
            className={`p-6 rounded-2xl flex flex-col items-center transition-transform hover:scale-105 ${
              isDarkTheme ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-white hover:bg-blue-50 text-gray-900'
            }`}
          >
            <FiStar className="text-4xl text-amber-500 mb-3" />
            <span className="text-lg font-medium">Bookmarks</span>
          </Link>
          
          {/* Tambahkan lebih banyak tombol navigasi sesuai kebutuhan */}
        </motion.div>

        {/* Bagian Hadits dan Doa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`rounded-3xl p-8 ${
              isDarkTheme ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
            } shadow-xl`}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiStar className="text-amber-500" /> Hadits Hari Ini
            </h3>
            <p className="text-lg leading-relaxed">
              "Barangsiapa yang menempuh suatu jalan untuk mencari ilmu, 
              maka Allah akan memudahkan baginya jalan ke surga."
            </p>
            <p className="mt-4 text-gray-500">HR. Muslim</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`rounded-3xl p-8 ${
              isDarkTheme ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
            } shadow-xl`}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiStar className="text-green-500" /> Doa Harian
            </h3>
            <p className={`text-2xl leading-relaxed text-right font-amiri ${
              isDarkTheme ? 'text-white' : 'text-black'
            }`}>
              رَبِّ زِدْنِي عِلْمًا
            </p>
            <p className="text-lg mt-2">"Ya Rabb-ku, tambahkanlah ilmu kepadaku"</p>
            <p className="mt-4 text-gray-500">QS. Ta Ha 20:114</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Home;