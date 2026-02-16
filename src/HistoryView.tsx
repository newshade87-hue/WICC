x`import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trophy, Calendar, Zap, Star, Award, Shield, X, History, Trash2, Edit2, Check } from 'lucide-react';

export const HistoryView: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<any>({});

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('wicc_series_history')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setHistory(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('PERMANENTLY DELETE this archive? This cannot be undone.')) {
            const { error } = await supabase.from('wicc_series_history').delete().eq('id', id);
            if (!error) fetchHistory();
        }
    };

    const handleEdit = (record: any) => {
        setEditingId(record.id);
        setEditValues({
            winner: record.winner,
            points_a: record.points_a,
            points_b: record.points_b,
            mos: record.awards?.mos || '',
            mvp: record.awards?.mvp || '',
            wickets: record.awards?.wickets || '',
            runs: record.awards?.runs || ''
        });
    };

    const handleSaveEdit = async () => {
        const updatedAwards = {
            ...history.find(h => h.id === editingId).awards,
            mos: editValues.mos,
            mvp: editValues.mvp,
            wickets: editValues.wickets,
            runs: editValues.runs
        };

        const { error } = await supabase
            .from('wicc_series_history')
            .update({
                winner: editValues.winner,
                points_a: editValues.points_a,
                points_b: editValues.points_b,
                awards: updatedAwards
            })
            .eq('id', editingId);

        if (!error) {
            setEditingId(null);
            fetchHistory();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="history-modal">
            <div className="container">
                <div className="flex-between" style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <History size={32} color="var(--accent-cyan)" />
                        <h1 className="orbitron" style={{ fontSize: '2rem', fontWeight: '950', color: 'var(--text-primary)' }}>SERIES HISTORY</h1>
                    </div>
                    <button onClick={onClose} className="btn-outline btn-red-outline" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}>
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="orbitron" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-secondary)' }}>LOADING ARCHIVES...</div>
                ) : history.length === 0 ? (
                    <div className="orbitron" style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-secondary)' }}>NO ARCHIVED SERIES FOUND</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {history.map((record) => (
                            <div key={record.id} className={`history-card ${record.winner.includes('BLUE') ? 'card-animate-blue' : 'card-animate-orange'}`}>
                                <div className="flex-between" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                                    <div className="badge badge-blue">
                                        <Calendar size={12} style={{ marginRight: '6px' }} />
                                        {new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                                        {editingId === record.id ? (
                                            <Check size={18} className="text-green-500 cursor-pointer" onClick={handleSaveEdit} />
                                        ) : (
                                            <Edit2 size={16} className="text-cyan-500 cursor-pointer opacity-50 hover:opacity-100" onClick={() => handleEdit(record)} />
                                        )}
                                        <Trash2 size={16} className="text-red-500 cursor-pointer opacity-50 hover:opacity-100" onClick={() => handleDelete(record.id)} />
                                        <Trophy size={18} color={record.winner.includes('BLUE') ? 'var(--team-blue)' : 'var(--team-orange)'} />
                                    </div>
                                </div>

                                {editingId === record.id ? (
                                    <input
                                        className="orbitron"
                                        style={{ background: 'var(--input-bg)', border: '1px solid var(--accent-cyan)', color: 'var(--text-primary)', width: '100%', marginBottom: '0.5rem', padding: '0.2rem' }}
                                        value={editValues.winner}
                                        onChange={e => setEditValues({ ...editValues, winner: e.target.value })}
                                    />
                                ) : (
                                    <h3 className="orbitron" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: record.winner.includes('BLUE') ? 'var(--team-blue)' : 'var(--team-orange)' }}>
                                        WINNER: {record.winner}
                                    </h3>
                                )}

                                <div className="flex-between" style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                                    {editingId === record.id ? (
                                        <>
                                            <input type="number" style={{ width: '40px', background: 'transparent', border: 'none', borderBottom: '1px solid gray', color: 'var(--text-primary)' }} value={editValues.points_a} onChange={e => setEditValues({ ...editValues, points_a: e.target.value })} />
                                            <div className="orbitron" style={{ fontSize: '0.8rem', opacity: 0.5 }}>VS</div>
                                            <input type="number" style={{ width: '40px', background: 'transparent', border: 'none', borderBottom: '1px solid gray', color: 'var(--text-primary)' }} value={editValues.points_b} onChange={e => setEditValues({ ...editValues, points_b: e.target.value })} />
                                        </>
                                    ) : (
                                        <>
                                            <div className="orbitron" style={{ fontSize: '0.8rem' }}>{record.team_a_name || 'BLUE'}: {record.points_a} PTS</div>
                                            <div className="orbitron" style={{ fontSize: '0.8rem', opacity: 0.5 }}>VS</div>
                                            <div className="orbitron" style={{ fontSize: '0.8rem' }}>{record.team_b_name || 'ORANGE'}: {record.points_b} PTS</div>
                                        </>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="award-tiny" style={{ background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.2)' }}>
                                        <Star size={12} color="#ffcc00" />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="orbitron" style={{ fontSize: '0.5rem', opacity: 0.7 }}>MOS</span>
                                            {editingId === record.id ? (
                                                <input style={{ background: 'transparent', border: 'none', color: '#ffcc00', fontSize: '0.8rem', fontWeight: 'bold' }} value={editValues.mos} onChange={e => setEditValues({ ...editValues, mos: e.target.value })} />
                                            ) : (
                                                <span className="orbitron" style={{ fontSize: '1.2rem', fontWeight: '950', color: record.winner.includes('BLUE') ? 'var(--team-blue)' : 'var(--team-orange)' }}>{record.awards?.mos || 'N/A'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="award-tiny">
                                        <Zap size={10} color="#00e5ff" />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="orbitron" style={{ fontSize: '0.55rem' }}>MVP</span>
                                            {editingId === record.id ? (
                                                <input style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.6rem' }} value={editValues.mvp} onChange={e => setEditValues({ ...editValues, mvp: e.target.value })} />
                                            ) : (
                                                <span className="orbitron" style={{ fontSize: '0.7rem' }}>{record.awards?.mvp || 'N/A'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="award-tiny">
                                        <Shield size={10} color="#ef4444" />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="orbitron" style={{ fontSize: '0.55rem' }}>WKTS</span>
                                            {editingId === record.id ? (
                                                <input style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.6rem' }} value={editValues.wickets} onChange={e => setEditValues({ ...editValues, wickets: e.target.value })} />
                                            ) : (
                                                <span className="orbitron" style={{ fontSize: '0.7rem' }}>{record.awards?.wickets || 'N/A'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="award-tiny">
                                        <Award size={10} color="#22c55e" />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="orbitron" style={{ fontSize: '0.55rem' }}>RUNS</span>
                                            {editingId === record.id ? (
                                                <input style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.6rem' }} value={editValues.runs} onChange={e => setEditValues({ ...editValues, runs: e.target.value })} />
                                            ) : (
                                                <span className="orbitron" style={{ fontSize: '0.7rem', color: 'var(--text-primary)' }}>{record.awards?.runs || 'N/A'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .award-tiny {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.03);
                    padding: 4px 8px;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};
