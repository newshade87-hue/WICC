import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { TeamMember } from './types';
import { UserPlus, Trash2, Shield } from 'lucide-react';

export const MembersHub: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const [blueMembers, setBlueMembers] = useState<TeamMember[]>([]);
    const [orangeMembers, setOrangeMembers] = useState<TeamMember[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchMembers = async () => {
        const { data, error } = await supabase.from('wicc_members').select('*');
        if (!error && data) {
            setBlueMembers(data.filter(m => m.team === 'blue'));
            setOrangeMembers(data.filter(m => m.team === 'orange'));
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleAddMember = async (team: 'blue' | 'orange') => {
        if (!name.trim()) return;
        setLoading(true);
        const { error } = await supabase.from('wicc_members').insert([{ name: name.trim(), team }]);
        if (!error) {
            setName('');
            fetchMembers();
            onUpdate();
        }
        setLoading(false);
    };

    const handleDeleteMember = async (id: string) => {
        const { error } = await supabase.from('wicc_members').delete().eq('id', id);
        if (!error) fetchMembers();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Team Blue Assignment */}
            <div className="card-glass p-6 card-blue relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield className="w-24 h-24 text-blue-500" />
                </div>
                <h3 className="orbitron text-xs text-cyan-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    ASSIGN MEMBER: TEAM BLUE
                </h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-slate-900/50 border-slate-700 text-sm focus:border-cyan-500"
                        placeholder="Type name..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAddMember('blue')}
                    />
                    <button
                        onClick={() => handleAddMember('blue')}
                        disabled={loading}
                        className="bg-cyan-600 hover:bg-cyan-500 px-4 rounded text-[10px] orbitron font-bold transition-all"
                    >
                        ADD
                    </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {blueMembers.map(m => (
                        <span key={m.id} className="bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full text-[10px] flex items-center gap-2 group/tag">
                            {m.name}
                            <Trash2
                                className="w-3 h-3 text-slate-500 hover:text-red-500 cursor-pointer opacity-0 group-hover/tag:opacity-100 transition-opacity"
                                onClick={() => handleDeleteMember(m.id)}
                            />
                        </span>
                    ))}
                </div>
            </div>

            {/* Team Orange Assignment */}
            <div className="card-glass p-6 card-orange relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield className="w-24 h-24 text-orange-500" />
                </div>
                <h3 className="orbitron text-xs text-orange-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    ASSIGN MEMBER: TEAM ORANGE
                </h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-slate-900/50 border-slate-700 text-sm focus:border-orange-500 input-orange"
                        placeholder="Type name..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAddMember('orange')}
                    />
                    <button
                        onClick={() => handleAddMember('orange')}
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-500 px-4 rounded text-[10px] orbitron font-bold transition-all"
                    >
                        ADD
                    </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {orangeMembers.map(m => (
                        <span key={m.id} className="bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full text-[10px] flex items-center gap-2 group/tag">
                            {m.name}
                            <Trash2
                                className="w-3 h-3 text-slate-500 hover:text-red-500 cursor-pointer opacity-0 group-hover/tag:opacity-100 transition-opacity"
                                onClick={() => handleDeleteMember(m.id)}
                            />
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
