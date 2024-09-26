import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import { motion } from 'framer-motion';
import axios from 'axios';
import { fetchChapters } from './apiService';
import { getPrayerTimesByCoordinates } from './prayerTimeService';
import { hadiths, duas } from './dailyContent';
import { ThemeContext } from '../ThemeContext';

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

  return (
    <div
      className={`min-h-screen py-8 ${
        isDarkTheme
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800'
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-4">Al-Quran Home</h1>
          <p className="text-xl mb-2">Halaman Utama</p>
          <p className="text-lg">{formattedDate}</p>
          <p className="text-lg">{formattedTime}</p>
        </header>

        {/* Konten Utama */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Konten Harian */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className={`rounded-lg shadow-md p-6 ${
                isDarkTheme ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4">Ayat Harian</h2>
              <p className="text-lg">{dailyVerse}</p>
            </div>
            <div
              className={`rounded-lg shadow-md p-6 ${
                isDarkTheme ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4">Hadits Harian</h2>
              <p className="text-lg">{dailyHadith}</p>
            </div>
            <div
              className={`rounded-lg shadow-md p-6 ${
                isDarkTheme ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4">Doa Harian</h2>
              <p className="text-lg">{dailyDua}</p>
            </div>
          </section>

          {/* Waktu Shalat */}
          <section className="mb-8">
            <div
              className={`rounded-lg shadow-md p-6 ${
                isDarkTheme ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4">Waktu Shalat di {city}</h2>
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                prayerTimes && (
                  <ul className="space-y-2 text-lg">
                    <li>
                      <span className="font-medium">Subuh:</span> {prayerTimes.Fajr}
                    </li>
                    <li>
                      <span className="font-medium">Dzuhur:</span> {prayerTimes.Dhuhr}
                    </li>
                    <li>
                      <span className="font-medium">Ashar:</span> {prayerTimes.Asr}
                    </li>
                    <li>
                      <span className="font-medium">Maghrib:</span> {prayerTimes.Maghrib}
                    </li>
                    <li>
                      <span className="font-medium">Isya:</span> {prayerTimes.Isha}
                    </li>
                  </ul>
                )
              )}
            </div>
          </section>

          {/* Tombol Navigasi */}
          <div className="flex justify-center space-x-6 mb-8">
            <Link
              to="/surah"
              className="px-8 py-3 rounded-lg bg-blue-600 text-white text-lg font-medium hover:bg-blue-500 transition duration-300"
            >
              Daftar Surat
            </Link>
            <Link
              to="/ayat/1"
              className="px-8 py-3 rounded-lg bg-green-600 text-white text-lg font-medium hover:bg-green-500 transition duration-300"
            >
              Mulai Membaca
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
