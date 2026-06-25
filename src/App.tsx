import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
    MOTIVATIONAL_MESSAGES,
    LANDSCAPES,
    ARENAS,
} from './constants';

const App: React.FC = () => {
    const [count, setCount] = useState<number>(() => {
        const saved = localStorage.getItem('task_count');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [lastResetDate, setLastResetDate] = useState<string | null>(() => {
        return localStorage.getItem('last_reset_date');
    });

    const [lastAutoIncrementDate, setLastAutoIncrementDate] = useState<string | null>(() => {
        return localStorage.getItem('last_auto_increment_date');
    });

    const [message, setMessage] = useState<string>(() => {
        return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    });

    useEffect(() => {
        localStorage.setItem('task_count', count.toString());
    }, [count]);

    useEffect(() => {
        if (lastResetDate) {
            localStorage.setItem('last_reset_date', lastResetDate);
        } else {
            localStorage.removeItem('last_reset_date');
        }
    }, [lastResetDate]);

    useEffect(() => {
        if (lastAutoIncrementDate) {
            localStorage.setItem('last_auto_increment_date', lastAutoIncrementDate);
        } else {
            localStorage.removeItem('last_auto_increment_date');
        }
    }, [lastAutoIncrementDate]);

    useEffect(() => {
        const checkMidnight = () => {
            const now = new Date();
            const todayStr = now.toISOString().slice(0, 10);

            if (
                now.getHours() === 0 &&
                now.getMinutes() === 0 &&
                lastAutoIncrementDate !== todayStr &&
                lastResetDate !== todayStr
            ) {
                setCount(prev => prev + 1);
                setLastAutoIncrementDate(todayStr);
                setMessage(MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);
            }
        };

        const interval = setInterval(checkMidnight, 30 * 1000);
        checkMidnight();
        return () => clearInterval(interval);
    }, [lastAutoIncrementDate, lastResetDate]);

    const backgroundStyle = useMemo(() => {
        const imgIndex = Math.min(Math.floor(count / 7), LANDSCAPES.length - 1);
        return {
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${LANDSCAPES[imgIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        };
    }, [count]);

    const arenaStyle = useMemo(() => {
        const imgIndex = Math.min(Math.floor(count / 7), ARENAS.length - 1);
        return ARENAS[imgIndex];
    }, [count]);

    const arenaLabel = useMemo(() => {
        const imgIndex = Math.min(Math.floor(count / 7), ARENAS.length - 1);
        const arena = ARENAS[imgIndex];

        const filename = arena.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
        const slug = filename.startsWith('bg-') ? filename.slice(3) : filename;

        // Separa letra de número (ex: liga1 → liga 1) e converte para Title Case
        return slug
            .replace(/([a-z])(\d)/g, '$1 $2')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }, [count]);

    const timer = useRef<number | null>(null);

    const startHold = () => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
        timer.current = window.setTimeout(() => {
            handleReset();
            timer.current = null;
        }, 3000);
    };

    const cancelHold = () => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    };

    const handleReset = () => {
        const todayStr = new Date().toISOString().slice(0, 10);
        setCount(0);
        setLastResetDate(todayStr);
        setLastAutoIncrementDate(todayStr);
        setMessage("Começando do zero. Você consegue!");
    };

    return (
        <div
            style={backgroundStyle}
            className={'min-h-screen w-full flex flex-col items-center justify-between transition-all duration-1000'}
        >
            <header className="mt-[15px] mb-[15px] text-center animate-pulse">
                <h1 className="text-4xl font-black font-bungee drop-shadow-lg tracking-tighter">
                    NUNCA DESISTA!
                </h1>
            </header>

            <main className={'flex flex-col items-center justify-start flex-1 w-full space-y-2'}>
                <div className="relative group">
                    <div className={`relative flex flex-col items-center justify-center backdrop-blur-md rounded-3xl py-5 border shadow-2xl min-w-[250px] transition-colors duration-1000 bg-white/10 border-white/20`}>
                        <img
                            src="/assets/trofeu.png"
                            alt="Troféu"
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] opacity-50 pointer-events-none select-none"
                        />
                        <span className={'text-[90px] font-black font-bungee tabular-nums drop-shadow-2xl transition-all duration-1000 text-white'}>
                            {count}
                        </span>
                        <p className="mt-4 text-xl font-bold uppercase tracking-widest text-white z-10">
                            troféus
                        </p>
                    </div>
                </div>

                <img
                    src={arenaStyle}
                    alt="Arena"
                    className="mt-0 mb-0 max-w-[200px] pointer-events-none select-none"
                />

                <p className="text-sm font-black uppercase tracking-widest text-white/60">
                    {arenaLabel}
                </p>

                <div className="max-w-md w-full px-4 text-center flex flex-col items-center justify-center space-y-2">
                    <p className={'text-2xl font-bold leading-tight drop-shadow-md transition-all duration-500 mb-5 opacity-100'}>
                        {message}
                    </p>
                </div>
            </main>

            <button
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                className="text-white/90 text-[10px] font-bold uppercase tracking-widest transition-all py-1.5 px-6 rounded-full border border-white/20 bg-white/30 btn-resetar mb-4"
            >
                Resetar Progresso
            </button>
        </div>
    );
};

export default App;
