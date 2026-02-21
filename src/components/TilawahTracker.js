import React, { useState, useContext, useMemo } from 'react';
import { ThemeContext } from '../ThemeContext';
import { getJSON, setJSON } from '../utils/storage';
import { FiTrendingUp, FiCalendar, FiBookOpen } from 'react-icons/fi';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const toDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const TilawahTracker = () => {
    const { isDarkTheme } = useContext(ThemeContext);
    const [tilawahLog] = useState(() => getJSON('tilawahLog', {}));
    const todayKey = toDateKey(new Date());

    const stats = useMemo(() => {
        const entries = Object.entries(tilawahLog);
        const totalDays = entries.length;
        const totalVerses = entries.reduce((sum, [, v]) => sum + (v.verses || 0), 0);
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today); d.setDate(d.getDate() - i);
            if (tilawahLog[toDateKey(d)]) streak++; else if (i > 0) break;
        }
        return { totalDays, totalVerses, streak };
    }, [tilawahLog]);

    const calendarData = useMemo(() => {
        const weeks = [];
        const today = new Date();
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
                let level = 0;
                if (verses >= 50) level = 4;
                else if (verses >= 20) level = 3;
                else if (verses >= 10) level = 2;
                else if (verses > 0) level = 1;
                week.push({ date, key, verses, level, isToday: key === todayKey, isFuture: date > today });
            }
            weeks.push(week);
        }
        return weeks;
    }, [tilawahLog, todayKey]);

    const levelColors = isDarkTheme
        ? ['bg-slate-800', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-500', 'bg-emerald-400']
        : ['bg-slate-100', 'bg-emerald-100', 'bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700'];

    const todayLog = tilawahLog[todayKey];

    const statCards = [
        { label: 'Hari Berturut 🔥', value: stats.streak, color: 'text-emerald-500', icon: FiTrendingUp, bg: isDarkTheme ? 'from-emerald-900/30 to-emerald-800/20' : 'from-emerald-50 to-emerald-100' },
        { label: 'Total Hari', value: stats.totalDays, color: 'text-primary-500', icon: FiCalendar, bg: isDarkTheme ? 'from-primary-900/30 to-primary-800/20' : 'from-primary-50 to-primary-100' },
        { label: 'Total Ayat', value: stats.totalVerses, color: 'text-violet-500', icon: FiBookOpen, bg: isDarkTheme ? 'from-violet-900/30 to-violet-800/20' : 'from-violet-50 to-violet-100' },
    ];

    return (
        <div className={`min-h-screen ${isDarkTheme ? 'bg-slate-950 text-white' : 'bg-surface-light text-slate-800'}`}>
            <div className={`${isDarkTheme ? 'bg-hero-dark' : 'bg-hero-light'} islamic-pattern-bg`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-14 text-center">
                    <span className="text-4xl mb-3 block">📖</span>
                    <h1 className="text-3xl font-poppins font-bold text-white">Pelacak Tilawah</h1>
                </div>
                <svg viewBox="0 0 1440 40" fill="none" className="w-full h-6 md:h-10">
                    <path d="M0 40V20C360 0 720 0 1080 20C1260 30 1380 40 1440 40H0Z" fill={isDarkTheme ? '#020617' : '#f8fafc'} />
                </svg>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-2 pb-16 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {statCards.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className={`p-5 rounded-2xl bg-gradient-to-br ${s.bg} ${isDarkTheme ? 'border border-white/5' : 'border border-slate-100'} shadow-card`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon className={s.color} size={20} />
                                    <span className={`text-xs font-medium ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</span>
                                </div>
                                <p className={`text-3xl font-poppins font-bold ${s.color}`}>{s.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Today */}
                <div className={`rounded-2xl p-6 ${isDarkTheme ? 'bg-slate-900/50 border border-white/5' : 'bg-white border border-slate-100'} shadow-card`}>
                    <h2 className={`text-lg font-poppins font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>Hari Ini</h2>
                    {todayLog ? (
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <p className="text-lg">
                                    <span className="font-semibold text-emerald-500">{todayLog.verses}</span>
                                    <span className={`${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}> ayat dibaca</span>
                                </p>
                                {todayLog.surahs?.length > 0 && (
                                    <p className={`text-sm mt-1 ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Surat: {todayLog.surahs.join(', ')}
                                    </p>
                                )}
                            </div>
                            <span className="text-3xl">✅</span>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className={isDarkTheme ? 'text-slate-500' : 'text-slate-400'}>Belum ada bacaan hari ini</p>
                            <p className={`text-xs mt-1 ${isDarkTheme ? 'text-slate-600' : 'text-slate-400'}`}>Buka surah mana saja untuk memulai</p>
                        </div>
                    )}
                </div>

                {/* Calendar */}
                <div className={`rounded-2xl p-6 ${isDarkTheme ? 'bg-slate-900/50 border border-white/5' : 'bg-white border border-slate-100'} shadow-card overflow-x-auto`}>
                    <h2 className={`text-lg font-poppins font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>Riwayat Tilawah</h2>

                    <div className="flex gap-1 mb-2 ml-8">
                        {calendarData.map((week, wi) => {
                            const firstDay = week[0]?.date;
                            if (firstDay && firstDay.getDate() <= 7) return <span key={wi} className="text-[10px] text-slate-500" style={{ width: '14px' }}>{MONTHS[firstDay.getMonth()]}</span>;
                            return <span key={wi} style={{ width: '14px' }} />;
                        })}
                    </div>

                    <div className="flex gap-1">
                        <div className="flex flex-col gap-1 mr-1">
                            {DAYS.map((day, i) => (
                                <span key={i} className="text-[10px] text-slate-500 h-[14px] leading-[14px]">{i % 2 === 1 ? day : ''}</span>
                            ))}
                        </div>
                        {calendarData.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-1">
                                {week.map((day) => (
                                    <div
                                        key={day.key}
                                        className={`streak-cell ${day.isFuture ? 'opacity-20' : ''} ${day.isToday ? 'ring-1 ring-primary-500' : ''} ${levelColors[day.level]}`}
                                        title={`${day.date.toLocaleDateString('id-ID')}: ${day.verses} ayat`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 mt-4 justify-end text-[10px] text-slate-500">
                        <span>Sedikit</span>
                        {levelColors.map((c, i) => <div key={i} className={`streak-cell ${c}`} />)}
                        <span>Banyak</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const logTilawah = (chapterNumber, surahName, versesRead) => {
    const log = getJSON('tilawahLog', {});
    const today = toDateKey(new Date());
    if (!log[today]) log[today] = { verses: 0, surahs: [], timestamp: Date.now() };
    log[today].verses += versesRead;
    if (surahName && !log[today].surahs.includes(surahName)) log[today].surahs.push(surahName);
    log[today].timestamp = Date.now();
    setJSON('tilawahLog', log);
};

export default TilawahTracker;
