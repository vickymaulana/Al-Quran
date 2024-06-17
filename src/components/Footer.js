const Footer = () => {
    return (
        <footer className="bg-gray-800 text-gray-400 py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center sm:items-start">
                        <a href="/" className="text-white text-xl font-bold mb-2">MAB</a>
                        <p className="text-gray-400">MAB adalah website untuk membaca Al Quran, dibuat menggunakan ReactJS</p>
                    </div>
                    <div className="flex flex-col items-center sm:items-start">
                        <h3 className="text-white text-lg font-semibold mb-2">Link:</h3>
                        <ul className="space-y-1">
                            <li><a href="/" className="hover:text-white transition-colors duration-200">Home</a></li>
                            <li><a href="/surah" className="hover:text-white transition-colors duration-200">Surat</a></li>
                            {/* Add more links as needed */}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <span className="text-gray-500">&copy; 2023 MAB. All rights reserved.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
