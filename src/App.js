import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Surah from './components/Surah';
import Navbar from './components/Navbar';
import { ThemeProvider } from './ThemeContext';
import Ayat from './components/Ayat';
import Footer from './components/Footer';
import Bookmarks from './components/Bookmarks';
import SearchResults from './components/SearchResults';
import TilawahTracker from './components/TilawahTracker';
import QiblaCompass from './components/QiblaCompass';
import SettingsPage from './components/SettingsPage';
import UpdateBanner from './components/UpdateBanner';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <UpdateBanner />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/surah" element={<Surah />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/ayat/:chapter_number" element={<Ayat />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/tilawah" element={<TilawahTracker />} />
          <Route path="/qibla" element={<QiblaCompass />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;