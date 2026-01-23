import React, { useState, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { WICC_MEMBERS, calculatePoints } from './types';
import type { MatchData, MatchFormat } from './types';

export const MatchForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const [format, setFormat] = useState<MatchFormat>('1-Inning');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<MatchData>>({
        date: new Date().toISOString().split('T')[0],
        matchnumber: '',
        teamonename: 'Team Blue',
        teamtwoname: 'Team Orange',
        teamoneinn1: '0',
        teamoneinn2: '0',
        teamtwoinn1: '0',
        teamtwoinn2: '0',
        overs: '',
        resulttype: '',
        mom: '',
        mos: '',
        moi1: '',
        moi2: '',
    });

    const totals = useMemo(() => {
        const t1 = parseInt(formData.teamoneinn1 || '0') + (format === '2-Innings' ? parseInt(formData.teamoneinn2 || '0') : 0);
        const t2 = parseInt(formData.teamtwoinn1 || '0') + (format === '2-Innings' ? parseInt(formData.teamtwoinn2 || '0') : 0);
        const { pts1, pts2 } = calculatePoints(format, t1, t2);

        let winmargin = '';
        if (t1 > t2) winmargin = `${t1 - t2} Runs`;
        else if (t2 > t1) winmargin = `${t2 - t1} Runs`;
        else winmargin = 'Draw';

        return { t1, t2, pts1, pts2, winmargin };
    }, [formData, format]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            ...formData,
            innings: format,
            teamonescore: totals.t1.toString(),
            teamtwoscore: totals.t2.toString(),
            teamonepoints: totals.pts1.toString(),
            teamtwopoints: totals.pts2.toString(),
            winmargin: totals.winmargin,
        };
        const { error } = await supabase.from('wicc_matches').insert([payload]);
        if (!error) {
            onSave();
            setFormData(prev => ({
                ...prev,
                matchnumber: prev.matchnumber ? (parseInt(prev.matchnumber) + 1).toString() : '1',
                teamoneinn1: '0',
                teamoneinn2: '0',
                teamtwoinn1: '0',
                teamtwoinn2: '0',
            }));
        }
        setLoading(false);
    };

    return (
        <div className="form-card">
            <form onSubmit={handleSubmit}>
                {/* Row 1 */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label orbitron">MATCH DATE</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">FORMAT</label>
                        <select value={format} onChange={e => setFormat(e.target.value as MatchFormat)}>
                            <option value="1-Inning">1 INN</option>
                            <option value="2-Innings">2 INN</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron" style={{ color: '#00a2ff' }}>TEAM BLUE</label>
                        <input type="number" style={{ textAlign: 'center', fontSize: '1.2rem' }} value={formData.teamoneinn1} onChange={e => setFormData({ ...formData, teamoneinn1: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron" style={{ color: '#ff7300' }}>TEAM ORANGE</label>
                        <input type="number" style={{ textAlign: 'center', fontSize: '1.2rem' }} value={formData.teamtwoinn1} onChange={e => setFormData({ ...formData, teamtwoinn1: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">OVERS</label>
                        <input type="text" style={{ textAlign: 'center' }} value={formData.overs} onChange={e => setFormData({ ...formData, overs: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MARGIN</label>
                        <div style={{ background: '#000', padding: '0.6rem', border: '1px solid #333', borderRadius: '6px', textAlign: 'center', fontSize: '0.7rem' }}>{totals.winmargin}</div>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn-commit orbitron" disabled={loading}>COMMIT</button>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="form-row">
                    <div className="form-group">
                        <div style={{ background: 'rgba(255, 115, 0, 0.1)', border: '1px solid rgba(255,115,0,0.2)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                            <span className="orbitron" style={{ color: '#ff7300', fontSize: '0.6rem', fontWeight: '900' }}>MOM CAPTION</span>
                            <div className="orbitron" style={{ fontWeight: 'black', fontSize: '1.2rem', marginTop: '0.2rem' }}>MOM</div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MOM ENTRY 1</label>
                        <select style={{ fontSize: '0.7rem' }} value={formData.mom} onChange={e => setFormData({ ...formData, mom: e.target.value })}>
                            <option value="">NAME</option>
                            {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MOI ENTRY 1</label>
                        <input type="text" placeholder="MOI 1" value={formData.moi1} onChange={e => setFormData({ ...formData, moi1: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MOI ENTRY 2</label>
                        <input type="text" placeholder="MOI 2" value={formData.moi2} onChange={e => setFormData({ ...formData, moi2: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                        <label className="form-label orbitron" style={{ color: '#00a2ff' }}>TEAM BLUE PTS</label>
                        <div style={{ background: '#000', border: '1px solid var(--team-blue)', padding: '0.6rem', borderRadius: '6px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', color: '#00a2ff' }}>{totals.pts1}</div>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                        <label className="form-label orbitron" style={{ color: '#ff7300' }}>TEAM ORANGE PTS</label>
                        <div style={{ background: '#000', border: '1px solid var(--team-orange)', padding: '0.6rem', borderRadius: '6px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', color: '#ff7300' }}>{totals.pts2}</div>
                    </div>
                </div>
            </form>
        </div>
    );
};
