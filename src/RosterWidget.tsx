import React from 'react';
import type { TeamMember } from './types';
import { Users, Edit3 } from 'lucide-react';
import { useAdmin } from './AdminContext';

export const RosterWidget: React.FC<{ blueMembers: TeamMember[], orangeMembers: TeamMember[], onEdit: () => void }> = ({ blueMembers, orangeMembers, onEdit }) => {
    const { isAdmin, showPinPrompt } = useAdmin();
    return (
        <div className="roster-widget">
            <div className="team-roster-column" style={{ background: 'rgba(0, 162, 255, 0.05)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(0, 162, 255, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--team-blue)', boxShadow: '0 0 10px var(--team-blue)' }}></div>
                    <span className="orbitron" style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--team-blue)' }}>TEAM BLUE</span>
                </div>
                <div className="roster-list">
                    {blueMembers.length === 0 ? (
                        <span className="orbitron" style={{ fontSize: '0.6rem', opacity: 0.3 }}>NO PLAYERS</span>
                    ) : (
                        blueMembers.map(m => (
                            <span key={m.id} className="roster-item-small mono">{m.name}</span>
                        ))
                    )}
                </div>
            </div>

            <div className="team-roster-column" style={{ background: 'rgba(255, 115, 0, 0.05)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255, 115, 0, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--team-orange)', boxShadow: '0 0 10px var(--team-orange)' }}></div>
                    <span className="orbitron" style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--team-orange)' }}>TEAM ORANGE</span>
                </div>
                <div className="roster-list">
                    {orangeMembers.length === 0 ? (
                        <span className="orbitron" style={{ fontSize: '0.6rem', opacity: 0.3 }}>NO PLAYERS</span>
                    ) : (
                        orangeMembers.map(m => (
                            <span key={m.id} className="roster-item-small mono">{m.name}</span>
                        ))
                    )}
                </div>
            </div>

            <div style={{ position: 'absolute', top: '-10px', right: '20px', background: 'var(--bg-navy)', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={12} color="var(--accent-cyan)" />
                <span className="orbitron" style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>CURRENT TEAMS</span>
                <button
                    onClick={() => isAdmin ? onEdit() : showPinPrompt()}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent-cyan)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                        marginLeft: '5px',
                        borderRadius: '4px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <Edit3 size={10} />
                </button>
            </div>
        </div>
    );
};
