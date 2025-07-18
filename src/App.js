import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Surah from './components/Surah';
import Navbar from './components/Navbar';
import { ThemeProvider } from './ThemeContext';
import Ayat from './components/Ayat';
import Footer from './components/Footer';
import Bookmarks from './components/Bookmarks';


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/surah" element={<Surah />} />
          <Route path="/ayat/:chapter_number" element={<Ayat />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
        </Routes>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;