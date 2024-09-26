import React, { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

const Footer = () => {
  const { isDarkTheme } = useContext(ThemeContext);

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Kolom Pertama */}
          <div className="flex flex-col items-center sm:items-start">
            <a href="/" className="text-gray-800 dark:text-white text-2xl font-bold mb-2">
              MAB
            </a>
            <p className="text-center sm:text-left">
              MAB adalah website untuk membaca Al Quran, dibuat menggunakan ReactJS
            </p>
          </div>
          {/* Kolom Kedua */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-2">Link:</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="/"
                  className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/surah"
                  className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Surat
                </a>
              </li>
            </ul>
          </div>
          {/* Kolom Ketiga */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="text-gray-800 dark:text-white text-lg font-semibold mb-2">
              Kontak Kami
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="mailto:vickymaulanna@gmail.com"
                  className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/vickymaulana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <span className="text-sm">&copy; 2023 MAB. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
