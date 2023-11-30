import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-gray-800 py-4 px-6">
      <div className="flex items-center">
        <span className="text-white text-2xl font-bold">Al-Quran App</span>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-gray-300 hover:text-white">
          Home
        </Link>
        <Link to="/surah" className="text-gray-300 hover:text-white">
          Surat
        </Link>
        {/* Add more Link components for additional pages */}
      </div>
    </nav>
  );
}

export default Navbar;