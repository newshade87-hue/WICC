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
        <div className="flex-1 min-w-[150px] bg-slate-900/40 border-b-2 border-slate-800 p-4 rounded-t-lg hover:bg-slate-800/60 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <span className={`orbitron text-[8px] font-black uppercase tracking-widest ${colorClass}`}>{label}</span>
                <Icon className={`w-3 h-3 ${colorClass} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </div>

            {editing ? (
                <select
                    className="w-full bg-slate-950 border-slate-800 text-[10px] p-1.5 rounded orbitron text-white"
                    value={value}
                    onChange={(e) => setAwards({ ...awards, [field]: e.target.value })}
                >
                    <option value="">NAME</option>
                    {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            ) : (
                <div className="flex items-center justify-between">
                    <span className="orbitron text-xs text-slate-300 font-bold tracking-tighter truncate max-w-[80px]">
                        {value || 'NAME'}
                    </span>
                    <div className="bg-cyan-900/40 p-1 rounded-full border border-cyan-800/40">
                        <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
                    </div>
                </div>
            )}
            <div className="mt-4 h-0.5 w-full bg-slate-800"></div>
        </div>
    );

    return (
        <div className="mt-12 mb-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="orbitron text-xl font-black tracking-[0.4em] text-orange-500 uppercase">Series Awards Hub</h2>
                <div className="flex items-center gap-4">
                    <span className="orbitron text-[8px] text-slate-600 font-bold uppercase tracking-[0.3em]">Supabase Cloud Live</span>
                    <button
                        onClick={() => editing ? handleSaveAwards() : setEditing(true)}
                        className="bg-slate-900 border border-slate-800 p-2 rounded hover:bg-slate-800 transition-all"
                    >
                        {editing ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-slate-500" />}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <AwardCard label="MOS 🧢" value={awards.mos} field="mos" icon={Trophy} colorClass="text-orange-500" />
                <AwardCard label="MVP ⭐" value={awards.mvp} field="mvp" icon={Zap} colorClass="text-cyan-500" />
                <AwardCard label="Most Wickets" value={awards.wickets} field="wickets" icon={Shield} colorClass="text-red-500" />
                <AwardCard label="Most Runs" value={awards.runs} field="runs" icon={Star} colorClass="text-green-500" />
                <AwardCard label="Most Catches" value={awards.catches} field="catches" icon={Award} colorClass="text-yellow-500" />
            </div>
        </div>
    );
};
