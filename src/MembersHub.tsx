import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { WICC_MEMBERS } from './types';
import type { TeamMember } from './types';

export const MembersHub: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const [blueMembers, setBlueMembers] = useState<TeamMember[]>([]);
    const [orangeMembers, setOrangeMembers] = useState<TeamMember[]>([]);
    const [blueName, setBlueName] = useState('');
    const [orangeName, setOrangeName] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchMembers = async () => {
        const { data } = await supabase.from('wicc_members').select('*');
        if (data) {
            setBlueMembers(data.filter(m => m.team === 'blue'));
            setOrangeMembers(data.filter(m => m.team === 'orange'));
        }
    };

    useEffect(() => { fetchMembers(); }, []);

    const handleAddMember = async (team: 'blue' | 'orange') => {
        const currentName = team === 'blue' ? blueName : orangeName;
        if (!currentName.trim()) return;
        setLoading(true);
        const { error } = await supabase.from('wicc_members').insert([{ name: currentName.trim(), team }]);
        if (!error) {
            if (team === 'blue') setBlueName(''); else setOrangeName('');
            fetchMembers();
            onUpdate();
        }
        setLoading(false);
    };

    const handleDeleteMember = async (id: string) => {
        await supabase.from('wicc_members').delete().eq('id', id);
        fetchMembers();
    };

    return (
        <div className="members-grid">
            <datalist id="members-list">
                {WICC_MEMBERS.map(m => <option key={m} value={m} />)}
            </datalist>
            <div className="member-card member-card-blue">
                <h3 className="orbitron" style={{ fontSize: '0.6rem', color: '#00e5ff', marginBottom: '1rem' }}>ASSIGN MEMBER: TEAM BLUE</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        list="members-list"
                        style={{ flex: 1 }}
                        type="text"
                        placeholder="Type name..."
                        value={blueName}
                        onChange={e => setBlueName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddMember('blue'); }}
                    />
                    <button onClick={() => handleAddMember('blue')} disabled={loading} className="btn-commit orbitron" style={{ width: '60px' }}>ADD</button>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {blueMembers.map(m => (
                        <span key={m.id} className="roster-tag mono" style={{ cursor: 'pointer' }} onClick={() => handleDeleteMember(m.id)}>{m.name} ✕</span>
                    ))}
                </div>
            </div>

            <div className="member-card member-card-orange">
                <h3 className="orbitron" style={{ fontSize: '0.6rem', color: '#ff7300', marginBottom: '1rem' }}>ASSIGN MEMBER: TEAM ORANGE</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        list="members-list"
                        style={{ flex: 1 }}
                        type="text"
                        placeholder="Type name..."
                        value={orangeName}
                        onChange={e => setOrangeName(e.target.value)}
                        className="input-orange"
                        onKeyDown={e => { if (e.key === 'Enter') handleAddMember('orange'); }}
                    />
                    <button onClick={() => handleAddMember('orange')} disabled={loading} className="btn-commit orbitron" style={{ width: '60px' }}>ADD</button>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {orangeMembers.map(m => (
                        <span key={m.id} className="roster-tag mono" style={{ cursor: 'pointer' }} onClick={() => handleDeleteMember(m.id)}>{m.name} ✕</span>
                    ))}
                </div>
            </div>
        </div>
    );
};
