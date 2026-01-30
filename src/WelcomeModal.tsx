import React from 'react';
import { Trophy, Zap } from 'lucide-react';

interface WelcomeModalProps {
    onClose: () => void;
    teamOneName: string;
    teamTwoName: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose, teamOneName, teamTwoName }) => {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(2, 6, 23, 0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
                border: '2px solid rgba(0, 229, 255, 0.5)',
                borderRadius: '24px',
                padding: '3rem',
                textAlign: 'center',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 0 100px rgba(0, 229, 255, 0.2), inset 0 0 50px rgba(0, 0, 0, 0.5)',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem',
                    animation: 'float 3s ease-in-out infinite'
                }}>
                    <Zap size={64} className="text-yellow-400" fill="currentColor" />
                    <Trophy size={64} className="text-cyan-400" fill="currentColor" />
                    <Zap size={64} className="text-yellow-400" fill="currentColor" />
                </div>

                <h1 className="orbitron" style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    marginBottom: '1rem',
                    background: 'linear-gradient(to right, #00e5ff, #fff, #00e5ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(0, 229, 255, 0.5)'
                }}>
                    ARE YOU READY?
                </h1>

                <p className="mono" style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '3rem', lineHeight: '1.6' }}>
                    The stage is set. <br />
                    <span style={{ color: '#00a2ff', fontWeight: 'bold' }}>{teamOneName}</span> vs <span style={{ color: '#ff7300', fontWeight: 'bold' }}>{teamTwoName}</span>.<br />
                    Let the series begin!
                </p>

                <button
                    onClick={onClose}
                    className="orbitron"
                    style={{
                        background: 'var(--accent-cyan)',
                        color: 'black',
                        border: 'none',
                        padding: '1rem 3rem',
                        fontSize: '1.2rem',
                        fontWeight: 900,
                        borderRadius: '50px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 0 30px rgba(0, 229, 255, 0.6)'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 0 50px rgba(0, 229, 255, 0.8)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 229, 255, 0.6)';
                    }}
                >
                    LET'S PLAY
                </button>
            </div>
            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
};
