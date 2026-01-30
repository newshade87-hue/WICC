import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Users, Shield, Sword, RefreshCw, Check, X, Edit3, Plus, Trash, GripVertical, Zap, Wind, Activity, Target } from 'lucide-react';
import { type PlayerProfile } from './types';

export const TeamPicker: React.FC<{ isOpen: boolean, onClose: () => void, onComplete: () => void }> = ({ isOpen, onClose, onComplete }) => {
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [teamA, setTeamA] = useState<string[]>([]);
    const [teamB, setTeamB] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null);

    const [quickAddName, setQuickAddName] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchPlayers();
            fetchCurrentTeams();
        }
    }, [isOpen]);

    const fetchCurrentTeams = async () => {
        const { data } = await supabase.from('wicc_members').select('*');
        if (data) {
            setTeamA(data.filter(m => m.team === 'blue').map(m => m.name));
            setTeamB(data.filter(m => m.team === 'orange').map(m => m.name));
        }
    };

    const fetchPlayers = async () => {
        const { data } = await supabase.from('wicc_players').select('*').order('name');
        if (data) setPlayers(data);
    };

    if (!isOpen) return null;

    const movePlayerTo = (name: string, target: 'A' | 'B' | 'pool') => {
        setTeamA(prev => prev.filter(p => p !== name));
        setTeamB(prev => prev.filter(p => p !== name));

        if (target === 'A') setTeamA(prev => [...prev, name]);
        if (target === 'B') setTeamB(prev => [...prev, name]);
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, name: string) => {
        e.dataTransfer.setData('playerName', name);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Allow drop
    };

    const handleDrop = (e: React.DragEvent, target: 'A' | 'B' | 'pool') => {
        e.preventDefault();
        const name = e.dataTransfer.getData('playerName');
        if (name) movePlayerTo(name, target);
    };

    const handleSavePlayer = async (player: PlayerProfile) => {
        if (!player.name) {
            alert("Name is required!");
            return;
        }
        setLoading(true);
        // If it's a new player (no ID), exclude ID from upsert so Postgres generates it
        const { id, ...newPlayerData } = player;
        const payload = player.id ? player : newPlayerData;

        const { error } = await supabase.from('wicc_players').upsert(payload);
        if (!error) {
            setEditingPlayer(null);
            setEditMode(false);
            fetchPlayers();
        } else {
            alert("Error saving: " + error.message);
        }
        setLoading(false);
    };

    const handleQuickAdd = async () => {
        if (!quickAddName.trim()) return;
        setLoading(true);
        const { error } = await supabase.from('wicc_players').insert({
            name: quickAddName.trim(),
            role: 'All Rounder',
            department: 'New Player',
            sports: ['cricket']
        });

        if (!error) {
            setQuickAddName('');
            fetchPlayers();
        } else {
            alert('Error adding player: ' + error.message);
        }
        setLoading(false);
    };

    const handleDeletePlayer = async (id: string) => {
        if (window.confirm('Delete this player permanently?')) {
            const { error } = await supabase.from('wicc_players').delete().eq('id', id);
            if (!error) {
                setEditingPlayer(null);
                fetchPlayers();
            }
        }
    };

    const handleCommit = async () => {
        setLoading(true);
        await supabase.from('wicc_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const newMembers = [
            ...teamA.map(name => ({ name, team: 'blue' })),
            ...teamB.map(name => ({ name, team: 'orange' }))
        ];
        // @ts-ignore
        const { error } = await supabase.from('wicc_members').insert(newMembers);
        if (!error) {
            onComplete();
            onClose();
        }
        setLoading(false);
    };

    const ROLE_OPTIONS = ['All Rounder', 'Fast Bowler', 'Medium Bowler', 'Batting Only', 'Spinner'];

    const getRoleIcon = (role?: string) => {
        switch (role) {
            case 'All Rounder': return <Zap size={10} color="#fbbf24" />;
            case 'Fast Bowler': return <Activity size={10} color="#f87171" />;
            case 'Medium Bowler': return <Wind size={10} color="#60a5fa" />;
            case 'Batting Only': return <Target size={10} color="#4ade80" />;
            case 'Spinner': return <RefreshCw size={10} color="#a78bfa" />;
            default: return <Users size={10} color="#94a3b8" />;
        }
    };

    const renderPlayerTag = (name: string, location: 'pool' | 'A' | 'B') => {
        const p = players.find(pl => pl.name === name) || { name, role: 'All Rounder' } as PlayerProfile;

        return (
            <div
                key={name}
                draggable={!editMode}
                onDragStart={(e) => handleDragStart(e, name)}
                style={{ position: 'relative' }}
            >
                <span
                    className="roster-tag mono player-tag"
                    onClick={() => !editMode && movePlayerTo(name, location === 'pool' ? 'A' : (location === 'A' ? 'B' : 'pool'))}
                    style={{
                        cursor: editMode ? 'default' : 'grab',
                        borderColor: location === 'A' ? 'var(--team-blue)' : (location === 'B' ? 'var(--team-orange)' : undefined),
                        opacity: editMode ? 1 : 1
                    }}
                >
                    {!editMode && <GripVertical size={10} style={{ opacity: 0.3, marginRight: 2 }} />}
                    {/* @ts-ignore */}
                    <span style={{ marginRight: 4, display: 'flex', alignItems: 'center' }}>{getRoleIcon(p.role)}</span>
                    {name}
                </span>
                {editMode && (
                    <div style={{ position: 'absolute', top: -8, right: -8, display: 'flex', gap: '2px', zIndex: 20 }}>
                        <div
                            onClick={(e) => { e.stopPropagation(); setEditingPlayer(p as PlayerProfile); }}
                            style={{ background: 'var(--accent-cyan)', borderRadius: '50%', padding: '3px', cursor: 'pointer', border: '1px solid black' }}
                        >
                            <Edit3 size={10} color="black" />
                        </div>
                        {p.id && (
                            <div
                                onClick={(e) => { e.stopPropagation(); handleDeletePlayer(p.id!); }}
                                style={{ background: '#ef4444', borderRadius: '50%', padding: '3px', cursor: 'pointer', border: '1px solid black' }}
                            >
                                <X size={10} color="white" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="team-picker-widget">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
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

            {editingPlayer && (
                <div className="card" style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid var(--accent-cyan)', background: 'rgba(0,0,0,0.8)', zIndex: 10 }}>
                    <h3 className="orbitron" style={{ fontSize: '0.7rem', marginBottom: '0.8rem' }}>{editingPlayer.id ? 'EDIT PLAYER' : 'NEW PLAYER'}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <input
                            placeholder="Name"
                            value={editingPlayer.name}
                            onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                        />
                        <input
                            placeholder="Department (Display Text)"
                            value={editingPlayer.department}
                            onChange={e => setEditingPlayer({ ...editingPlayer, department: e.target.value })}
                        />
                        <div>
                            <label className="form-label">Role</label>
                            <select
                                value={editingPlayer.role}
                                // @ts-ignore
                                onChange={e => setEditingPlayer({ ...editingPlayer, role: e.target.value })}
                                style={{ width: '100%', fontSize: '0.8rem' }}
                            >
                                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button onClick={() => handleSavePlayer(editingPlayer)} className="btn-commit orbitron" style={{ flex: 2, fontSize: '0.7rem', background: '#22c55e', color: 'white' }}>SAVE</button>
                            {editingPlayer.id && (
                                <button onClick={() => handleDeletePlayer(editingPlayer.id!)} className="btn-outline btn-red-outline" style={{ flex: 0.5, padding: 0, justifyContent: 'center' }}>
                                    <Trash size={14} />
                                </button>
                            )}
                            <button onClick={() => setEditingPlayer(null)} className="btn-outline btn-red-outline" style={{ flex: 1, fontSize: '0.7rem' }}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                {/* Pool Drop Zone */}
                <div
                    className={`pool-section ${editMode ? 'edit-mode-active' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'pool')}
                    style={{
                        minHeight: '120px',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '0.8rem',
                        borderRadius: '12px',
                        border: '1px dashed rgba(255,255,255,0.1)'
                    }}
                >
                    <div className="flex-between">
                        <span className="orbitron" style={{ fontSize: '0.65rem', opacity: 0.6 }}>AVAILABLE PLAYERS</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                placeholder="Add & Enter..."
                                value={quickAddName}
                                onChange={e => setQuickAddName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleQuickAdd(); }}
                                style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--accent-cyan)',
                                    color: 'var(--accent-cyan)',
                                    fontSize: '0.7rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    width: '120px'
                                }}
                            />
                            <button
                                onClick={handleQuickAdd}
                                className="btn-outline btn-blue-outline"
                                style={{ padding: '2px 6px', height: '24px', fontSize: '10px' }}
                            >
                                <Plus size={10} />
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.8rem' }}>
                        {players.filter(p => !teamA.includes(p.name) && !teamB.includes(p.name)).map(p => renderPlayerTag(p.name, 'pool'))}
                    </div>
                </div>

                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
                    {/* Team A Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'A')}
                        style={{ background: 'rgba(0, 162, 255, 0.05)', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(0, 162, 255, 0.2)' }}
                    >
                        <div className="flex-between">
                            <span className="orbitron" style={{ fontSize: '0.6rem', color: 'var(--team-blue)' }}>BLUE</span>
                            <Shield size={12} color="var(--team-blue)" />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.8rem' }}>
                            {teamA.map(name => renderPlayerTag(name, 'A'))}
                        </div>
                    </div>

                    {/* Team B Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'B')}
                        style={{ background: 'rgba(255, 115, 0, 0.05)', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(255, 115, 0, 0.2)' }}
                    >
                        <div className="flex-between">
                            <span className="orbitron" style={{ fontSize: '0.6rem', color: 'var(--team-orange)' }}>ORANGE</span>
                            <Sword size={12} color="var(--team-orange)" />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.8rem' }}>
                            {teamB.map(name => renderPlayerTag(name, 'B'))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button className="btn-commit orbitron" style={{ flex: 1, height: '40px', fontSize: '0.8rem', background: '#22c55e', color: 'white' }} onClick={handleCommit} disabled={loading}>
                        {loading ? <RefreshCw size={14} className="spin" /> : <><Check size={14} style={{ marginRight: '6px' }} /> CONFIRM TEAMS</>}
                    </button>
                    <button className="btn-outline btn-red-outline" style={{ height: '40px', padding: '0 12px' }} onClick={() => { setTeamA([]); setTeamB([]); }}>
                        <Trash size={14} />
                    </button>
                </div>
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .player-tag { display: flex; align-items: center; gap: 4px; transition: transform 0.1s; }
                .player-tag:active { transform: scale(0.95); }
                .edit-mode-active { border-color: var(--accent-cyan) !important; background: rgba(0, 229, 255, 0.05) !important; }
            `}</style>
        </div>
    );
};
