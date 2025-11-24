import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';

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

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3 md:py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
              Al-Quran App
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <SearchBox onSearch={onSearch} />
            <NavLink to="/" label="Home" active={isActive('/')} />
            <NavLink to="/surah" label="Surat" active={isActive('/surah')} />
            <NavLink to="/bookmarks" label="Bookmarks" active={isActive('/bookmarks')} />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
              aria-label="Toggle theme"
            >
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileSearchOpen((s) => !s)}
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              aria-expanded={mobileSearchOpen}
              aria-label="Open search"
            >
              🔍
            </button>
            <button
              onClick={() => setMobileOpen((s) => !s)}
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
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
          <div className="flex flex-col space-y-2">
            <MobileNavLink to="/" label="Home" active={isActive('/')} onClick={() => setMobileOpen(false)} />
            <MobileNavLink to="/surah" label="Surat" active={isActive('/surah')} onClick={() => setMobileOpen(false)} />
            <MobileNavLink to="/bookmarks" label="Bookmarks" active={isActive('/bookmarks')} onClick={() => setMobileOpen(false)} />
            <button
              onClick={() => { toggleTheme(); setMobileOpen(false); }}
              className="text-left py-2 px-3 rounded-md bg-gray-100 dark:bg-gray-800"
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
    <form onSubmit={onSubmit} className="hidden md:flex items-center">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Cari ayat atau kata..."
        className="px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none w-56"
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
        className="flex-1 px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none"
        aria-label="Mobile search"
      />
      <button type="submit" className="px-3 py-2 bg-blue-500 text-white rounded-r-md">Cari</button>
    </form>
  );
};

const NavLink = ({ to, label, active }) => {
  const activeClassName = 'py-2 px-4 text-blue-500 border-b-2 border-blue-500 font-medium';
  const inactiveClassName = 'py-2 px-4 text-gray-700 dark:text-gray-300 hover:text-blue-500 transition duration-200';

  return (
    <Link to={to} className={active ? activeClassName : inactiveClassName}>
      {label}
    </Link>
  );
};

const MobileNavLink = ({ to, label, active, onClick }) => (
  <Link to={to} onClick={onClick} className={`py-2 px-3 rounded-md ${active ? 'bg-blue-50 dark:bg-gray-800' : 'bg-transparent'}`}>
    {label}
  </Link>
);

export default Navbar;
