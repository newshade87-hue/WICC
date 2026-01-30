import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { WICC_MEMBERS, calculatePoints } from './types';
import type { MatchData, MatchFormat } from './types';
import { X, Calendar as CalendarIcon } from 'lucide-react';

interface MatchFormProps {
    onSave: () => void;
    teamOneName: string;
    teamTwoName: string;
    matchesCount: number;
    editingMatch: MatchData | null;
    onCancel: () => void;
}

export const MatchForm: React.FC<MatchFormProps> = ({ onSave, teamOneName, teamTwoName, matchesCount, editingMatch, onCancel }) => {
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
        teamonepoints: '0',
        teamtwopoints: '0',
        overs: '',
        resulttype: '',
        mom: '',
        mos: '',
        moi1: '',
        moi2: '',
    });

    // Track if user has manually edited points to avoid overwriting
    const [pointsEdited, setPointsEdited] = useState(false);

    useEffect(() => {
        if (editingMatch) {
            setFormData(editingMatch);
            setFormat(editingMatch.innings);
            setPointsEdited(true); // Treat existing records as "edited" so we don't auto-change them on load usually
        } else {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                matchnumber: (matchesCount + 1).toString(),
                teamonename: teamOneName,
                teamtwoname: teamTwoName,
                teamoneinn1: '0',
                teamoneinn2: '0',
                teamtwoinn1: '0',
                teamtwoinn2: '0',
                teamonepoints: '0',
                teamtwopoints: '0',
                overs: '',
                resulttype: '',
                mom: '',
                mos: '',
                moi1: '',
                moi2: '',
            });
            setFormat('1-Inning');
            setPointsEdited(false);
        }
    }, [editingMatch, matchesCount, teamOneName, teamTwoName]);

    // Auto-calculate points logic
    useEffect(() => {
        if (pointsEdited) return;

        const t1 = parseInt(formData.teamoneinn1 || '0') + (format === '2-Innings' ? parseInt(formData.teamoneinn2 || '0') : 0);
        const t2 = parseInt(formData.teamtwoinn1 || '0') + (format === '2-Innings' ? parseInt(formData.teamtwoinn2 || '0') : 0);
        const { pts1, pts2 } = calculatePoints(format, t1, t2);

        setFormData(prev => {
            if (prev.teamonepoints === pts1.toString() && prev.teamtwopoints === pts2.toString()) return prev;
            return {
                ...prev,
                teamonepoints: pts1.toString(),
                teamtwopoints: pts2.toString()
            };
        });
    }, [formData.teamoneinn1, formData.teamoneinn2, formData.teamtwoinn1, formData.teamtwoinn2, format, pointsEdited]);

    const winMargin = useMemo(() => {
        const t1 = parseInt(formData.teamoneinn1 || '0') + (format === '2-Innings' ? parseInt(formData.teamoneinn2 || '0') : 0);
        const t2 = parseInt(formData.teamtwoinn1 || '0') + (format === '2-Innings' ? parseInt(formData.teamtwoinn2 || '0') : 0);

        let winmargin = '';
        if (t1 > t2) winmargin = `${t1 - t2} Runs`;
        else if (t2 > t1) winmargin = `${t2 - t1} Runs`;
        else winmargin = 'Draw';
        return winmargin;
    }, [formData.teamoneinn1, formData.teamoneinn2, formData.teamtwoinn1, formData.teamtwoinn2, format]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Calculate scores for storing
        const t1 = parseInt(formData.teamoneinn1 || '0') + (format === '2-Innings' ? parseInt(formData.teamoneinn2 || '0') : 0);
        const t2 = parseInt(formData.teamtwoinn1 || '0') + (format === '2-Innings' ? parseInt(formData.teamtwoinn2 || '0') : 0);

        const payload = {
            ...formData,
            innings: format,
            teamonename: teamOneName,
            teamtwoname: teamTwoName,
            teamonescore: t1.toString(),
            teamtwoscore: t2.toString(),
            winmargin: winMargin,
        };

        if (editingMatch?.id) {
            const { error } = await supabase.from('wicc_matches').update(payload).eq('id', editingMatch.id);
            if (!error) onSave();
        } else {
            const { error } = await supabase.from('wicc_matches').insert([payload]);
            if (!error) onSave();
        }
        setLoading(false);
    };

    return (
        <div id="match-form" className={`form-card ${editingMatch ? 'editing-active' : ''}`} style={{ transition: 'all 0.5s', border: editingMatch ? '2px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 className="orbitron" style={{ fontSize: '1rem', color: editingMatch ? 'var(--accent-cyan)' : 'white' }}>
                    {editingMatch ? 'EDIT MATCH RECORD' : 'RECORD NEW MATCH'}
                </h3>
                {editingMatch && (
                    <button onClick={onCancel} className="btn-outline btn-red-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '8px' }}>
                        <X size={12} /> CANCEL
                    </button>
                )}
            </div>

            <datalist id="members-list">
                {WICC_MEMBERS.map(m => <option key={m} value={m} />)}
            </datalist>

            <form onSubmit={handleSubmit} onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target instanceof HTMLInputElement && e.target.type !== 'submit') {
                    e.preventDefault();
                    handleSubmit(e as any);
                }
            }}>
                {/* Row 1 */}
                <div className={`form-row ${format === '2-Innings' ? 'form-row-9' : 'form-row-8'}`}>
                    <div className="form-group">
                        <label className="form-label orbitron" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <CalendarIcon size={12} color="var(--accent-cyan)" /> MATCH DATE
                        </label>
                        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MATCH #</label>
                        <input type="number" value={formData.matchnumber} onChange={e => setFormData({ ...formData, matchnumber: e.target.value })} />
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
                        <input type="text" style={{ textAlign: 'center' }} value={formData.overs} onChange={e => setFormData({ ...formData, overs: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">WON BY</label>
                        <div style={{ background: 'var(--input-bg)', padding: '0.7rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{winMargin}</div>
                    </div>
                    <div className="form-group">
                        <button type="submit" className={`btn-commit orbitron ${editingMatch ? 'btn-update' : ''}`} disabled={loading} style={{ background: editingMatch ? 'var(--accent-cyan)' : 'white' }}>
                            {editingMatch ? 'UPDATE' : 'COMMIT'}
                        </button>
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
                        <input list="members-list" value={formData.mom} onChange={e => setFormData({ ...formData, mom: e.target.value })} placeholder="SELECT OR TYPE..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MOI ENTRY 1</label>
                        <input list="members-list" value={formData.moi1} onChange={e => setFormData({ ...formData, moi1: e.target.value })} placeholder="SELECT OR TYPE..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label orbitron">MOI ENTRY 2</label>
                        <input list="members-list" value={formData.moi2} onChange={e => setFormData({ ...formData, moi2: e.target.value })} placeholder="SELECT OR TYPE..." />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                        <label className="form-label orbitron" style={{ color: '#00a2ff' }}>{teamOneName} PTS</label>
                        <input
                            type="number"
                            style={{ textAlign: 'center', background: 'var(--input-bg)', border: '1px solid var(--team-blue)', color: '#00a2ff', fontWeight: '900', fontSize: '1.2rem' }}
                            value={formData.teamonepoints}
                            onChange={e => { setPointsEdited(true); setFormData({ ...formData, teamonepoints: e.target.value }); }}
                        />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                        <label className="form-label orbitron" style={{ color: '#ff7300' }}>{teamTwoName} PTS</label>
                        <input
                            type="number"
                            style={{ textAlign: 'center', background: 'var(--input-bg)', border: '1px solid var(--team-orange)', color: '#ff7300', fontWeight: '900', fontSize: '1.2rem' }}
                            value={formData.teamtwopoints}
                            onChange={e => { setPointsEdited(true); setFormData({ ...formData, teamtwopoints: e.target.value }); }}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};
