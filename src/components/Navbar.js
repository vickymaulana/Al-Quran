import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="flex items-center justify-between bg-gray-900 py-4 px-6 shadow-lg">
      <div className="flex items-center">
        <span className="text-white text-2xl font-bold">Al-Quran App</span>
      </div>
      <div className="flex items-center space-x-6">
        <NavLink to="/" label="Home" active={isActive('/')} />
        <NavLink to="/surah" label="Surat" active={isActive('/surah')} />
        {/* Add more NavLink components for additional pages */}
      </div>
    </nav>
  );
};

const NavLink = ({ to, label, active }) => {
  const activeClassName = "text-blue-500 border-b-2 border-blue-500";
  const inactiveClassName = "text-gray-300 hover:text-white transition-colors duration-200";

  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${active ? activeClassName : inactiveClassName}`}
    >
      {label}
    </Link>
  );
};

export default Navbar;
