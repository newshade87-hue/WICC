import React, { useState, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { WICC_MEMBERS, calculatePoints } from './types';
import type { MatchData, MatchFormat } from './types';

interface MatchFormProps {
    onSave: () => void;
    teamOneName: string;
    teamTwoName: string;
    matchesCount: number;
}

export const MatchForm: React.FC<MatchFormProps> = ({ onSave, teamOneName, teamTwoName, matchesCount }) => {
    const [format, setFormat] = useState<MatchFormat>('1-Inning');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<MatchData>>({
        date: new Date().toISOString().split('T')[0],
        matchnumber: (matchesCount + 1).toString(),
        teamonename: teamOneName,
        teamtwoname: teamTwoName,
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
            teamonename: teamOneName,
            teamtwoname: teamTwoName,
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
                matchnumber: (parseInt(prev.matchnumber || '0') + 1).toString(),
                teamoneinn1: '0',
                teamoneinn2: '0',
                teamtwoinn1: '0',
                teamtwoinn2: '0',
                moi1: '',
                moi2: '',
                mom: ''
            }));
        }
        setLoading(false);
    };

    return (
        <div className="form-card">
            <form onSubmit={handleSubmit}>
                {/* Row 1 */}
                <div className="form-row" style={{ gridTemplateColumns: format === '2-Innings' ? 'repeat(9, 1fr)' : 'repeat(8, 1fr)' }}>
                    <div className="form-group">
                        <label className="form-label orbitron">MATCH DATE</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MATCH #</label>
                        <input type="number" value={formData.matchnumber} onChange={e => setFormData({ ...formData, matchnumber: e.target.value })} placeholder="e.g. 1" />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">FORMAT</label>
                        <select value={format} onChange={e => setFormat(e.target.value as MatchFormat)}>
                            <option value="1-Inning">1 INN</option>
                            <option value="2-Innings">2 INN</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label orbitron" style={{ color: '#00a2ff' }}>{teamOneName} INN 1</label>
                        <input type="number" style={{ textAlign: 'center' }} value={formData.teamoneinn1} onChange={e => setFormData({ ...formData, teamoneinn1: e.target.value })} />
                    </div>

                    {format === '2-Innings' && (
                        <div className="form-group">
                            <label className="form-label orbitron" style={{ color: '#00a2ff' }}>{teamOneName} INN 2</label>
                            <input type="number" style={{ textAlign: 'center' }} value={formData.teamoneinn2} onChange={e => setFormData({ ...formData, teamoneinn2: e.target.value })} />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label orbitron" style={{ color: '#ff7300' }}>{teamTwoName} INN 1</label>
                        <input type="number" style={{ textAlign: 'center' }} value={formData.teamtwoinn1} onChange={e => setFormData({ ...formData, teamtwoinn1: e.target.value })} />
                    </div>

                    {format === '2-Innings' && (
                        <div className="form-group">
                            <label className="form-label orbitron" style={{ color: '#ff7300' }}>{teamTwoName} INN 2</label>
                            <input type="number" style={{ textAlign: 'center' }} value={formData.teamtwoinn2} onChange={e => setFormData({ ...formData, teamtwoinn2: e.target.value })} />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label orbitron">OVERS</label>
                        <input type="text" style={{ textAlign: 'center' }} value={formData.overs} onChange={e => setFormData({ ...formData, overs: e.target.value })} placeholder="e.g. 20.0" />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">WON BY</label>
                        <div style={{ background: 'var(--input-bg)', padding: '0.7rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{totals.winmargin}</div>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn-commit orbitron" disabled={loading}>COMMIT</button>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="form-row">
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                        <span className="orbitron" style={{ color: '#ff7300', fontSize: '0.6rem', fontWeight: '900', textAlign: 'center', display: 'block', marginBottom: '8px' }}>MOM CAPTION</span>
                        <div style={{ background: 'rgba(255, 115, 0, 0.1)', border: '1px solid rgba(255,115,0,0.3)', padding: '0.6rem', borderRadius: '8px', textAlign: 'center' }}>
                            <div className="orbitron" style={{ fontWeight: 'black', fontSize: '1rem', color: '#ff7300' }}>MOM</div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MOM ENTRY</label>
                        <select value={formData.mom} onChange={e => setFormData({ ...formData, mom: e.target.value })}>
                            <option value="">SELECT PLAYER</option>
                            {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MOI ENTRY 1</label>
                        <select value={formData.moi1} onChange={e => setFormData({ ...formData, moi1: e.target.value })}>
                            <option value="">SELECT PLAYER</option>
                            {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MOI ENTRY 2</label>
                        <select value={formData.moi2} onChange={e => setFormData({ ...formData, moi2: e.target.value })}>
                            <option value="">SELECT PLAYER</option>
                            {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                        <label className="form-label orbitron" style={{ color: '#00a2ff' }}>{teamOneName} PTS</label>
                        <div style={{ background: 'var(--input-bg)', border: '1px solid var(--team-blue)', padding: '0.6rem', borderRadius: '8px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', color: '#00a2ff', boxShadow: '0 0 15px rgba(0, 162, 255, 0.2)' }}>{totals.pts1}</div>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                        <label className="form-label orbitron" style={{ color: '#ff7300' }}>{teamTwoName} PTS</label>
                        <div style={{ background: 'var(--input-bg)', border: '1px solid var(--team-orange)', padding: '0.6rem', borderRadius: '8px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', color: '#ff7300', boxShadow: '0 0 15px rgba(255, 115, 0, 0.2)' }}>{totals.pts2}</div>
                    </div>
                </div>
            </form>
        </div>
    );
};
