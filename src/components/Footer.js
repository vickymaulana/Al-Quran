import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { FiGithub, FiMail, FiHeart } from 'react-icons/fi';

const Footer = () => {
  const { isDarkTheme } = useContext(ThemeContext);

  return (
    <footer className={`${isDarkTheme ? 'bg-slate-950 border-t border-white/5' : 'bg-white border-t border-slate-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
                <span className="text-white text-xs font-bold">☪</span>
              </div>
              <span className={`text-lg font-poppins font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                Al-Quran
              </span>
            </Link>
            <p className={`text-sm text-center sm:text-left ${isDarkTheme ? 'text-slate-500' : 'text-slate-500'}`}>
              Baca, dengarkan, dan pelajari Al-Quran dengan terjemahan dan tafsir Bahasa Indonesia.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Navigasi
            </h3>
            <div className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/surah', label: 'Daftar Surat' },
                { to: '/bookmarks', label: 'Bookmarks' },
                { to: '/tilawah', label: 'Tilawah' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block text-sm transition-colors ${isDarkTheme ? 'text-slate-500 hover:text-primary-400' : 'text-slate-500 hover:text-primary-600'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              Kontak
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:vickymaulanna@gmail.com"
                className={`flex items-center gap-2 text-sm transition-colors ${isDarkTheme ? 'text-slate-500 hover:text-primary-400' : 'text-slate-500 hover:text-primary-600'
                  }`}
              >
                <FiMail size={14} /> Email
              </a>
              <a
                href="https://github.com/vickymaulana"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-sm transition-colors ${isDarkTheme ? 'text-slate-500 hover:text-primary-400' : 'text-slate-500 hover:text-primary-600'
                  }`}
              >
                <FiGithub size={14} /> GitHub
              </a>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-6 border-t ${isDarkTheme ? 'border-white/5' : 'border-slate-100'} text-center`}>
          <p className={`text-xs ${isDarkTheme ? 'text-slate-600' : 'text-slate-400'}`}>
            © {new Date().getFullYear()} Al-Quran App. Dibuat dengan <FiHeart size={10} className="inline text-red-400 mx-0.5" /> menggunakan ReactJS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
