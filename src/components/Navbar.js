import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';

const Navbar = () => {
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div>
            <Link to="/" className="text-2xl font-bold text-gray-800 dark:text-white">
              Al-Quran App
            </Link>
          </div>
          {/* Menu */}
          <div className="flex items-center space-x-4">
            <NavLink to="/" label="Home" active={isActive('/')} />
            <NavLink to="/surah" label="Surat" active={isActive('/surah')} />
            <NavLink to="/bookmarks" label="Bookmarks" active={isActive('/bookmarks')} />
            {/* Tombol Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
            >
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, label, active }) => {
  const activeClassName =
    'py-2 px-4 text-blue-500 border-b-2 border-blue-500 font-medium';
  const inactiveClassName =
    'py-2 px-4 text-gray-700 dark:text-gray-300 hover:text-blue-500 transition duration-200';

  return (
    <Link to={to} className={active ? activeClassName : inactiveClassName}>
      {label}
    </Link>
  );
};

export default Navbar;
