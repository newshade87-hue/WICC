import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Lock, Unlock, Trophy, Zap, Star, Award, Shield } from 'lucide-react';
import { WICC_MEMBERS } from './types';

export const AwardsHub: React.FC<{ onUpdate: () => void, seriesData: any }> = ({ onUpdate, seriesData }) => {
    const [editing, setEditing] = useState(false);
    const [awards, setAwards] = useState({ mos: '', mvp: '', wickets: '', runs: '', catches: '' });

    useEffect(() => { if (seriesData?.awards) setAwards(seriesData.awards); }, [seriesData]);

    const handleSaveAwards = async () => {
        const { error } = await supabase.from('wicc_series').update({ awards }).eq('id', seriesData.id);
        if (!error) { setEditing(false); onUpdate(); }
    };

    const AwardCard = ({ label, value, field, icon: Icon, color, glowClass }: any) => (
        <div className={`award-item ${glowClass}`}>
            <div className="flex-between" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                <span className="orbitron" style={{ fontSize: '0.65rem', fontWeight: '900', color, textShadow: `0 0 10px ${color}66` }}>{label}</span>
                <Icon size={18} color={color} style={{ filter: `drop-shadow(0 0 8px ${color}66)` }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
                {editing ? (
                    <select
                        style={{ width: '100%', fontSize: '0.75rem', background: '#000', border: `1px solid ${color}44`, color: 'white' }}
                        value={value}
                        onChange={e => setAwards({ ...awards, [field]: e.target.value })}
                    >
                        <option value="">NAME</option>
                        {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                ) : (
                    <div className="flex-between">
                        <span className="orbitron" style={{ fontSize: '0.95rem', fontWeight: 'bold', letterSpacing: '0.05em', color: '#f8fafc' }}>{value || 'NAME'}</span>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: value ? color : '#334155',
                            boxShadow: value ? `0 0 15px ${color}` : 'none',
                            transition: 'all 0.3s'
                        }}></div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="awards-hub">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <h2 className="orbitron" style={{ color: '#ff7300', fontSize: '1.8rem', fontWeight: '900', textShadow: '0 0 20px rgba(255, 115, 0, 0.4)' }}>SERIES AWARDS HUB</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <span className="orbitron" style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.3em' }}>SUPABASE CLOUD LIVE</span>
                    <button onClick={() => editing ? handleSaveAwards() : setEditing(true)} style={{ background: '#0f172a', border: '1px solid #334155', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s shadow' }}>
                        {editing ? <Unlock size={18} color="#4ade80" /> : <Lock size={18} color="#94a3b8" />}
                    </button>
                </div>
            </div>
            <div className="awards-grid">
                <AwardCard label="MOS 🧢" value={awards.mos} field="mos" icon={Trophy} color="#ff7300" glowClass="award-orange" />
                <AwardCard label="MVP ⭐" value={awards.mvp} field="mvp" icon={Zap} color="#00e5ff" glowClass="award-blue" />
                <AwardCard label="MOST WICKETS" value={awards.wickets} field="wickets" icon={Shield} color="#ef4444" glowClass="award-red" />
                <AwardCard label="MOST RUNS" value={awards.runs} field="runs" icon={Star} color="#22c55e" glowClass="award-green" />
                <AwardCard label="MOST CATCHES" value={awards.catches} field="catches" icon={Award} color="#eab308" glowClass="award-yellow" />
            </div>
        </div>
    );
};
