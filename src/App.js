import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Surah from './components/Surah';
import Navbar from './components/Navbar';
import Ayat from './components/Ayat';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/surah" element={<Surah />} />
        <Route path="/ayat/:chapter_number" element={<Ayat />} />
        {/* Add more Route components for additional pages */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;