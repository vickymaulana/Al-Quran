import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiBook, FiBookmark, FiBarChart2, FiCompass, FiSettings, FiSearch, FiSun, FiMoon, FiX, FiMenu } from 'react-icons/fi';

const Navbar = () => {
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const onSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchOpen(false);
    }
  };

  const navItems = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/surah', label: 'Surat', icon: FiBook },
    { to: '/bookmarks', label: 'Bookmark', icon: FiBookmark },
    { to: '/tilawah', label: 'Tilawah', icon: FiBarChart2 },
    { to: '/qibla', label: 'Kiblat', icon: FiCompass },
    { to: '/settings', label: 'Setelan', icon: FiSettings },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${scrolled
          ? `${isDarkTheme ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-xl shadow-lg`
          : `${isDarkTheme ? 'bg-slate-900/60' : 'bg-white/60'} backdrop-blur-md`
          } border-b ${isDarkTheme ? 'border-white/5' : 'border-black/5'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow-teal group-hover:shadow-glow-teal-lg transition-shadow duration-300">
                <span className="text-white font-bold text-sm">☪</span>
              </div>
              <span className={`text-lg font-poppins font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                Al-Quran
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                      ? 'text-primary-600 dark:text-primary-400'
                      : `${isDarkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`
                      }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-xl bg-primary-500/10 dark:bg-primary-400/10 -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Search */}
              <AnimatePresence>
                {searchOpen ? (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={onSearch}
                    className="flex items-center overflow-hidden"
                  >
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari ayat..."
                      autoFocus
                      className={`w-full px-3 py-2 rounded-xl text-sm outline-none ${isDarkTheme
                        ? 'bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:border-primary-500'
                        : 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-primary-500'
                        } transition-colors`}
                    />
                  </motion.form>
                ) : null}
              </AnimatePresence>
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className={`p-2.5 rounded-xl transition-all duration-200 ${isDarkTheme ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                  }`}
                aria-label="Search"
              >
                {searchOpen ? <FiX size={18} /> : <FiSearch size={18} />}
              </button>

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-200 ${isDarkTheme ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                whileTap={{ scale: 0.9, rotate: 180 }}
                transition={{ duration: 0.3 }}
                aria-label="Toggle theme"
              >
                {isDarkTheme ? <FiSun size={18} /> : <FiMoon size={18} />}
              </motion.button>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => { setSearchOpen((s) => !s); setMobileOpen(false); }}
                className={`p-2.5 rounded-xl ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>
              <button
                onClick={() => { setMobileOpen((s) => !s); setSearchOpen(false); }}
                className={`p-2.5 rounded-xl ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}
                aria-label="Menu"
              >
                {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`md:hidden overflow-hidden border-t ${isDarkTheme ? 'border-white/5' : 'border-slate-200'}`}
            >
              <form onSubmit={onSearch} className="px-4 py-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari ayat atau kata..."
                    autoFocus
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none ${isDarkTheme
                      ? 'bg-slate-800 text-white placeholder-slate-500 border border-slate-700'
                      : 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200'
                      }`}
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay + Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden ${isDarkTheme ? 'bg-slate-900' : 'bg-white'
                } shadow-2xl overflow-auto`}
            >
              {/* Drawer Header */}
              <div className={`flex items-center justify-between p-5 border-b ${isDarkTheme ? 'border-white/5' : 'border-slate-200'}`}>
                <span className={`font-poppins font-bold text-lg ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                  Menu
                </span>
                <button onClick={() => setMobileOpen(false)} className={`p-2 rounded-xl ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                  <FiX size={20} />
                </button>
              </div>

              {/* Nav Items */}
              <div className="p-4 space-y-1">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                          ? `${isDarkTheme ? 'bg-primary-900/40 text-primary-400' : 'bg-primary-50 text-primary-700'}`
                          : `${isDarkTheme ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`
                          }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Theme Toggle */}
              <div className={`p-4 border-t ${isDarkTheme ? 'border-white/5' : 'border-slate-200'}`}>
                <button
                  onClick={() => { toggleTheme(); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isDarkTheme ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {isDarkTheme ? <FiSun size={20} /> : <FiMoon size={20} />}
                  <span className="font-medium">{isDarkTheme ? 'Mode Terang' : 'Mode Gelap'}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
