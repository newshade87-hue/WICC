import React, { useState, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { WICC_MEMBERS, calculatePoints } from './types';
import type { MatchData, MatchFormat } from './types';
import { Save, Zap } from 'lucide-react';

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

        if (error) {
            alert('Error saving match: ' + error.message);
        } else {
            onSave();
            setFormData(prev => ({
                ...prev,
                matchnumber: (parseInt(prev.matchnumber || '0') + 1).toString(),
                teamoneinn1: '0',
                teamoneinn2: '0',
                teamtwoinn1: '0',
                teamtwoinn2: '0',
            }));
        }
        setLoading(false);
    };

    return (
        <div className="glass p-6 glow-a mb-8">
            <h2 className="orbitron text-cyan-400 mb-4 flex items-center gap-2">
                < Zap className="w-5 h-5" /> Record Match
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-slate-400 mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full bg-slate-900 border border-slate-700 p-2 rounded focus:border-cyan-500 outline-none"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-slate-400 mb-1">Match #</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900 border border-slate-700 p-2 rounded focus:border-cyan-500 outline-none mono"
                            value={formData.matchnumber}
                            onChange={e => setFormData({ ...formData, matchnumber: e.target.value })}
                            placeholder="e.g. 01"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            className={`flex-1 p-2 rounded orbitron text-xs ${format === '1-Inning' ? 'bg-cyan-600 shadow-[0_0_10px_rgba(0,162,255,0.5)]' : 'bg-slate-800'}`}
                            onClick={() => setFormat('1-Inning')}
                        >1 Inning</button>
                        <button
                            type="button"
                            className={`flex-1 p-2 rounded orbitron text-xs ${format === '2-Innings' ? 'bg-cyan-600 shadow-[0_0_10px_rgba(0,162,255,0.5)]' : 'bg-slate-800'}`}
                            onClick={() => setFormat('2-Innings')}
                        >2 Innings</button>
                    </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="glass p-4 border-l-4 border-l-cyan-500">
                        <h3 className="text-cyan-400 text-sm mb-2">{formData.teamonename}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-slate-500">INN 1</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-900 border border-slate-700 p-1 rounded mono text-center"
                                    value={formData.teamoneinn1}
                                    onChange={e => setFormData({ ...formData, teamoneinn1: e.target.value })}
                                />
                            </div>
                            {format === '2-Innings' && (
                                <div>
                                    <label className="block text-[10px] text-slate-500">INN 2</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-900 border border-slate-700 p-1 rounded mono text-center"
                                        value={formData.teamoneinn2}
                                        onChange={e => setFormData({ ...formData, teamoneinn2: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-right">
                            <span className="text-xs text-slate-400 mr-2">Total:</span>
                            <span className="orbitron text-xl text-cyan-400">{totals.t1}</span>
                        </div>
                    </div>

                    <div className="glass p-4 border-l-4 border-l-orange-500">
                        <h3 className="text-orange-400 text-sm mb-2">{formData.teamtwoname}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-slate-500">INN 1</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-900 border border-slate-700 p-1 rounded mono text-center"
                                    value={formData.teamtwoinn1}
                                    onChange={e => setFormData({ ...formData, teamtwoinn1: e.target.value })}
                                />
                            </div>
                            {format === '2-Innings' && (
                                <div>
                                    <label className="block text-[10px] text-slate-500">INN 2</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-900 border border-slate-700 p-1 rounded mono text-center"
                                        value={formData.teamtwoinn2}
                                        onChange={e => setFormData({ ...formData, teamtwoinn2: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-right">
                            <span className="text-xs text-slate-400 mr-2">Total:</span>
                            <span className="orbitron text-xl text-orange-400">{totals.t2}</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    <div>
                        <label className="block text-xs uppercase text-slate-400 mb-1">MOM</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 p-2 rounded focus:border-cyan-500 outline-none"
                            value={formData.mom}
                            onChange={e => setFormData({ ...formData, mom: e.target.value })}
                        >
                            <option value="">Select...</option>
                            {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-slate-400 mb-1">MOI Blue</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900 border border-slate-700 p-2 rounded focus:border-cyan-500 outline-none"
                            placeholder="Point of interest"
                            value={formData.moi1}
                            onChange={e => setFormData({ ...formData, moi1: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-slate-400 mb-1">MOI Orange</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900 border border-slate-700 p-2 rounded focus:border-orange-500 outline-none"
                            placeholder="Point of interest"
                            value={formData.moi2}
                            onChange={e => setFormData({ ...formData, moi2: e.target.value })}
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 p-3 rounded orbitron flex items-center justify-center gap-2 transition-all disabled:opacity-50 glow-a"
                        >
                            <Save className="w-4 h-4" /> {loading ? 'SAVING...' : 'SAVE RECORD'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
