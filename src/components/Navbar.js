import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between bg-gray-800 py-4 px-6">
      <div className="flex items-center">
        <span className="text-white text-2xl font-bold">Al-Quran App</span>
      </div>
      <div className="flex items-center space-x-4">
        <NavLink to="/" label="Home" />
        <NavLink to="/surah" label="Surat" />
        {/* Add more NavLink components for additional pages */}
      </div>
    </nav>
  );
};

const NavLink = ({ to, label }) => {
  return (
    <Link
      to={to}
      className="text-gray-300 hover:text-white"
      activeClassName="text-white"
    >
      {label}
    </Link>
  );
};

export default Navbar;