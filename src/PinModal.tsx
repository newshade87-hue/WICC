import React, { useState } from 'react';
import { X, Lock, Unlock } from 'lucide-react';

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnlock: (pin: string) => boolean;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onUnlock }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onUnlock(pin)) {
            setPin('');
            setError(false);
        } else {
            setError(true);
            setPin('');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--bg-deep)', opacity: 0.95, backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '320px', padding: '1.5rem', border: '1px solid var(--accent-cyan)' }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={18} color="var(--accent-cyan)" />
                        <span className="orbitron" style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>ADMIN ACCESS</span>
                    </div>
                    <button onClick={onClose} className="btn-outline btn-red-outline">
                        <X size={14} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                        <span className="mono" style={{ fontSize: '0.8rem', opacity: 0.7 }}>Enter PIN to unlock edit mode</span>
                    </div>

                    <input
                        autoFocus
                        type="password"
                        placeholder="PIN CODE"
                        value={pin}
                        onChange={e => { setPin(e.target.value); setError(false); }}
                        style={{
                            textAlign: 'center',
                            fontSize: '1.2rem',
                            letterSpacing: '0.3em',
                            padding: '0.8rem',
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            border: error ? '1px solid #ef4444' : '1px solid var(--border-glass)'
                        }}
                    />

                    {error && <span className="mono" style={{ color: '#ef4444', fontSize: '0.7rem', textAlign: 'center' }}>INCORRECT PIN</span>}

                    <button type="submit" className="btn-commit orbitron" style={{ marginTop: '0.5rem', background: 'var(--accent-cyan)', color: 'black' }}>
                        <Unlock size={14} style={{ marginRight: '6px' }} /> UNLOCK
                    </button>
                </form>
            </div>
        </div>
    );
};
