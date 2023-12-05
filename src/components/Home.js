import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';

function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentTime.toLocaleDateString('id-ID', options);
  const formattedTime = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

  return (
    <div className="flex items-center justify-center h-screen bg-cover">
      <div className="p-6 max-w-sm mx-auto bg-white bg-opacity-80 rounded-xl shadow-lg space-y-4">
        <div className="text-xl font-medium text-black">Al-Quran Home</div>
        <p className="text-gray-500">Halaman Utama</p>
        <p className="animate-pulse text-gray-500">Tanggal Hari Ini: {formattedDate}</p>
        <p className="animate-pulse text-gray-500">Jam Sekarang: {formattedTime}</p>
      </div>
    </div>
  );
}

export default Home;
