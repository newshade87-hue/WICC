import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trophy, Calendar, Zap, Star, Award, Shield, X, History } from 'lucide-react';

export const HistoryView: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (!isOpen) return null;

    return (
        <div className="history-modal">
            <div className="container">
                <div className="flex-between" style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <History size={32} color="var(--accent-cyan)" />
                        <h1 className="orbitron" style={{ fontSize: '2rem', fontWeight: '950', textShadow: '0 0 20px rgba(0, 229, 255, 0.4)' }}>SERIES HISTORY</h1>
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
                            <div key={record.id} className="history-card">
                                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                    <div className="badge badge-blue">
                                        <Calendar size={12} style={{ marginRight: '6px' }} />
                                        {new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}
                                    </div>
                                    <Trophy size={20} color={record.winner.includes('BLUE') ? 'var(--team-blue)' : 'var(--team-orange)'} />
                                </div>

                                <h3 className="orbitron" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: record.winner.includes('BLUE') ? 'var(--team-blue)' : 'var(--team-orange)' }}>
                                    WINNER: {record.winner}
                                </h3>

                                <div className="flex-between" style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                                    <div className="orbitron" style={{ fontSize: '0.8rem' }}>BLUE: {record.points_a} PTS</div>
                                    <div className="orbitron" style={{ fontSize: '0.8rem', opacity: 0.5 }}>VS</div>
                                    <div className="orbitron" style={{ fontSize: '0.8rem' }}>ORANGE: {record.points_b} PTS</div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="award-tiny">
                                        <Star size={10} color="#ff7300" />
                                        <span className="orbitron" style={{ fontSize: '0.55rem' }}>MOS: {record.awards?.mos || 'N/A'}</span>
                                    </div>
                                    <div className="award-tiny">
                                        <Zap size={10} color="#00e5ff" />
                                        <span className="orbitron" style={{ fontSize: '0.55rem' }}>MVP: {record.awards?.mvp || 'N/A'}</span>
                                    </div>
                                    <div className="award-tiny">
                                        <Shield size={10} color="#ef4444" />
                                        <span className="orbitron" style={{ fontSize: '0.55rem' }}>WKTS: {record.awards?.wickets || 'N/A'}</span>
                                    </div>
                                    <div className="award-tiny">
                                        <Award size={10} color="#22c55e" />
                                        <span className="orbitron" style={{ fontSize: '0.55rem' }}>RUNS: {record.awards?.runs || 'N/A'}</span>
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
