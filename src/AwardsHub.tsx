import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Award, Target, RotateCcw, Lock, Unlock, Trophy, Zap, Star, Shield } from 'lucide-react';
import { WICC_MEMBERS } from './types';

export const AwardsHub: React.FC<{ onUpdate: () => void, seriesData: any }> = ({ onUpdate, seriesData }) => {
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [awards, setAwards] = useState({
        mos: '',
        mvp: '',
        wickets: '',
        runs: '',
        catches: ''
    });

    useEffect(() => {
        if (seriesData?.awards) {
            setAwards(seriesData.awards);
        }
    }, [seriesData]);

    const handleSaveAwards = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('wicc_series')
            .update({ awards })
            .eq('id', seriesData.id);

        if (!error) {
            setEditing(false);
            onUpdate();
        }
        setLoading(false);
    };

    const AwardCard = ({ label, value, field, icon: Icon, colorClass }: any) => (
        <div className="flex-1 min-w-[180px] bg-slate-900/40 border-b-2 border-slate-800 p-5 rounded-t-lg hover:bg-slate-800/60 transition-all group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
                <span className={`orbitron text-[9px] font-black uppercase tracking-[0.2em] ${colorClass}`}>{label}</span>
                <Icon className={`w-3.5 h-3.5 ${colorClass} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </div>

            <div>
                {editing ? (
                    <select
                        className="w-full bg-slate-950 border-slate-800 text-[10px] p-2 rounded orbitron text-white outline-none focus:border-cyan-500"
                        value={value}
                        onChange={(e) => setAwards({ ...awards, [field]: e.target.value })}
                    >
                        <option value="">NAME</option>
                        {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="orbitron text-xs text-slate-200 font-bold tracking-tight truncate max-w-[100px] uppercase">
                            {value || 'NAME'}
                        </span>
                        <div className={`p-1 rounded-full border border-slate-800 ${value ? 'bg-cyan-900/40' : 'bg-slate-950'}`}>
                            <div className={`w-2 h-2 rounded-full ${value ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-800'}`}></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-5 h-0.5 w-full bg-slate-800"></div>
        </div>
    );

    return (
        <div className="mt-16 mb-16">
            <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col">
                    <h2 className="orbitron text-2xl font-black tracking-[0.4em] text-orange-500 uppercase leading-none">Series Awards Hub</h2>
                    <span className="orbitron text-[8px] text-slate-700 font-bold uppercase tracking-[0.5em] mt-2">Data Integrity: Verified</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="orbitron text-[8px] text-slate-600 font-bold uppercase tracking-[0.5em]">Supabase Cloud Live</span>
                    <button
                        onClick={() => editing ? handleSaveAwards() : setEditing(true)}
                        className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-xl"
                    >
                        {editing ? <Unlock className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-slate-600" />}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 lg:flex-nowrap">
                <AwardCard label="MOS 🧢" value={awards.mos} field="mos" icon={Trophy} colorClass="text-orange-500" />
                <AwardCard label="MVP ⭐" value={awards.mvp} field="mvp" icon={Zap} colorClass="text-cyan-500" />
                <AwardCard label="Most Wickets" value={awards.wickets} field="wickets" icon={Shield} colorClass="text-red-500" />
                <AwardCard label="Most Runs" value={awards.runs} field="runs" icon={Star} colorClass="text-green-500" />
                <AwardCard label="Most Catches" value={awards.catches} field="catches" icon={Award} colorClass="text-yellow-500" />
            </div>
        </div>
    );
};
