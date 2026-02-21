import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { FiHome, FiBook, FiBookmark, FiBarChart2, FiCompass, FiSettings } from 'react-icons/fi';

const Navbar = () => {
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const onSearch = (term) => {
    if (term && term.trim()) {
      navigate(`/search?query=${encodeURIComponent(term.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const navItems = [
    { to: '/', label: 'Home', icon: <FiHome /> },
    { to: '/surah', label: 'Surat', icon: <FiBook /> },
    { to: '/bookmarks', label: 'Bookmark', icon: <FiBookmark /> },
    { to: '/tilawah', label: 'Tilawah', icon: <FiBarChart2 /> },
    { to: '/qibla', label: 'Kiblat', icon: <FiCompass /> },
    { to: '/settings', label: 'Setelan', icon: <FiSettings /> },
  ];

  return (
    <nav className={`${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'} shadow-lg sticky top-0 z-40`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3 md:py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className={`text-xl md:text-2xl font-bold font-inter ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
              Al-Quran App
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            <SearchBox onSearch={onSearch} />
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} label={item.label} active={isActive(item.to)} icon={item.icon} />
            ))}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ml-2 ${isDarkTheme ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition duration-300`}
              aria-label="Toggle theme"
            >
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileSearchOpen((s) => !s)}
              className={`p-2 rounded-md ${isDarkTheme ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
              aria-expanded={mobileSearchOpen}
              aria-label="Open search"
            >
              🔍
            </button>
            <button
              onClick={() => setMobileOpen((s) => !s)}
              className={`p-2 rounded-md ${isDarkTheme ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
              aria-expanded={mobileOpen}
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3">
          <MobileSearchBox onSearch={onSearch} />
        </div>
      )}

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col space-y-1">
            {navItems.map(item => (
              <MobileNavLink
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                active={isActive(item.to)}
                onClick={() => setMobileOpen(false)}
              />
            ))}
            <button
              onClick={() => { toggleTheme(); setMobileOpen(false); }}
              className={`flex items-center gap-3 text-left py-2 px-3 rounded-md ${isDarkTheme ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const SearchBox = ({ onSearch }) => {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    if (term.trim()) {
      onSearch ? onSearch(term) : navigate(`/search?query=${encodeURIComponent(term.trim())}`);
      setTerm('');
    }
  };

  return (
    <form onSubmit={onSubmit} className="hidden md:flex items-center mr-2">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Cari ayat atau kata..."
        className="px-3 py-2 rounded-l-md border w-56 focus:outline-none bg-white text-gray-900 placeholder-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-600"
        aria-label="Search"
      />
      <button type="submit" className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
        Cari
      </button>
    </form>
  );
};

const MobileSearchBox = ({ onSearch }) => {
  const [term, setTerm] = useState('');
  const handle = (e) => {
    e.preventDefault();
    if (term.trim()) onSearch(term);
  };
  return (
    <form onSubmit={handle} className="flex">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Cari ayat atau kata..."
        className="flex-1 px-3 py-2 rounded-l-md border focus:outline-none bg-white text-gray-900 placeholder-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-600"
        aria-label="Mobile search"
      />
      <button type="submit" className="px-3 py-2 bg-blue-500 text-white rounded-r-md">Cari</button>
    </form>
  );
};

const NavLink = ({ to, label, active, icon }) => {
  const { isDarkTheme } = useContext(ThemeContext);
  const activeClassName = 'flex items-center gap-1 py-2 px-3 text-blue-500 border-b-2 border-blue-500 font-medium text-sm';
  const inactiveClassName = `flex items-center gap-1 py-2 px-3 text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'} hover:text-blue-500 transition duration-200`;

  return (
    <Link to={to} className={active ? activeClassName : inactiveClassName}>
      {icon}
      {label}
    </Link>
  );
};

const MobileNavLink = ({ to, label, icon, active, onClick }) => {
  const { isDarkTheme } = useContext(ThemeContext);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 py-2 px-3 rounded-md ${active
          ? (isDarkTheme ? 'bg-gray-800 text-blue-400' : 'bg-blue-50 text-blue-600')
          : 'bg-transparent'
        }`}
    >
      {icon}
      {label}
    </Link>
  );
};

export default Navbar;
