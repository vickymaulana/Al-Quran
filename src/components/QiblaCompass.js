import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { FiNavigation, FiMapPin } from 'react-icons/fi';

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const toRad = (deg) => deg * (Math.PI / 180);
const toDeg = (rad) => rad * (180 / Math.PI);

// Calculate the bearing from point A to the Kaaba
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

    // Get user location
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation tidak didukung oleh browser Anda');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocation({ lat: latitude, lng: longitude });
                const angle = calculateQibla(latitude, longitude);
                setQiblaAngle(angle);
            },
            (err) => {
                setError('Izinkan akses lokasi untuk menentukan arah kiblat.');
                console.error('Geolocation error:', err);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // Get device compass heading
    useEffect(() => {
        const handleOrientation = (event) => {
            let h = null;
            if (event.webkitCompassHeading !== undefined) {
                // iOS Safari
                h = event.webkitCompassHeading;
            } else if (event.alpha !== null) {
                // Android / standard
                h = (360 - event.alpha) % 360;
            }
            if (h !== null) setHeading(h);
        };

        // Try requesting permission (required on iOS 13+)
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // We'll request on user interaction
        } else {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, []);

    const requestOrientationPermission = async () => {
        try {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                const perm = await DeviceOrientationEvent.requestPermission();
                if (perm === 'granted') {
                    window.addEventListener('deviceorientation', (event) => {
                        let h = event.webkitCompassHeading !== undefined
                            ? event.webkitCompassHeading
                            : (360 - event.alpha) % 360;
                        setHeading(h);
                    }, true);
                }
            }
        } catch (err) {
            console.error('Orientation permission error:', err);
        }
    };

    // Calculate rotation for the compass needle
    const needleRotation = qiblaAngle !== null && heading !== null
        ? qiblaAngle - heading
        : qiblaAngle || 0;

    return (
        <div className={`min-h-screen py-8 ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-blue-50 text-gray-900'}`}>
            <div className="max-w-lg mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-center">🕋 Arah Kiblat</h1>

                {error && (
                    <div className={`rounded-2xl p-6 mb-8 text-center ${isDarkTheme ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'}`}>
                        <FiMapPin className="text-3xl mx-auto mb-2" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Compass */}
                <div className={`rounded-3xl p-8 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-xl mb-8`}>
                    <div className="relative w-64 h-64 mx-auto">
                        {/* Compass ring */}
                        <div className={`absolute inset-0 rounded-full border-4 ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'
                            }`}>
                            {/* Cardinal directions */}
                            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-bold text-red-500">U</span>
                            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-bold">S</span>
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold">B</span>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold">T</span>
                        </div>

                        {/* Qibla needle */}
                        <div
                            className="compass-needle absolute inset-0 flex items-center justify-center"
                            style={{ transform: `rotate(${needleRotation}deg)` }}
                        >
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Arrow pointing up (towards Qibla) */}
                                <div className="absolute top-4">
                                    <FiNavigation
                                        className="text-green-500"
                                        size={36}
                                        style={{ transform: 'rotate(0deg)' }}
                                    />
                                </div>
                                {/* Kaaba icon at the tip */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                                    <span className="text-xl">🕋</span>
                                </div>
                            </div>
                        </div>

                        {/* Center dot */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500" />
                    </div>

                    {/* Degree info */}
                    {qiblaAngle !== null && (
                        <div className="text-center mt-6">
                            <p className="text-2xl font-bold">{Math.round(qiblaAngle)}°</p>
                            <p className="text-sm text-gray-400 mt-1">dari arah Utara</p>
                        </div>
                    )}

                    {heading === null && qiblaAngle !== null && (
                        <div className="text-center mt-4">
                            <p className="text-sm text-yellow-500">
                                💡 Gunakan di perangkat mobile untuk kompas aktif
                            </p>
                            <button
                                onClick={requestOrientationPermission}
                                className="mt-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition"
                            >
                                Aktifkan Kompas
                            </button>
                        </div>
                    )}
                </div>

                {/* Location info */}
                {location && (
                    <div className={`rounded-2xl p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                        <FiMapPin className="text-xl text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Lokasi Anda</p>
                        <p className="text-sm">
                            {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QiblaCompass;
