import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import { motion } from 'framer-motion';
import axios from 'axios';
import { fetchChapters } from './apiService';
import { getPrayerTimesByCoordinates } from './prayerTimeService';
import { hadiths, duas } from './dailyContent';

function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyVerse, setDailyVerse] = useState('');
  const [dailyHadith, setDailyHadith] = useState('');
  const [dailyDua, setDailyDua] = useState('');
  const [chapters, setChapters] = useState([]);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [city, setCity] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
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
          const randomChapter = chaptersResponse.data.chapters[Math.floor(Math.random() * chaptersResponse.data.chapters.length)];
          const randomVerseNumber = Math.floor(Math.random() * randomChapter.verses_count) + 1;
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
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const userCity = response.data.address.city || response.data.address.town || response.data.address.village;
            setCity(userCity);

            const times = await getPrayerTimesByCoordinates(userCity, month, year);

            const todayTimes = times.find(time => new Date(time.tanggal).getDate() === currentTime.getDate());
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
          }, (error) => {
            console.error('Error fetching location:', error);
            setError('Tidak dapat mengambil lokasi. Pastikan GPS Anda aktif.');
          });
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
    return time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  };

  const { formattedDate, formattedTime } = {
    formattedDate: formatDate(currentTime),
    formattedTime: formatTime(currentTime),
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className={`flex items-center justify-center h-screen ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-cover bg-gradient-to-br from-green-400 to-blue-500 text-black'}`}>
      <div className="p-6 max-w-lg mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-xl font-medium">Al-Quran Home</div>
          <p>Halaman Utama</p>
          <p className="animate-pulse">Tanggal Hari Ini: {formattedDate}</p>
          <p className="animate-pulse">Jam Sekarang: {formattedTime}</p>
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Ayat Harian</h2>
            <p>{dailyVerse}</p>
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Hadits Harian</h2>
            <p>{dailyHadith}</p>
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Doa Harian</h2>
            <p>{dailyDua}</p>
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Waktu Shalat di {city}</h2>
            {error ? (
              <p>{error}</p>
            ) : (
              prayerTimes && (
                <>
                  <p>Subuh: {prayerTimes.Fajr}</p>
                  <p>Dzuhur: {prayerTimes.Dhuhr}</p>
                  <p>Ashar: {prayerTimes.Asr}</p>
                  <p>Maghrib: {prayerTimes.Maghrib}</p>
                  <p>Isya: {prayerTimes.Isha}</p>
                </>
              )
            )}
          </div>
          <div className="mt-4 flex space-x-2">
            <Link to="/surah" className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-400 transition duration-300">Daftar Surat</Link>
            <Link to="/ayat/1" className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-400 transition duration-300">Mulai Membaca</Link>
          </div>
          <div className="mt-4">
            <button onClick={toggleTheme} className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition duration-300">
              {isDarkTheme ? 'Mode Terang' : 'Mode Gelap'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
