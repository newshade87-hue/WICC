import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Lock, Unlock, Trophy, Zap, Star, Award, Shield } from 'lucide-react';

export const AwardsHub: React.FC<{ onUpdate: () => void, seriesData: any }> = ({ onUpdate, seriesData }) => {
    const [editing, setEditing] = useState(false);
    const [awards, setAwards] = useState({ mos: '', mvp: '', wickets: '', runs: '', catches: '' });
    const [dynamicMembers, setDynamicMembers] = useState<string[]>([]);

    useEffect(() => {
        if (seriesData?.awards) setAwards(seriesData.awards);
        fetchDynamicMembers();
    }, [seriesData]);

    const fetchDynamicMembers = async () => {
        // Fetch MOM, MOS, MOI names from matches to augment WICC_MEMBERS
        const { data: matches } = await supabase.from('wicc_matches').select('mom, mos, moi1, moi2');
        const { data: history } = await supabase.from('wicc_series_history').select('awards');

        const names = new Set(WICC_MEMBERS);
        if (matches) {
            matches.forEach(m => {
                if (m.mom) names.add(m.mom);
                if (m.mos) names.add(m.mos);
                if (m.moi1) names.add(m.moi1);
                if (m.moi2) names.add(m.moi2);
            });
        }
        if (history) {
            history.forEach(h => {
                if (h.awards?.mos) names.add(h.awards.mos);
                if (h.awards?.mvp) names.add(h.awards.mvp);
                if (h.awards?.wickets) names.add(h.awards.wickets);
                if (h.awards?.runs) names.add(h.awards.runs);
                if (h.awards?.catches) names.add(h.awards.catches);
            });
        }
        setDynamicMembers(Array.from(names).sort());
    };

    const handleSaveAwards = async () => {
        const { error } = await supabase.from('wicc_series').update({ awards }).eq('id', seriesData.id);
        if (!error) { setEditing(false); onUpdate(); }
    };

    const AwardCard = ({ label, value, field, icon: Icon, color, glowClass }: any) => (
        <div className={`award-item ${glowClass}`}>
            <div className="flex-between" style={{ marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}>
                <span className="orbitron" style={{ fontSize: '0.65rem', fontWeight: '950', color, textShadow: `0 0 10px ${color}66` }}>{label}</span>
                <Icon size={18} color={color} style={{ filter: `drop-shadow(0 0 8px ${color}66)` }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
                {editing ? (
                    <>
                        <input
                            list="dynamic-members-list"
                            style={{
                                width: '100%',
                                fontSize: '0.75rem',
                                background: 'rgba(0,0,0,0.5)',
                                border: `1px solid ${color}44`,
                                color: 'white',
                                padding: '0.5rem',
                                borderRadius: '4px'
                            }}
                            value={value}
                            placeholder="Type or select..."
                            onChange={e => setAwards({ ...awards, [field]: e.target.value })}
                        />
                        <datalist id="dynamic-members-list">
                            {dynamicMembers.map(m => <option key={m} value={m} />)}
                        </datalist>
                    </>
                ) : (
                    <div className="flex-between">
                        <span className="orbitron" style={{ fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '0.05em', color: '#f8fafc' }}>{value || 'PENDING'}</span>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: value ? color : 'rgba(255,255,255,0.1)',
                            boxShadow: value ? `0 0 12px ${color}` : 'none',
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
                <h2 className="orbitron" style={{ color: '#ff7300', fontSize: '1.6rem', fontWeight: '950', textShadow: '0 0 20px rgba(255, 115, 0, 0.3)' }}>SERIES AWARDS</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <span className="orbitron" style={{ fontSize: '0.6rem', color: '#64748b', letterSpacing: '0.4em' }}>LIVE STATS HUB</span>
                    <button
                        onClick={() => editing ? handleSaveAwards() : setEditing(true)}
                        className="btn-outline"
                        style={{
                            padding: '0.5rem 1rem',
                            borderColor: editing ? '#22c55e' : 'rgba(255,255,255,0.1)',
                            color: editing ? '#22c55e' : '#94a3b8'
                        }}
                    >
                        {editing ? <Unlock size={14} /> : <Lock size={14} />}
                        <span style={{ fontSize: '10px' }}>{editing ? 'SAVE' : 'EDIT'}</span>
                    </button>
                </div>
            </div>
            <div className="awards-grid">
                <AwardCard label="MAN OF SERIES 🧢" value={awards.mos} field="mos" icon={Trophy} color="#ff7300" glowClass="award-orange" />
                <AwardCard label="SERIES MVP ⭐" value={awards.mvp} field="mvp" icon={Zap} color="#00e5ff" glowClass="award-blue" />
                <AwardCard label="MOST WICKETS" value={awards.wickets} field="wickets" icon={Shield} color="#ef4444" glowClass="award-red" />
                <AwardCard label="MOST RUNS" value={awards.runs} field="runs" icon={Star} color="#22c55e" glowClass="award-green" />
                <AwardCard label="MOST CATCHES" value={awards.catches} field="catches" icon={Award} color="#eab308" glowClass="award-yellow" />
            </div>
        </div>
    );
};
