import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Users, Zap, Shield, Sword, RefreshCw, Check, X, Edit3, Plus } from 'lucide-react';
import { type PlayerProfile } from './types';

export const TeamPicker: React.FC<{ isOpen: boolean, onClose: () => void, onComplete: () => void }> = ({ isOpen, onClose, onComplete }) => {
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [teamA, setTeamA] = useState<string[]>([]);
    const [teamB, setTeamB] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchPlayers();
        }
    }, [isOpen]);

    const fetchPlayers = async () => {
        const { data } = await supabase.from('wicc_players').select('*').order('name');
        if (data) setPlayers(data);
    };

    if (!isOpen) return null;

    const movePlayer = (name: string, target: 'A' | 'B' | 'pool') => {
        // Remove from everywhere
        setTeamA(prev => prev.filter(p => p !== name));
        setTeamB(prev => prev.filter(p => p !== name));

        // Add to target
        if (target === 'A') setTeamA(prev => [...prev, name]);
        if (target === 'B') setTeamB(prev => [...prev, name]);
    };

    const autoBalance = () => {
        const selected = [...teamA, ...teamB];
        if (selected.length < 2) return;

        const sorted = selected.sort((a, b) => {
            const pA = players.find(p => p.name === a)?.skill || 5;
            const pB = players.find(p => p.name === b)?.skill || 5;
            return pB - pA;
        });

        const tA: string[] = [];
        const tB: string[] = [];
        sorted.forEach((p, i) => {
            if (i % 4 === 0 || i % 4 === 3) tA.push(p); else tB.push(p);
        });
        setTeamA(tA);
        setTeamB(tB);
    };

    const handleSavePlayer = async (player: PlayerProfile) => {
        setLoading(true);
        const { error } = await supabase.from('wicc_players').upsert(player);
        if (!error) {
            setEditingPlayer(null);
            fetchPlayers();
        }
        setLoading(false);
    };

    const handleCommit = async () => {
        setLoading(true);
        await supabase.from('wicc_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
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
        <div className="team-picker-widget">
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Users size={20} color="var(--accent-cyan)" />
                    <span className="orbitron" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>TEAM PICKER</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditMode(!editMode)} className={`btn-outline ${editMode ? 'btn-red-outline' : 'btn-blue-outline'}`} style={{ padding: '4px 8px' }}>
                        {editMode ? <Check size={14} /> : <Edit3 size={14} />}
                    </button>
                    <button onClick={onClose} className="btn-outline btn-red-outline" style={{ padding: '4px 8px' }}>
                        <X size={14} />
                    </button>
                </div>
            </div>

            {editingPlayer ? (
                <div className="card" style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid var(--accent-cyan)' }}>
                    <h3 className="orbitron" style={{ fontSize: '0.7rem', marginBottom: '1rem' }}>EDIT PLAYER</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <input placeholder="Name" value={editingPlayer.name} onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })} />
                        <input placeholder="Department" value={editingPlayer.department} onChange={e => setEditingPlayer({ ...editingPlayer, department: e.target.value })} />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label className="form-label">Skill (1-10)</label>
                                <input type="number" min="1" max="10" value={editingPlayer.skill} onChange={e => setEditingPlayer({ ...editingPlayer, skill: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleSavePlayer(editingPlayer)} className="btn-commit orbitron" style={{ flex: 1, fontSize: '0.7rem' }}>SAVE</button>
                            <button onClick={() => setEditingPlayer(null)} className="btn-outline btn-red-outline" style={{ flex: 1, fontSize: '0.7rem' }}>CANCEL</button>
                        </div>
                    </div>
                </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Pool Section */}
                <div className="pool-section" style={{ minHeight: '100px', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '12px' }}>
                    <div className="flex-between">
                        <span className="orbitron" style={{ fontSize: '0.65rem', opacity: 0.6 }}>AVAILABLE PLAYERS</span>
                        <button onClick={() => { setEditingPlayer({ name: '', department: 'All-rounder', sports: ['cricket'], role: 'All-rounder', skill: 5 }) }} className="btn-outline btn-blue-outline" style={{ padding: '2px 6px', height: '20px' }}>
                            <Plus size={10} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.8rem' }}>
                        {players.filter(p => !teamA.includes(p.name) && !teamB.includes(p.name)).map(p => (
                            <div key={p.name} style={{ position: 'relative' }}>
                                <span
                                    className="roster-tag mono"
                                    style={{ cursor: 'pointer', fontSize: '0.65rem' }}
                                    onClick={() => movePlayer(p.name, 'A')}
                                >
                                    {p.name}
                                </span>
                                {editMode && (
                                    <Edit3
                                        size={10}
                                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent-cyan)', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}
                                        onClick={(e) => { e.stopPropagation(); setEditingPlayer(p); }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'rgba(0, 162, 255, 0.05)', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(0, 162, 255, 0.2)' }}>
                        <div className="flex-between">
                            <span className="orbitron" style={{ fontSize: '0.6rem', color: 'var(--team-blue)' }}>BLUE</span>
                            <Shield size={12} color="var(--team-blue)" />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.8rem' }}>
                            {teamA.map(name => (
                                <span key={name} className="roster-tag mono" style={{ cursor: 'pointer', fontSize: '0.6rem', borderColor: 'var(--team-blue)' }} onClick={() => movePlayer(name, 'B')}>
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(255, 115, 0, 0.05)', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(255, 115, 0, 0.2)' }}>
                        <div className="flex-between">
                            <span className="orbitron" style={{ fontSize: '0.6rem', color: 'var(--team-orange)' }}>ORANGE</span>
                            <Sword size={12} color="var(--team-orange)" />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.8rem' }}>
                            {teamB.map(name => (
                                <span key={name} className="roster-tag mono" style={{ cursor: 'pointer', fontSize: '0.6rem', borderColor: 'var(--team-orange)' }} onClick={() => movePlayer(name, 'pool')}>
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-commit orbitron" style={{ flex: 1, height: '36px', fontSize: '0.65rem' }} onClick={autoBalance}>
                        <Zap size={10} style={{ marginRight: '5px' }} /> AUTO
                    </button>
                    <button className="btn-commit orbitron" style={{ flex: 2, height: '36px', fontSize: '0.65rem', background: '#22c55e' }} onClick={handleCommit} disabled={loading}>
                        {loading ? <RefreshCw size={12} className="spin" /> : <><Check size={12} style={{ marginRight: '5px' }} /> CONFIRM</>}
                    </button>
                    <button className="btn-outline btn-red-outline" style={{ height: '36px', padding: '0 10px' }} onClick={() => { setTeamA([]); setTeamB([]); }}>
                        <X size={12} />
                    </button>
                </div>
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
