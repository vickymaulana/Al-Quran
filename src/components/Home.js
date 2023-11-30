import React, { useState, useEffect } from 'react';

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
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
      <div>
        <div className="text-xl font-medium text-black">Al-Quran Home</div>
        <p className="text-gray-500">Halaman Utama</p>
        <p className="text-gray-500">Tanggal Hari Ini: {formattedDate}</p>
        <p className="text-gray-500">Jam Sekarang: {formattedTime}</p>
      </div>
    </div>
  );
}

export default Home;