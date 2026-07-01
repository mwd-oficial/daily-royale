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

    // Última data em que o app checou/processou a passagem de dias
    const [lastCheckedDate, setLastCheckedDate] = useState<string | null>(() => {
        return localStorage.getItem('last_checked_date');
    });

    // Indica se o PRÓXIMO incremento de meia-noite deve ser pulado
    // (fica true logo após um reset, e é consumido uma única vez)
    const [skipNextIncrement, setSkipNextIncrement] = useState<boolean>(() => {
        return localStorage.getItem('skip_next_increment') === 'true';
    });

    const [message, setMessage] = useState<string>(() => {
        return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    });

    useEffect(() => {
        localStorage.setItem('task_count', count.toString());
    }, [count]);

    useEffect(() => {
        if (lastCheckedDate) {
            localStorage.setItem('last_checked_date', lastCheckedDate);
        } else {
            localStorage.removeItem('last_checked_date');
        }
    }, [lastCheckedDate]);

    useEffect(() => {
        localStorage.setItem('skip_next_increment', skipNextIncrement ? 'true' : 'false');
    }, [skipNextIncrement]);

    // Incrementa ao abrir o app com base nos dias passados
    useEffect(() => {
        const todayStr = new Date().toISOString().slice(0, 10);

        // Primeiro uso — apenas registra hoje sem incrementar
        if (lastCheckedDate === null) {
            setLastCheckedDate(todayStr);
            return;
        }

        // Já processado hoje, nada a fazer
        if (lastCheckedDate >= todayStr) {
            return;
        }

        const diffDays = Math.floor(
            (new Date(todayStr).getTime() - new Date(lastCheckedDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        let daysToAdd = diffDays;

        // Se há um incremento pendente de ser pulado (pós-reset), desconta 1 e consome o flag
        if (skipNextIncrement) {
            daysToAdd -= 1;
            setSkipNextIncrement(false);
        }

        if (daysToAdd > 0) {
            setCount(prev => prev + daysToAdd);
            setMessage(MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);
        }

        setLastCheckedDate(todayStr);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        setLastCheckedDate(todayStr);
        setSkipNextIncrement(true); // a próxima virada de meia-noite não deve incrementar
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
