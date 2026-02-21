import React, { useState, useContext, useMemo } from 'react';
import { ThemeContext } from '../ThemeContext';
import { getJSON, setJSON } from '../utils/storage';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Get a unique date key (YYYY-MM-DD)
const toDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const TilawahTracker = () => {
    const { isDarkTheme } = useContext(ThemeContext);
    const [tilawahLog] = useState(() => getJSON('tilawahLog', {}));
    const todayKey = toDateKey(new Date());

    // Calculate stats
    const stats = useMemo(() => {
        const entries = Object.entries(tilawahLog);
        const totalDays = entries.length;
        const totalVerses = entries.reduce((sum, [, v]) => sum + (v.verses || 0), 0);

        // Calculate current streak
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = toDateKey(d);
            if (tilawahLog[key]) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return { totalDays, totalVerses, streak };
    }, [tilawahLog]);

    // Generate calendar grid (last 20 weeks = ~140 days)
    const calendarData = useMemo(() => {
        const weeks = [];
        const today = new Date();

        // Find the start (Sunday) of the week 19 weeks ago
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (19 * 7) - startDate.getDay());

        for (let w = 0; w < 20; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + w * 7 + d);
                const key = toDateKey(date);
                const log = tilawahLog[key];
                const verses = log?.verses || 0;

                // Intensity level (0-4 like GitHub)
                let level = 0;
                if (verses >= 50) level = 4;
                else if (verses >= 20) level = 3;
                else if (verses >= 10) level = 2;
                else if (verses > 0) level = 1;

                week.push({
                    date,
                    key,
                    verses,
                    level,
                    isToday: key === todayKey,
                    isFuture: date > today,
                });
            }
            weeks.push(week);
        }
        return weeks;
    }, [tilawahLog, todayKey]);

    const levelColors = isDarkTheme
        ? ['bg-gray-800', 'bg-green-900', 'bg-green-700', 'bg-green-500', 'bg-green-400']
        : ['bg-gray-100', 'bg-green-100', 'bg-green-300', 'bg-green-500', 'bg-green-700'];

    const todayLog = tilawahLog[todayKey];

    return (
        <div className={`min-h-screen py-8 ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-blue-50 text-gray-900'}`}>
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-center">📖 Pelacak Tilawah</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className={`p-6 rounded-2xl text-center ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                        <p className="text-3xl font-bold text-green-500">{stats.streak}</p>
                        <p className="text-sm text-gray-400 mt-1">Hari Berturut-turut 🔥</p>
                    </div>
                    <div className={`p-6 rounded-2xl text-center ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                        <p className="text-3xl font-bold text-blue-500">{stats.totalDays}</p>
                        <p className="text-sm text-gray-400 mt-1">Total Hari Membaca</p>
                    </div>
                    <div className={`p-6 rounded-2xl text-center ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                        <p className="text-3xl font-bold text-purple-500">{stats.totalVerses}</p>
                        <p className="text-sm text-gray-400 mt-1">Total Ayat Dibaca</p>
                    </div>
                </div>

                {/* Today's Progress */}
                <div className={`rounded-2xl p-6 mb-8 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h2 className="text-xl font-bold mb-4">Hari Ini</h2>
                    {todayLog ? (
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <p className="text-lg">
                                    <span className="font-semibold text-green-500">{todayLog.verses}</span> ayat dibaca
                                </p>
                                {todayLog.surahs && todayLog.surahs.length > 0 && (
                                    <p className="text-sm text-gray-400 mt-1">
                                        Surat: {todayLog.surahs.join(', ')}
                                    </p>
                                )}
                            </div>
                            <div className="text-4xl">✅</div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-400 text-lg">Belum ada bacaan hari ini</p>
                            <p className="text-sm text-gray-500 mt-1">Buka surah mana saja untuk memulai tilawah</p>
                        </div>
                    )}
                </div>

                {/* Contribution Calendar */}
                <div className={`rounded-2xl p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h2 className="text-xl font-bold mb-4">Riwayat Tilawah</h2>

                    {/* Month labels */}
                    <div className="flex gap-1 mb-2 ml-8">
                        {calendarData.map((week, wi) => {
                            const firstDay = week[0]?.date;
                            if (firstDay && firstDay.getDate() <= 7) {
                                return (
                                    <span key={wi} className="text-xs text-gray-400" style={{ width: '14px' }}>
                                        {MONTHS[firstDay.getMonth()]}
                                    </span>
                                );
                            }
                            return <span key={wi} style={{ width: '14px' }} />;
                        })}
                    </div>

                    {/* Calendar grid */}
                    <div className="flex gap-1">
                        {/* Day labels */}
                        <div className="flex flex-col gap-1 mr-1">
                            {DAYS.map((day, i) => (
                                <span key={i} className="text-xs text-gray-400 h-[14px] leading-[14px]">
                                    {i % 2 === 1 ? day : ''}
                                </span>
                            ))}
                        </div>

                        {/* Weeks */}
                        {calendarData.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-1">
                                {week.map((day) => (
                                    <div
                                        key={day.key}
                                        className={`streak-cell ${day.isFuture ? 'opacity-20' : ''} ${day.isToday ? 'ring-2 ring-blue-500' : ''
                                            } ${levelColors[day.level]}`}
                                        title={`${day.date.toLocaleDateString('id-ID')}: ${day.verses} ayat`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-2 mt-4 justify-end text-xs text-gray-400">
                        <span>Sedikit</span>
                        {levelColors.map((c, i) => (
                            <div key={i} className={`streak-cell ${c}`} />
                        ))}
                        <span>Banyak</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper to log tilawah progress (called from Ayat.js)
export const logTilawah = (chapterNumber, surahName, versesRead) => {
    const log = getJSON('tilawahLog', {});
    const today = toDateKey(new Date());

    if (!log[today]) {
        log[today] = { verses: 0, surahs: [], timestamp: Date.now() };
    }

    log[today].verses += versesRead;
    if (surahName && !log[today].surahs.includes(surahName)) {
        log[today].surahs.push(surahName);
    }
    log[today].timestamp = Date.now();

    setJSON('tilawahLog', log);
};

export default TilawahTracker;
