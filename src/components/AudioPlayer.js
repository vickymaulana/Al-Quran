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
        try {
            const saved = localStorage.getItem('preferredReciter');
            return saved ? parseInt(saved, 10) : 7; // Mishary default
        } catch { return 7; }
    });
    const [audioFiles, setAudioFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // Fetch audio files for the chapter
    const loadAudio = useCallback(async (rId) => {
        setLoading(true);
        try {
            const data = await fetchAudioForChapter(rId, chapterId);
            const files = data?.audio_files || [];
            // Sort by verse number
            files.sort((a, b) => a.verse_key?.localeCompare(b.verse_key, undefined, { numeric: true }));
            setAudioFiles(files);
        } catch (err) {
            console.error('Error loading audio:', err);
            setAudioFiles([]);
        } finally {
            setLoading(false);
        }
    }, [chapterId]);

    useEffect(() => {
        loadAudio(reciterId);
    }, [reciterId, loadAudio]);

    const getCurrentAudioUrl = useCallback(() => {
        const verseKey = `${chapterId}:${currentVerse}`;
        const file = audioFiles.find(f => f.verse_key === verseKey);
        return getAudioUrl(file);
    }, [audioFiles, chapterId, currentVerse]);

    // Play current verse
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
        }).catch(err => {
            console.error('Audio play error:', err);
        });
    }, [audioFiles, chapterId, onVerseChange]);

    // Handle audio events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onEnded = () => {
            // Auto-play next verse
            if (currentVerse < totalVerses) {
                const next = currentVerse + 1;
                playVerse(next);
            } else {
                setIsPlaying(false);
            }
        };

        const onTimeUpdate = () => {
            setProgress(audio.currentTime);
        };

        const onLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('ended', onEnded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);

        return () => {
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, [currentVerse, totalVerses, playVerse]);

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const url = getCurrentAudioUrl();
            if (url) {
                if (!audioRef.current.src || audioRef.current.src !== url) {
                    audioRef.current.src = url;
                }
                audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
            }
        }
    };

    const handleStop = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setProgress(0);
    };

    const handlePrev = () => {
        if (currentVerse > 1) {
            const prev = currentVerse - 1;
            setCurrentVerse(prev);
            if (isPlaying) playVerse(prev);
            else if (onVerseChange) onVerseChange(prev);
        }
    };

    const handleNext = () => {
        if (currentVerse < totalVerses) {
            const next = currentVerse + 1;
            setCurrentVerse(next);
            if (isPlaying) playVerse(next);
            else if (onVerseChange) onVerseChange(next);
        }
    };

    const handleReciterChange = (e) => {
        const id = parseInt(e.target.value, 10);
        setReciterId(id);
        localStorage.setItem('preferredReciter', String(id));
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const handleSeek = (e) => {
        if (!audioRef.current) return;
        const val = parseFloat(e.target.value);
        audioRef.current.currentTime = val;
        setProgress(val);
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // External play function (can be called from parent via ref or prop)
    useEffect(() => {
        window.__audioPlayerPlayVerse = (verseNum) => {
            setCurrentVerse(verseNum);
            playVerse(verseNum);
        };
        return () => { delete window.__audioPlayerPlayVerse; };
    }, [playVerse]);

    return (
        <>
            <audio ref={audioRef} preload="none" />
            <div className={`audio-player-bar fixed bottom-0 left-0 right-0 z-50 border-t shadow-2xl px-4 py-3 ${isDarkTheme
                    ? 'bg-gray-900/95 border-gray-700 text-white'
                    : 'bg-white/95 border-gray-200 text-gray-900'
                }`}>
                <div className="max-w-4xl mx-auto">
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs w-10 text-right">{formatTime(progress)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={progress}
                            onChange={handleSeek}
                            className="flex-1 h-1 accent-blue-500"
                            aria-label="Audio progress"
                        />
                        <span className="text-xs w-10">{formatTime(duration)}</span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Verse info */}
                        <div className="flex items-center gap-2 min-w-0">
                            <FiVolume2 className="text-blue-500 flex-shrink-0" />
                            <span className="text-sm truncate">
                                Ayat {currentVerse} / {totalVerses}
                            </span>
                            {loading && <span className="text-xs text-gray-400">Memuat...</span>}
                        </div>

                        {/* Play controls */}
                        <div className="flex items-center gap-3">
                            <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label="Previous verse">
                                <FiSkipBack size={18} />
                            </button>
                            <button
                                onClick={handlePlayPause}
                                className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition shadow-lg"
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                            </button>
                            <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label="Next verse">
                                <FiSkipForward size={18} />
                            </button>
                            <button onClick={handleStop} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label="Stop">
                                <FiSquare size={16} />
                            </button>
                        </div>

                        {/* Qari selector */}
                        <select
                            value={reciterId}
                            onChange={handleReciterChange}
                            className={`text-xs px-2 py-1 rounded border focus:outline-none focus:ring-1 max-w-[140px] ${isDarkTheme
                                    ? 'bg-gray-800 border-gray-600 text-white focus:ring-blue-500'
                                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500'
                                }`}
                            aria-label="Pilih Qari"
                        >
                            {RECITERS.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AudioPlayer;
