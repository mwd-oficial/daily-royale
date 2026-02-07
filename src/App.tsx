import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
    MOTIVATIONAL_MESSAGES,
    MONOTONE_COLORS,
    NORMAL_COLORS,
    NEON_COLORS,
    LANDSCAPES,
    ARENAS,
    BALLOON_COLORS
} from './constants';

// For canvas-confetti, we use the global variable from the script tag
declare const confetti: any;

interface Balloon {
    id: number;
    left: string;
    color: string;
}

const App: React.FC = () => {
    const [count, setCount] = useState<number>(() => {
        const saved = localStorage.getItem('task_count');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [lastClickTimestamp, setLastClickTimestamp] = useState<number | null>(() => {
        const saved = localStorage.getItem('last_click_timestamp');
        return saved ? parseInt(saved, 10) : null;
    });

    const [message, setMessage] = useState<string>("Pronto para começar?");

    // Carrega do localStorage ou usa o primeiro monotone
    const [gradient, setGradient] = useState<string>(() => {
        const savedGradient = localStorage.getItem('current_gradient');
        return savedGradient || MONOTONE_COLORS[0];
    });

    const [balloons, setBalloons] = useState<Balloon[]>([]);
    const [now, setNow] = useState<number>(Date.now());
    const [showNotification, setShowNotification] = useState(false);
    const [notificationText, setNotificationText] = useState<string>(() => {
        return localStorage.getItem('notificationText') || 'Nova arena alcançada!';
    });
    const [diasSeguidosText, setDiasSeguidosText] = useState<string>(() => {
        return localStorage.getItem('diasSeguidosText') || 'dias seguidos';
    });
    const [isTrofeu, setIsTrofeu] = useState<boolean>(() => {
        const saved = localStorage.getItem('isTrofeu');
        return saved === 'true'; // convert string para boolean
    });
    const [isArena, setIsArena] = useState<boolean>(() => {
        const saved = localStorage.getItem('isArena');
        return saved === 'true'; // convert string para boolean
    });




    // Update clock every minute
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000 * 60);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        localStorage.setItem('task_count', count.toString());
    }, [count]);

    useEffect(() => {
        if (lastClickTimestamp) {
            localStorage.setItem('last_click_timestamp', lastClickTimestamp.toString());
        } else {
            localStorage.removeItem('last_click_timestamp');
        }
    }, [lastClickTimestamp]);

    // Salva a cor atual no localStorage sempre que mudar
    useEffect(() => {
        localStorage.setItem('current_gradient', gradient);
    }, [gradient]);

    useEffect(() => {
        localStorage.setItem('notificationText', notificationText);
    }, [notificationText]);

    useEffect(() => {
        localStorage.setItem('diasSeguidosText', diasSeguidosText);
    }, [diasSeguidosText]);

    useEffect(() => {
        localStorage.setItem('isTrofeu', isTrofeu.toString());
    }, [isTrofeu]);

    useEffect(() => {
        localStorage.setItem('isArena', isArena.toString());
    }, [isArena]);


    // Determine current phase
    const phase = useMemo(() => {
        if (count <= 6) return 'monotone';
        if (count <= 13) return 'normal';
        if (count <= 20) return 'neon';
        return 'landscape';
    }, [count]);

    // Handle phase-based background
    const backgroundStyle = useMemo(() => {
        if (phase === 'landscape') {
            const imgIndex = Math.floor((count - 21) / 7) % LANDSCAPES.length;
            return {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${LANDSCAPES[imgIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            };
        }
        return {};
    }, [phase, count]);

    const arenaStyle = useMemo(() => {
        if (phase === 'landscape') {
            const imgIndex = Math.floor((count - 21) / 7) % ARENAS.length;
            return ARENAS[imgIndex]
        }
        return '';
    }, [phase, count]);
    
    const isEnabled = useMemo(() => {
        if (!lastClickTimestamp) return true;

        const lastDate = new Date(lastClickTimestamp);
        const targetDate = new Date(lastDate);
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(20, 0, 0, 0);

        return now >= targetDate.getTime();
    }, [lastClickTimestamp, now]);
    
    //const isEnabled = true;


    const getCenteredRandom = () => {
        const min = 0;
        const max = 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const handleIncrement = useCallback(() => {
        if (!isEnabled) return;

        const newCount = count + 1;
        setCount(newCount);
        setLastClickTimestamp(Date.now());

        // Calcular fase atual baseada no newCount
        let newPhase: 'monotone' | 'normal' | 'neon' | 'landscape';
        if (newCount <= 6) newPhase = 'monotone';
        else if (newCount <= 13) newPhase = 'normal';
        else if (newCount <= 20) newPhase = 'neon';
        else newPhase = 'landscape';

        // Notifications for landscape change
        if (newCount >= 21 && (newCount - 21) % 7 === 0) {
            if (newCount >= 280) setNotificationText('Nova liga alcançada!');
            setDiasSeguidosText(`troféus`);
            setIsTrofeu(true);
            setIsArena(true)
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 4000);
        }

        // Pick random motivational message
        setMessage(
            MOTIVATIONAL_MESSAGES[
            Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
            ]
        );

        // Escolhe gradiente baseado na fase
        let colorList = MONOTONE_COLORS.slice(1);
        if (newPhase === 'normal') colorList = NORMAL_COLORS;
        else if (newPhase === 'neon') colorList = NEON_COLORS;

        let newGradient: string;
        if (newCount === 0) {
            newGradient = MONOTONE_COLORS[0];
        } else {
            const filteredList = colorList.filter(c => c !== gradient);
            newGradient = filteredList[
                Math.floor(Math.random() * filteredList.length)
            ];
        }
        setGradient(newGradient);

        // Confete usando a fase calculada
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: newPhase === 'monotone' ? ['#555', '#999', '#333'] : undefined
        });

        // Balões usando a fase calculada
        Array.from({ length: 30 }).forEach(() => {
            const spawnDelay = Math.random() * 2000;

            setTimeout(() => {
                const balloon: Balloon = {
                    id: Date.now() + Math.random(),
                    left: `${getCenteredRandom()}%`,
                    color:
                        newPhase === 'monotone'
                            ? 'text-gray-400'
                            : BALLOON_COLORS[
                            Math.floor(Math.random() * BALLOON_COLORS.length)
                            ]
                };
                setBalloons(prev => [...prev, balloon]);

                const removeDelay = 3500 + Math.random() * 1000;
                setTimeout(() => {
                    setBalloons(prev => prev.filter(b => b.id !== balloon.id));
                }, removeDelay);
            }, spawnDelay);
        });
    }, [isEnabled, count, gradient]);


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
        setCount(0);
        setLastClickTimestamp(null);
        setMessage("Começando do zero. Você consegue!");
        setNotificationText('Nova arena alcançada!');
        setDiasSeguidosText(`dias seguidos`);
        setIsTrofeu(false);
        setIsArena(false);
        setGradient(MONOTONE_COLORS[0]);
    };

    const getWaitMessage = () => {
        if (isEnabled || !lastClickTimestamp) return null;
        return `Disponível amanhã às 20h`;
    };

    // Tirar isso depois 
    /*
    const requestFullscreen = () => {
        const elem = document.documentElement;

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
            (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
            (elem as any).msRequestFullscreen();
        }
    };

    const btnTelaCheia = () => {
        const btn = document.getElementById('btn-tela-cheia');
        if (btn) btn.style.display = 'none';
        requestFullscreen();
    };
    */

    return (
        <div
            style={backgroundStyle}
            className={`min-h-screen w-full flex flex-col items-center justify-between transition-all duration-1000 
                ${phase !== 'landscape' ? `bg-gradient-to-br ${gradient}` : ''}
                ${phase === 'monotone' ? 'brightness-90' : 'grayscale-0'}`}
        >
            {/* Tirar isso depois */}
            {/*<div id="btn-tela-cheia" onClick={btnTelaCheia}></div>*/}

            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {balloons.map(balloon => (
                    <div
                        key={balloon.id}
                        className={`balloon ${balloon.color}`}
                        style={{ left: balloon.left }}
                    >
                        <svg width="60" height="80" viewBox="0 0 60 80" fill="currentColor">
                            <path d="M30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60C46.5685 60 60 46.5685 60 30C60 13.4315 46.5685 0 30 0ZM30 55C31.6569 55 33 56.3431 33 58V75C33 76.6569 31.6569 78 30 78C28.3431 78 27 76.6569 27 75V58C27 56.3431 28.3431 55 30 55Z" />
                        </svg>
                    </div>
                ))}
            </div>

            {showNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-500">
                    <div className="bg-white text-slate-900 px-4 py-2 rounded-lg shadow-md scale-100 animate-bounce max-w-xs w-11/12">
                        <h2 className="text-xl sm:text-2xl font-bungee text-center">{notificationText}</h2>
                    </div>
                </div>
            )}

            <header className="mt-[15px] mb-[15px] text-center animate-pulse">
                <h1 className="text-4xl font-black font-bungee drop-shadow-lg tracking-tighter">
                    {phase === 'monotone' ? 'NUNCA DESISTA!' : phase === 'normal' ? 'FOCO TOTAL!' : 'VIBRAÇÃO MÁXIMA!'}
                </h1>
            </header>

            <main className={`flex flex-col items-center justify-start flex-1 w-full ${!isArena ? 'space-y-10' : 'space-y-2'}`}>
                <div className="relative group">
                    <div className={`absolute -inset-4 opacity-20 blur-xl transition rounded-full`}></div>
                    <div className={`relative flex flex-col items-center justify-center backdrop-blur-md rounded-3xl p-12 border shadow-2xl min-w-[300px] transition-colors duration-1000
                        ${phase === 'monotone' ? 'bg-black/40 border-white/10' : 'bg-white/10 border-white/20'}`}>
                        {isTrofeu && (
                            <img
                                src="/assets/trofeu.png"
                                alt="Troféu"
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] opacity-50 pointer-events-none select-none"
                            />
                        )}
                        <span className={`text-9xl font-black font-bungee tabular-nums drop-shadow-2xl transition-all duration-1000 ${phase === 'neon' ? 'text-transparent bg-clip-text bg-gradient-to-t from-cyan-400 to-white' : 'text-white'}`}>
                            {count}
                        </span>
                        <p className="mt-4 text-xl font-bold uppercase tracking-widest text-white z-10">
                            {diasSeguidosText}
                        </p>
                    </div>
                </div>
                {isArena && (
                    <img
                        src={arenaStyle}
                        alt="Arena"
                        className="mt-0 mb-0 w-[200px] pointer-events-none select-none"
                    />
                )}
                <div className="max-w-md w-full px-4 text-center flex flex-col items-center justify-center space-y-2">
                    <p className={`text-2xl font-bold leading-tight drop-shadow-md transition-all duration-500 mb-5 ${phase === 'monotone' ? 'opacity-50' : 'opacity-100'}`}>
                        {message}
                    </p>
                    {!isEnabled && (
                        <p className="text-sm font-black uppercase tracking-wide text-white/40 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
                            {getWaitMessage()}
                        </p>
                    )}
                </div>

                <button
                    onClick={handleIncrement}
                    disabled={!isEnabled}
                    className={`group relative flex items-center justify-center w-36 h-36 rounded-full shadow-2xl transition-all duration-300 transform font-bungee text-5xl
                        ${isEnabled
                            ? 'bg-white text-slate-900 shadow-[0_0_50px_rgba(255,255,255,0.4)] active:scale-90 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 grayscale opacity-40 cursor-not-allowed scale-95 shadow-none'
                        }`}
                >
                    {isEnabled && (
                        <div className={`absolute -inset-2 rounded-full animate-ping group-active:hidden ${phase === 'neon' ? 'bg-cyan-400/30' : 'bg-white/30'}`}></div>
                    )}
                    <span>+1</span>
                </button>
            </main>

            <button
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                className="text-white/90 text-[10px] font-bold uppercase tracking-widest transition-all py-1.5 px-6 rounded-full border border-white/20 bg-white/30 btn-resetar"

            >
                Resetar Progresso
            </button>
        </div>
    );
};

export default App;
