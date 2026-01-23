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

    const AwardCard = ({ label, value, field, icon: Icon, color }: any) => (
        <div className="award-item" style={{ borderBottom: `2px solid ${color}` }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <span className="orbitron" style={{ fontSize: '0.6rem', fontWeight: '900', color }}>{label}</span>
                <Icon size={14} color={color} style={{ opacity: 0.5 }} />
            </div>
            {editing ? (
                <select style={{ width: '100%', fontSize: '0.7rem' }} value={value} onChange={e => setAwards({ ...awards, [field]: e.target.value })}>
                    <option value="">NAME</option>
                    {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            ) : (
                <div className="flex-between">
                    <span className="orbitron" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{value || 'NAME'}</span>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: value ? '#00e5ff' : '#334155' }}></div>
                </div>
            )}
        </div>
    );

    return (
        <div className="awards-hub">
            <div className="flex-between">
                <h2 className="orbitron" style={{ color: '#ff7300', fontSize: '1.5rem', fontWeight: '900' }}>SERIES AWARDS HUB</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="orbitron" style={{ fontSize: '0.6rem', color: '#475569' }}>SUPABASE CLOUD LIVE</span>
                    <button onClick={() => editing ? handleSaveAwards() : setEditing(true)} style={{ background: '#000', border: '1px solid #1e293b', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                        {editing ? <Unlock size={16} color="#4ade80" /> : <Lock size={16} color="#475569" />}
                    </button>
                </div>
            </div>
            <div className="awards-grid">
                <AwardCard label="MOS 🧢" value={awards.mos} field="mos" icon={Trophy} color="#ff7300" />
                <AwardCard label="MVP ⭐" value={awards.mvp} field="mvp" icon={Zap} color="#00e5ff" />
                <AwardCard label="MOST WICKETS" value={awards.wickets} field="wickets" icon={Shield} color="#ef4444" />
                <AwardCard label="MOST RUNS" value={awards.runs} field="runs" icon={Star} color="#22c55e" />
                <AwardCard label="MOST CATCHES" value={awards.catches} field="catches" icon={Award} color="#eab308" />
            </div>
        </div>
    );
};
