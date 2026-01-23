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
        <div className="card-glass p-8 mb-12 border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 via-transparent to-orange-500"></div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ROW 1: Header Inputs */}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-[9px] orbitron text-slate-500 mb-2 uppercase font-bold tracking-widest text-center">Match Date</label>
                        <input
                            type="date"
                            className="w-full text-xs font-bold"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-[9px] orbitron text-slate-500 mb-2 uppercase font-bold tracking-widest text-center">Format</label>
                        <select
                            className="w-full text-xs font-bold uppercase"
                            value={format}
                            onChange={e => setFormat(e.target.value as MatchFormat)}
                        >
                            <option value="1-Inning">1 Inn</option>
                            <option value="2-Innings">2 Inn</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-[9px] orbitron text-cyan-500 mb-2 uppercase font-bold tracking-widest text-center">Team Blue</label>
                        <input
                            type="number"
                            className="w-full text-center font-black text-cyan-400 focus:border-cyan-500"
                            value={formData.teamoneinn1}
                            onChange={e => setFormData({ ...formData, teamoneinn1: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-[9px] orbitron text-orange-500 mb-2 uppercase font-bold tracking-widest text-center">Team Orange</label>
                        <input
                            type="number"
                            className="w-full text-center font-black text-orange-400 focus:border-orange-500 input-orange"
                            value={formData.teamtwoinn1}
                            onChange={e => setFormData({ ...formData, teamtwoinn1: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-[9px] orbitron text-slate-500 mb-2 uppercase font-bold tracking-widest text-center">Overs</label>
                        <input
                            type="text"
                            className="w-full text-center font-bold"
                            placeholder="0.0"
                            value={formData.overs}
                            onChange={e => setFormData({ ...formData, overs: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-[9px] orbitron text-orange-400 mb-2 uppercase font-bold tracking-widest text-center">Margin</label>
                        <input
                            type="text"
                            className="w-full text-center text-[10px] font-bold bg-transparent"
                            readOnly
                            value={totals.winmargin}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-white text-black orbitron text-[10px] font-black rounded hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase tracking-tighter"
                        >
                            Commit
                        </button>
                    </div>
                </div>

                {/* ROW 2: Detail Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-1 flex flex-col justify-end">
                        <div className="bg-orange-900/20 border border-orange-900/40 p-3 rounded text-center">
                            <span className="orbitron text-[9px] text-orange-500 font-black uppercase tracking-widest">MOM Caption</span>
                            <div className="text-white text-xs font-bold mt-1">MOM</div>
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-[8px] orbitron text-slate-600 mb-1 tracking-widest uppercase">MOM Entry 1</label>
                        <select
                            className="w-full text-[10px] font-bold bg-slate-900/80"
                            value={formData.mom}
                            onChange={e => setFormData({ ...formData, mom: e.target.value })}
                        >
                            <option value="">MOI 1</option>
                            {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-[8px] orbitron text-slate-600 mb-1 tracking-widest uppercase">MOI Entry 2</label>
                        <input
                            type="text"
                            className="w-full text-[10px] font-bold bg-slate-900/80"
                            placeholder="MOI 2"
                            value={formData.moi2}
                            onChange={e => setFormData({ ...formData, moi2: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-[8px] orbitron text-slate-600 mb-1 tracking-widest uppercase">MOI Entry 1</label>
                        <input
                            type="text"
                            className="w-full text-[10px] font-bold bg-slate-900/80"
                            placeholder="MOI 1"
                            value={formData.moi1}
                            onChange={e => setFormData({ ...formData, moi1: e.target.value })}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-[9px] orbitron text-cyan-500 mb-1 tracking-widest uppercase text-center font-bold">Team Blue Pts</label>
                        <div className="w-full bg-slate-950 border border-cyan-900/40 p-3 rounded text-center text-cyan-400 font-black text-2xl orbitron shadow-[inset_0_0_10px_rgba(0,162,255,0.1)]">
                            {totals.pts1}
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-[9px] orbitron text-orange-500 mb-1 tracking-widest uppercase text-center font-bold">Team Orange Pts</label>
                        <div className="w-full bg-slate-950 border border-orange-900/40 p-3 rounded text-center text-orange-400 font-black text-2xl orbitron shadow-[inset_0_0_10px_rgba(255,115,0,0.1)]">
                            {totals.pts2}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
