import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { FiNavigation, FiMapPin } from 'react-icons/fi';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const toRad = (deg) => deg * (Math.PI / 180);
const toDeg = (rad) => rad * (180 / Math.PI);

const calculateQibla = (lat, lng) => {
    const dLng = toRad(KAABA_LNG - lng);
    const lat1 = toRad(lat);
    const lat2 = toRad(KAABA_LAT);
    const x = Math.sin(dLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    let bearing = toDeg(Math.atan2(x, y));
    return (bearing + 360) % 360;
};

const QiblaCompass = () => {
    const { isDarkTheme } = useContext(ThemeContext);
    const [location, setLocation] = useState(null);
    const [heading, setHeading] = useState(null);
    const [qiblaAngle, setQiblaAngle] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) { setError('Geolocation tidak didukung.'); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocation({ lat: latitude, lng: longitude });
                setQiblaAngle(calculateQibla(latitude, longitude));
            },
            () => setError('Izinkan akses lokasi untuk menentukan arah kiblat.'),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    useEffect(() => {
        const handleOrientation = (event) => {
            let h = null;
            if (event.webkitCompassHeading !== undefined) h = event.webkitCompassHeading;
            else if (event.alpha !== null) h = (360 - event.alpha) % 360;
            if (h !== null) setHeading(h);
        };
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }
        return () => window.removeEventListener('deviceorientation', handleOrientation, true);
    }, []);

    const requestOrientationPermission = async () => {
        try {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                const perm = await DeviceOrientationEvent.requestPermission();
                if (perm === 'granted') {
                    window.addEventListener('deviceorientation', (event) => {
                        let h = event.webkitCompassHeading !== undefined ? event.webkitCompassHeading : (360 - event.alpha) % 360;
                        setHeading(h);
                    }, true);
                }
            }
        } catch (err) { console.error('Orientation permission error:', err); }
    };

    const needleRotation = qiblaAngle !== null && heading !== null ? qiblaAngle - heading : qiblaAngle || 0;

    return (
        <div className={`min-h-screen ${isDarkTheme ? 'bg-slate-950 text-white' : 'bg-surface-light text-slate-800'}`}>
            {/* Header */}
            <div className={`${isDarkTheme ? 'bg-hero-dark' : 'bg-hero-light'} islamic-pattern-bg`}>
                <div className="max-w-lg mx-auto px-4 pt-8 pb-14 text-center">
                    <span className="text-4xl mb-3 block">🕋</span>
                    <h1 className="text-3xl font-poppins font-bold text-white">Arah Kiblat</h1>
                </div>
                <svg viewBox="0 0 1440 40" fill="none" className="w-full h-6 md:h-10">
                    <path d="M0 40V20C360 0 720 0 1080 20C1260 30 1380 40 1440 40H0Z" fill={isDarkTheme ? '#020617' : '#f8fafc'} />
                </svg>
            </div>

            <div className="max-w-lg mx-auto px-4 -mt-2 pb-16 space-y-6">
                {error && (
                    <div className={`rounded-2xl p-5 text-center ${isDarkTheme ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
                        <FiMapPin className="text-2xl mx-auto mb-2" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Compass */}
                <div className={`rounded-3xl p-8 ${isDarkTheme ? 'bg-slate-900/50 border border-white/5' : 'bg-white border border-slate-100'} shadow-card`}>
                    <div className="relative w-64 h-64 mx-auto">
                        {/* Compass ring with gradient */}
                        <div className="absolute inset-0 rounded-full"
                            style={{
                                background: `conic-gradient(from 0deg, ${isDarkTheme ? '#0d9488, #d4a843, #0d9488' : '#14b8a6, #f59e0b, #14b8a6'})`,
                                padding: '3px',
                            }}
                        >
                            <div className={`w-full h-full rounded-full ${isDarkTheme ? 'bg-slate-900' : 'bg-white'} flex items-center justify-center`}>
                                {/* Inner ring */}
                                <div className={`w-[95%] h-[95%] rounded-full border-2 ${isDarkTheme ? 'border-slate-800' : 'border-slate-100'} relative`}>
                                    {/* Cardinal directions */}
                                    <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500">U</span>
                                    <span className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-bold ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>S</span>
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>B</span>
                                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>T</span>
                                </div>
                            </div>
                        </div>

                        {/* Qibla needle */}
                        <div className="compass-needle absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${needleRotation}deg)` }}>
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="absolute top-5">
                                    <FiNavigation className="text-primary-500 drop-shadow-lg" size={32} />
                                </div>
                                <div className="absolute top-1 left-1/2 -translate-x-1/2">
                                    <span className="text-xl drop-shadow-lg">🕋</span>
                                </div>
                            </div>
                        </div>

                        {/* Center dot */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-primary-500 to-primary-400 shadow-glow-teal" />
                    </div>

                    {/* Degree info */}
                    {qiblaAngle !== null && (
                        <div className="text-center mt-6">
                            <p className={`text-3xl font-poppins font-bold ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>{Math.round(qiblaAngle)}°</p>
                            <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>dari arah Utara</p>
                        </div>
                    )}

                    {heading === null && qiblaAngle !== null && (
                        <div className="text-center mt-4">
                            <p className="text-xs text-amber-500 mb-2">💡 Gunakan di perangkat mobile untuk kompas aktif</p>
                            <button onClick={requestOrientationPermission} className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium hover:shadow-glow-teal transition-shadow">
                                Aktifkan Kompas
                            </button>
                        </div>
                    )}
                </div>

                {/* Location info */}
                {location && (
                    <div className={`rounded-2xl p-5 text-center ${isDarkTheme ? 'bg-slate-900/50 border border-white/5' : 'bg-white border border-slate-100'} shadow-card`}>
                        <FiMapPin className="text-primary-500 mx-auto mb-2" size={18} />
                        <p className={`text-xs ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>Lokasi Anda</p>
                        <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                            {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QiblaCompass;
