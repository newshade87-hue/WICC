import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface VictoryModalProps {
    winner: string;
    score: string;
    onReset: () => void;
    onClose: () => void;
    isAdmin: boolean;
    winningColor: string;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ winner, score, onReset, onClose, isAdmin, winningColor }) => {

    useEffect(() => {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 4000 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // Use winning colors for confetti if possible, or random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(2, 6, 23, 0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), ${winningColor}20)`,
                border: `4px solid ${winningColor}`,
                borderRadius: '30px',
                padding: '4rem',
                textAlign: 'center',
                maxWidth: '800px',
                width: '100%',
                boxShadow: `0 0 150px ${winningColor}50`,
                animation: 'victoryPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div className="orbitron" style={{ fontSize: '1.5rem', color: '#94a3b8', marginBottom: '1rem', letterSpacing: '0.2em' }}>
                    CRICKET LEGENDS
                </div>

                <h1 className="orbitron" style={{
                    fontSize: '5rem',
                    fontWeight: 900,
                    marginBottom: '0.5rem',
                    background: `linear-gradient(to right, #fff, ${winningColor}, #fff)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: `0 0 50px ${winningColor}`,
                    lineHeight: 1
                }}>
                    {winner}
                </h1>

                <div className="orbitron" style={{
                    fontSize: '3rem',
                    color: 'white',
                    marginBottom: '3rem',
                    fontWeight: 'bold',
                    textShadow: '0 0 20px rgba(255,255,255,0.5)'
                }}>
                    LIFT THE TROPHY ({score})
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {isAdmin && (
                        <button
                            onClick={onReset}
                            className="orbitron"
                            style={{
                                background: 'transparent',
                                color: '#ef4444',
                                border: '2px solid #ef4444',
                                padding: '1rem 2rem',
                                fontSize: '1rem',
                                fontWeight: 900,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                letterSpacing: '0.1em'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = '#ef4444';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.5)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#ef4444';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            ARCHIVE & START NEW SERIES
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="orbitron"
                        style={{
                            background: 'transparent',
                            color: winningColor,
                            border: `2px solid ${winningColor}`,
                            padding: '1rem 2rem',
                            fontSize: '1rem',
                            fontWeight: 900,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            letterSpacing: '0.1em'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = winningColor;
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.boxShadow = `0 0 30px ${winningColor}50`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = winningColor;
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        GO BACK & EDIT SERIES
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes victoryPop {
                    from { transform: scale(0.5); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
