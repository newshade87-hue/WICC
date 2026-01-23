import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Award, Target, RotateCcw } from 'lucide-react';
import { WICC_MEMBERS } from './types';

export const AwardsHub: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [seriesData, setSeriesData] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [awards, setAwards] = useState({
        mos: '',
        mvp: '',
        runs: '',
        wickets: '',
        catches: ''
    });

    const fetchSeries = async () => {
        const { data, error } = await supabase.from('wicc_series').select('*').limit(1).single();
        if (!error && data) {
            setSeriesData(data);
            setAwards(data.awards);
        } else if (error && error.code === 'PGRST116') {
            // No series found, create one
            const { data: newSeries } = await supabase.from('wicc_series').insert([{
                team_a: 'Team Blue',
                team_b: 'Team Orange',
                awards: awards
            }]).select().single();
            if (newSeries) {
                setSeriesData(newSeries);
            }
        }
    };

    useEffect(() => {
        fetchSeries();
    }, []);

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

    const handleArchiveSeries = async () => {
        if (!confirm('Are you sure you want to archive this series? This will move all current matches to history and reset points.')) return;

        setLoading(true);
        // 1. Mark all matches as archived
        await supabase.from('wicc_matches').update({ is_archived: true }).eq('is_archived', false);

        // 2. Clear series awards but keep record (in a real app we'd save it to a history table)
        await supabase.from('wicc_series').update({
            pts_a: 0,
            pts_b: 0,
            awards: { mos: '', mvp: '', runs: '', wickets: '', catches: '' }
        }).eq('id', seriesData.id);

        setAwards({ mos: '', mvp: '', runs: '', wickets: '', catches: '' });
        onUpdate();
        setLoading(false);
        alert('Series archived and dashboard reset.');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="glass p-6 glow-b">
                <h3 className="orbitron text-yellow-400 flex items-center gap-2 mb-6">
                    <Award className="w-5 h-5" /> Series Awards
                </h3>

                <div className="space-y-4">
                    {Object.entries(awards).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-[10px] uppercase text-slate-500 tracking-widest">{key === 'mos' ? 'Man of Series' : key}</span>
                            {editing ? (
                                <select
                                    className="bg-slate-900 border border-slate-700 text-xs p-1 rounded mono"
                                    value={value}
                                    onChange={(e) => setAwards({ ...awards, [key]: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    {WICC_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            ) : (
                                <span className="orbitron text-xs text-white">{value || '---'}</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex gap-4">
                    {editing ? (
                        <button
                            onClick={handleSaveAwards}
                            disabled={loading}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 p-2 rounded orbitron text-[10px] transition-all"
                        >SAVE AWARDS</button>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 p-2 rounded orbitron text-[10px] transition-all"
                        >EDIT AWARDS</button>
                    )}
                </div>
            </div>

            <div className="glass p-6 border-l-4 border-l-red-600">
                <h3 className="orbitron text-red-500 flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5" /> Series Management
                </h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Archive the current series to start a new season. This will clear the dashboard and points table. Historical data is preserved in the database.
                </p>
                <button
                    onClick={handleArchiveSeries}
                    disabled={loading}
                    className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-900 text-red-500 p-4 rounded orbitron text-xs flex items-center justify-center gap-2 transition-all"
                >
                    <RotateCcw className="w-4 h-4" /> RESET & ARCHIVE SEASON
                </button>
            </div>
        </div>
    );
};
