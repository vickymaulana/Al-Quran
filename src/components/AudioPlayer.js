import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { fetchAudioForChapter, getAudioUrl, RECITERS } from './apiService';
import { ThemeContext } from '../ThemeContext';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiSquare, FiVolume2 } from 'react-icons/fi';

const AudioPlayer = ({ chapterId, totalVerses, onVerseChange }) => {
    const { isDarkTheme } = useContext(ThemeContext);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerse, setCurrentVerse] = useState(1);
    const [reciterId, setReciterId] = useState(() => {
        try { const saved = localStorage.getItem('preferredReciter'); return saved ? parseInt(saved, 10) : 7; } catch { return 7; }
    });
    const [audioFiles, setAudioFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const loadAudio = useCallback(async (rId) => {
        setLoading(true);
        try {
            const data = await fetchAudioForChapter(rId, chapterId);
            const files = data?.audio_files || [];
            files.sort((a, b) => a.verse_key?.localeCompare(b.verse_key, undefined, { numeric: true }));
            setAudioFiles(files);
        } catch (err) { setAudioFiles([]); } finally { setLoading(false); }
    }, [chapterId]);

    useEffect(() => { loadAudio(reciterId); }, [reciterId, loadAudio]);

    const getCurrentAudioUrl = useCallback(() => {
        const verseKey = `${chapterId}:${currentVerse}`;
        const file = audioFiles.find(f => f.verse_key === verseKey);
        return getAudioUrl(file);
    }, [audioFiles, chapterId, currentVerse]);

    const playVerse = useCallback((verseNum) => {
        const verseKey = `${chapterId}:${verseNum}`;
        const file = audioFiles.find(f => f.verse_key === verseKey);
        const url = getAudioUrl(file);
        if (!url || !audioRef.current) return;
        audioRef.current.src = url;
        audioRef.current.play().then(() => {
            setIsPlaying(true);
            setCurrentVerse(verseNum);
            if (onVerseChange) onVerseChange(verseNum);
        }).catch(console.error);
    }, [audioFiles, chapterId, onVerseChange]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onEnded = () => { if (currentVerse < totalVerses) playVerse(currentVerse + 1); else setIsPlaying(false); };
        const onTimeUpdate = () => setProgress(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        return () => { audio.removeEventListener('ended', onEnded); audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('loadedmetadata', onLoadedMetadata); };
    }, [currentVerse, totalVerses, playVerse]);

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else {
            const url = getCurrentAudioUrl();
            if (url) {
                if (!audioRef.current.src || audioRef.current.src !== url) audioRef.current.src = url;
                audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
            }
        }
    };

    const handleStop = () => { if (!audioRef.current) return; audioRef.current.pause(); audioRef.current.currentTime = 0; setIsPlaying(false); setProgress(0); };
    const handlePrev = () => { if (currentVerse > 1) { const p = currentVerse - 1; setCurrentVerse(p); if (isPlaying) playVerse(p); else if (onVerseChange) onVerseChange(p); } };
    const handleNext = () => { if (currentVerse < totalVerses) { const n = currentVerse + 1; setCurrentVerse(n); if (isPlaying) playVerse(n); else if (onVerseChange) onVerseChange(n); } };
    const handleReciterChange = (e) => { const id = parseInt(e.target.value, 10); setReciterId(id); localStorage.setItem('preferredReciter', String(id)); setIsPlaying(false); if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } };
    const handleSeek = (e) => { if (!audioRef.current) return; const val = parseFloat(e.target.value); audioRef.current.currentTime = val; setProgress(val); };
    const formatTime = (sec) => { const m = Math.floor(sec / 60); const s = Math.floor(sec % 60); return `${m}:${s.toString().padStart(2, '0')}`; };

    useEffect(() => {
        window.__audioPlayerPlayVerse = (verseNum) => { setCurrentVerse(verseNum); playVerse(verseNum); };
        return () => { delete window.__audioPlayerPlayVerse; };
    }, [playVerse]);

    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

    return (
        <>
            <audio ref={audioRef} preload="none" />
            <div className={`fixed bottom-0 left-0 right-0 z-50 border-t ${isDarkTheme ? 'bg-slate-900/95 border-white/5 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                } backdrop-blur-xl shadow-2xl`}>
                {/* Slim progress bar on top */}
                <div className={`h-1 w-full ${isDarkTheme ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-200"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="max-w-4xl mx-auto px-4 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                        {/* Verse info */}
                        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                            <FiVolume2 className="text-primary-500 flex-shrink-0" size={16} />
                            <div>
                                <span className={`text-xs font-medium ${isDarkTheme ? 'text-white' : 'text-slate-800'}`}>
                                    Ayat {currentVerse}/{totalVerses}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] tabular-nums text-slate-400">{formatTime(progress)}</span>
                                    <span className="text-[10px] text-slate-600">/</span>
                                    <span className="text-[10px] tabular-nums text-slate-400">{formatTime(duration)}</span>
                                </div>
                            </div>
                            {loading && <span className="text-[10px] text-slate-500">Memuat...</span>}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5">
                            <button onClick={handlePrev} className={`p-2 rounded-lg transition-colors ${isDarkTheme ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} aria-label="Previous">
                                <FiSkipBack size={16} />
                            </button>
                            <button
                                onClick={handlePlayPause}
                                className="p-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-teal hover:shadow-glow-teal-lg transition-shadow"
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                            </button>
                            <button onClick={handleNext} className={`p-2 rounded-lg transition-colors ${isDarkTheme ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} aria-label="Next">
                                <FiSkipForward size={16} />
                            </button>
                            <button onClick={handleStop} className={`p-2 rounded-lg transition-colors ${isDarkTheme ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`} aria-label="Stop">
                                <FiSquare size={14} />
                            </button>
                        </div>

                        {/* Qari selector */}
                        <select
                            value={reciterId}
                            onChange={handleReciterChange}
                            className={`text-xs px-2 py-1.5 rounded-lg border outline-none max-w-[130px] ${isDarkTheme
                                ? 'bg-slate-800 border-white/5 text-white focus:border-primary-500'
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-primary-500'
                                } transition-colors`}
                            aria-label="Pilih Qari"
                        >
                            {RECITERS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AudioPlayer;
