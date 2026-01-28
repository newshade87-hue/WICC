import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Users, Zap, Shield, Sword, RefreshCw, Check, X } from 'lucide-react';
import { PLAYER_DATA, WICC_MEMBERS } from './types';

export const TeamPicker: React.FC<{ isOpen: boolean, onClose: () => void, onComplete: () => void }> = ({ isOpen, onClose, onComplete }) => {
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [teamA, setTeamA] = useState<string[]>([]);
    const [teamB, setTeamB] = useState<string[]>([]);
    const [teamAName, setTeamAName] = useState('TEAM BLUE');
    const [teamBName, setTeamBName] = useState('TEAM ORANGE');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const togglePlayer = (name: string) => {
        setSelectedPlayers(prev =>
            prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
        );
    };

    const autoBalance = () => {
        if (selectedPlayers.length < 2) return;

        // Simple intelligent balancing
        // 1. Sort selected players by skill
        const sorted = [...selectedPlayers].sort((a, b) => (PLAYER_DATA[b]?.skill || 0) - (PLAYER_DATA[a]?.skill || 0));

        const tA: string[] = [];
        const tB: string[] = [];

        // 2. Snake draft distribution
        sorted.forEach((player, index) => {
            if (index % 4 === 0 || index % 4 === 3) {
                tA.push(player);
            } else {
                tB.push(player);
            }
        });

        setTeamA(tA);
        setTeamB(tB);
    };

    const handleCommit = async () => {
        setLoading(true);
        // Clear current members and insert new ones
        await supabase.from('wicc_members').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        const newMembers = [
            ...teamA.map(name => ({ name, team: 'blue' })),
            ...teamB.map(name => ({ name, team: 'orange' }))
        ];

        const { error } = await supabase.from('wicc_members').insert(newMembers);

        if (!error) {
            onComplete();
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="history-modal">
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div className="flex-between" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Users size={32} color="var(--accent-cyan)" />
                        <h1 className="orbitron" style={{ fontSize: '1.8rem', fontWeight: '950' }}>TEAM SELECTION</h1>
                    </div>
                    <button onClick={onClose} className="btn-outline btn-red-outline">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
                    {/* Left: Player Pool */}
                    <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <h2 className="orbitron" style={{ fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--accent-cyan)' }}>PLAYER POOL ({selectedPlayers.length})</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {WICC_MEMBERS.map(name => {
                                const p = PLAYER_DATA[name];
                                const isSelected = selectedPlayers.includes(name);
                                return (
                                    <div
                                        key={name}
                                        className={`player-select-card ${isSelected ? 'active' : ''}`}
                                        onClick={() => togglePlayer(name)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="mono" style={{ fontWeight: 'bold' }}>{name}</span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {p.sports.includes('cricket') && <span>🏏</span>}
                                                {p.sports.includes('tennis') && <span>🎾</span>}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: '4px' }}>
                                            {p.department} | {p.role}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            className="btn-commit orbitron"
                            style={{ width: '100%', marginTop: '1.5rem' }}
                            onClick={autoBalance}
                            disabled={selectedPlayers.length < 2}
                        >
                            <Zap size={14} style={{ marginRight: '8px' }} /> AUTO BALANCE
                        </button>
                    </div>

                    {/* Right: Teams Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card card-blue" style={{ minHeight: '200px' }}>
                            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                <input
                                    className="orbitron"
                                    style={{ background: 'transparent', border: 'none', color: '#00e5ff', fontWeight: 'bold', fontSize: '1.1rem' }}
                                    value={teamAName}
                                    onChange={e => setTeamAName(e.target.value)}
                                />
                                <Shield size={20} color="#00e5ff" />
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {teamA.map(p => (
                                    <span key={p} className="roster-tag mono">{p}</span>
                                ))}
                                {teamA.length === 0 && <div className="orbitron opacity-30" style={{ fontSize: '0.7rem' }}>NO PLAYERS ASSIGNED</div>}
                            </div>
                        </div>

                        <div className="card card-orange" style={{ minHeight: '200px' }}>
                            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                <input
                                    className="orbitron"
                                    style={{ background: 'transparent', border: 'none', color: '#ff7300', fontWeight: 'bold', fontSize: '1.1rem' }}
                                    value={teamBName}
                                    onChange={e => setTeamBName(e.target.value)}
                                />
                                <Sword size={20} color="#ff7300" />
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {teamB.map(p => (
                                    <span key={p} className="roster-tag mono">{p}</span>
                                ))}
                                {teamB.length === 0 && <div className="orbitron opacity-30" style={{ fontSize: '0.7rem' }}>NO PLAYERS ASSIGNED</div>}
                            </div>
                        </div>

                        <button
                            className="btn-commit orbitron"
                            style={{ height: '50px', fontSize: '1.1rem', background: 'linear-gradient(45deg, #22c55e, #10b981)' }}
                            onClick={handleCommit}
                            disabled={loading || (teamA.length === 0 && teamB.length === 0)}
                        >
                            {loading ? <RefreshCw className="spin" /> : <><Check size={20} style={{ marginRight: '10px' }} /> CONFIRM TEAMS</>}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .player-select-card {
                    padding: 0.8rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .player-select-card:hover {
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(0, 229, 255, 0.3);
                }
                .player-select-card.active {
                    background: rgba(0, 229, 255, 0.1);
                    border-color: var(--accent-cyan);
                    box-shadow: 0 0 15px rgba(0, 229, 255, 0.15);
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
