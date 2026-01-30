

import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { MatchForm } from './MatchForm';
import { AwardsHub } from './AwardsHub';
import { ExportTool } from './ExportTool';
import type { MatchData } from './types';
import { Trash2, Edit2, Download, RotateCcw, Camera, History, Lock, Unlock } from 'lucide-react';
import wiccLogo from './assets/wicc_logo.png';
import html2canvas from 'html2canvas';
import { HistoryView } from './HistoryView';
import { RosterWidget } from './RosterWidget';
import { TeamPicker } from './TeamPicker';
import { Users } from 'lucide-react';
import type { TeamMember } from './types';
import { AdminProvider, useAdmin } from './AdminContext';

const Dashboard: React.FC = () => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [seriesInfo, setSeriesInfo] = useState<any>(null);
  const [teamOneName, setTeamOneName] = useState('TEAM BLUE');
  const [teamTwoName, setTeamTwoName] = useState('TEAM ORANGE');
  const [editingMatch, setEditingMatch] = useState<MatchData | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTeamPickerOpen, setIsTeamPickerOpen] = useState(false);
  const [blueMembers, setBlueMembers] = useState<TeamMember[]>([]);
  const [orangeMembers, setOrangeMembers] = useState<TeamMember[]>([]);

  const { isAdmin, showPinPrompt, lock } = useAdmin();

  const fetchData = async () => {
    const { data: mData } = await supabase
      .from('wicc_matches')
      .select('*')
      .eq('is_archived', false)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    const { data: sData } = await supabase
      .from('wicc_series')
      .select('*')
      .limit(1)
      .single();

    const { data: memData } = await supabase
      .from('wicc_members')
      .select('*');

    if (mData) setMatches(mData);
    if (sData) setSeriesInfo(sData);
    if (memData) {
      setBlueMembers(memData.filter(m => m.team === 'blue'));
      setOrangeMembers(memData.filter(m => m.team === 'orange'));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totals = matches.reduce((acc, m) => {
    acc.ptsA += parseInt(m.teamonepoints || '0');
    acc.ptsB += parseInt(m.teamtwopoints || '0');
    return acc;
  }, { ptsA: 0, ptsB: 0 });

  const champion = totals.ptsA >= 10 ? teamOneName : totals.ptsB >= 10 ? teamTwoName : null;
  const inLead = totals.ptsA > totals.ptsB ? teamOneName : totals.ptsB > totals.ptsA ? teamTwoName : 'DRAW';

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      showPinPrompt();
      return;
    }
    if (window.confirm('Are you sure you want to delete this match record?')) {
      const { error } = await supabase.from('wicc_matches').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const handleEditClick = (m: MatchData) => {
    if (!isAdmin) {
      showPinPrompt();
      return;
    }
    setEditingMatch(m);
    document.getElementById('match-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTeamSelectionClick = () => {
    if (!isAdmin) {
      showPinPrompt();
      return;
    }
    setIsTeamPickerOpen(true);
  };

  const handleArchive = async () => {
    if (!isAdmin) {
      showPinPrompt();
      return;
    }
    if (window.confirm('This will archive all current matches and reset the series. Continue?')) {
      // 1. Prepare Summary
      const startDate = matches.length > 0 ? matches[matches.length - 1].date : new Date().toISOString().split('T')[0];
      const endDate = matches.length > 0 ? matches[0].date : new Date().toISOString().split('T')[0];

      const historyEntry = {
        winner: champion || inLead,
        points_a: totals.ptsA,
        points_b: totals.ptsB,
        start_date: startDate,
        end_date: endDate,
        awards: seriesInfo?.awards || {}
      };

      // 2. Save to History
      const { error: histError } = await supabase.from('wicc_series_history').insert(historyEntry);

      if (histError) {
        alert("Error saving history: " + histError.message);
        return;
      }

      // 3. Mark matches as archived
      const { error: matchError } = await supabase.from('wicc_matches').update({ is_archived: true }).eq('is_archived', false);

      // 4. Reset awards in current series
      const { error: seriesError } = await supabase.from('wicc_series').update({ awards: { mos: '', mvp: '', wickets: '', runs: '', catches: '' } }).eq('id', seriesInfo.id);

      if (!matchError && !seriesError) fetchData();
    }
  };

  const takeScreenshot = async () => {
    const element = document.body;
    // Capture at a consistent width even on mobile to get the full desktop layout in the screenshot
    const captureWidth = 1440;
    const canvas = await html2canvas(element, {
      backgroundColor: '#020617',
      useCORS: true,
      scale: 2,
      windowWidth: captureWidth,
      onclone: (clonedDoc) => {
        const container = clonedDoc.querySelector('.container') as HTMLElement;
        if (container) {
          container.style.width = `${captureWidth}px`;
          container.style.maxWidth = 'none';
        }
      },
      ignoreElements: (el) => el.classList.contains('btn-snapshot-hide') || el.tagName === 'BUTTON'
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Attempt Web Share API for Mobile
    if (navigator.share) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `wicc_snapshot.jpg`, { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'WICC Series Snapshot',
            text: 'Check out the latest WICC Series status!'
          });
          return;
        }
      } catch (err) {
        console.error('Share failed:', err);
      }
    }

    // Fallback to Download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `wicc_dashboard_snapshot_${new Date().getTime()}.jpg`;
    link.click();
  };

  const exportToExcel = () => {
    const headers = ['Date', 'Match', 'Team 1', 'Score 1', 'Team 2', 'Score 2', 'Winner', 'Points', 'MOM'];
    const csvContent = [
      headers.join(','),
      ...matches.map(m => [
        m.date,
        m.matchnumber,
        m.teamonename,
        m.teamonescore,
        m.teamtwoname,
        m.teamtwoscore,
        parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0') ? m.teamonename : m.teamtwoname,
        `${m.teamonepoints}-${m.teamtwopoints}`,
        m.mom
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wicc_series_history.csv';
    link.click();
  };

  return (
    <div className="container" style={{ paddingBottom: '10rem' }}>
      {/* Header Section */}
      <header className="header">
        <div className="logo-container">
          <img src={wiccLogo} alt="WICC Logo" className="title-logo-img" />
        </div>
        <div className="subtitle-container">
          <div className="line line-blue"></div>
          <span className="orbitron" style={{ fontSize: '12px', color: '#00e5ff', fontWeight: 'bold', letterSpacing: '0.8em' }}>PREMIER RECORDER</span>
          <button
            onClick={isAdmin ? lock : showPinPrompt}
            style={{
              background: isAdmin ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: isAdmin ? '1px solid #22c55e' : '1px solid #ef4444',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginLeft: '15px',
              transition: 'all 0.3s ease',
              boxShadow: isAdmin ? '0 0 10px rgba(34, 197, 94, 0.2)' : '0 0 10px rgba(239, 68, 68, 0.2)'
            }}
            title={isAdmin ? "Click to Lock" : "Click to Unlock"}
          >
            {isAdmin ? <Unlock size={14} color="#22c55e" /> : <Lock size={14} color="#ef4444" />}
          </button>
          <div className="line line-orange"></div>
        </div>
      </header>

      {/* Top Cards Row */}
      <div className="grid-3">
        <div className="card card-blue">
          <span className="card-label orbitron">{teamOneName} POINTS</span>
          <span className="card-value orbitron text-white">{totals.ptsA}</span>
        </div>
        <div className={`card card-center ${totals.ptsA > totals.ptsB ? 'leading-blue' : totals.ptsB > totals.ptsA ? 'leading-orange' : ''}`}>
          <span className="card-label orbitron">SERIES STATUS</span>
          <span className="card-status orbitron text-white">{champion || inLead}</span>
          <div className="card-label orbitron" style={{ marginTop: '1rem' }}>TARGET: 10 PTS</div>
        </div>
        <div className="card card-orange">
          <span className="card-label orbitron">{teamTwoName} POINTS</span>
          <span className="card-value orbitron text-white">{totals.ptsB}</span>
        </div>
      </div>

      <RosterWidget blueMembers={blueMembers} orangeMembers={orangeMembers} />

      {/* Action Bar Removed from here, moved to bottom */}

      <div className="versus-bar">
        <input
          className="team-tab tab-blue orbitron"
          value={teamOneName}
          onChange={e => { if (isAdmin) setTeamOneName(e.target.value.toUpperCase()) }}
          placeholder="TEAM BLUE NAME"
          spellCheck={false}
          readOnly={!isAdmin}
        />
        <span className="vs-text orbitron">VS</span>
        <input
          className="team-tab tab-orange orbitron"
          value={teamTwoName}
          onChange={e => { if (isAdmin) setTeamTwoName(e.target.value.toUpperCase()) }}
          placeholder="TEAM ORANGE NAME"
          spellCheck={false}
          readOnly={!isAdmin}
        />
      </div>

      {/* History Table */}
      <div className="history-container shadow-2xl">
        <table className="wicc-table">
          <thead>
            <tr className="orbitron">
              <th>DATE</th>
              <th>MATCH #</th>
              <th>{teamOneName}</th>
              <th>{teamTwoName}</th>
              <th style={{ textAlign: 'center' }}>OVERS</th>
              <th style={{ textAlign: 'center' }}>WINNER</th>
              <th style={{ textAlign: 'center' }}>PTS</th>
              <th style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '7px', opacity: 0.7 }}>AWARDS HUB</div>
                MOM / MoIs
              </th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody className="mono">
            {matches.map((m) => (
              <tr key={m.id} className="table-row-hover">
                <td style={{ color: '#94a3b8' }}>{m.date}</td>
                <td style={{ color: '#00e5ff', fontWeight: 'bold', textAlign: 'center' }}>{m.matchnumber}</td>
                <td>{m.teamonescore} {m.innings === '2-Innings' && <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>({m.teamoneinn1}+{m.teamoneinn2})</span>}</td>
                <td>{m.teamtwoscore} {m.innings === '2-Innings' && <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>({m.teamtwoinn1}+{m.teamtwoinn2})</span>}</td>
                <td style={{ textAlign: 'center', color: '#94a3b8' }}>{m.overs || '0.0'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0') ? 'badge-blue' : 'badge-orange'}`}>
                    {parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0') ? 'BLUE' : 'ORANGE'}
                  </span>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{m.teamonepoints}-{m.teamtwopoints}</td>
                <td style={{ textAlign: 'center' }}>
                  <div className="orbitron" style={{ color: '#ffcc00', fontSize: '11px', fontWeight: '900', textShadow: '0 0 10px rgba(255,204,0,0.3)' }}>MOM: {m.mom || 'PENDING'}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '0.4rem' }}>
                    {m.moi1 && (
                      <span style={{
                        fontSize: '8px',
                        background: 'rgba(0,229,255,0.1)',
                        color: '#00e5ff',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        border: '1px solid rgba(0,229,255,0.2)',
                        fontWeight: 'bold'
                      }}>
                        MoI 1: {m.moi1}
                      </span>
                    )}
                    {m.moi2 && (
                      <span style={{
                        fontSize: '8px',
                        background: 'rgba(255,115,0,0.1)',
                        color: '#ff9100',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,115,0,0.2)',
                        fontWeight: 'bold'
                      }}>
                        MoI 2: {m.moi2}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Edit2
                      size={14}
                      className="text-cyan-500 cursor-pointer hover:scale-110 transition"
                      style={{ opacity: isAdmin ? 1 : 0.3 }}
                      onClick={() => handleEditClick(m)}
                    />
                    <Trash2
                      size={16}
                      className="text-red-500 cursor-pointer hover:scale-110 transition"
                      style={{ opacity: isAdmin ? 1 : 0.3 }}
                      onClick={() => handleDelete(m.id!)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr><td colSpan={9} className="p-20 text-center orbitron opacity-30">NO MATCH DATA FOUND</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ opacity: isAdmin ? 1 : 0.5, pointerEvents: isAdmin ? 'auto' : 'none', position: 'relative' }}>
        {!isAdmin && <div onClick={showPinPrompt} style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'pointer' }}></div>}
        <MatchForm
          onSave={() => { fetchData(); setEditingMatch(null); }}
          teamOneName={teamOneName}
          teamTwoName={teamTwoName}
          matchesCount={matches.length}
          editingMatch={editingMatch}
          onCancel={() => setEditingMatch(null)}
        />
      </div>

      {seriesInfo && <AwardsHub onUpdate={fetchData} seriesData={seriesInfo} />}
      {seriesInfo && <ExportTool series={{ ...seriesInfo, ptsA: totals.ptsA, ptsB: totals.ptsB, champion }} />}

      {/* Bottom Action Bar */}
      <div className="bottom-bar btn-snapshot-hide" style={{ gap: '0.4rem', padding: '0.5rem' }}>
        <button onClick={takeScreenshot} className="btn-outline btn-blue-outline" title="Snapshot">
          <Camera size={18} />
        </button>
        <button onClick={exportToExcel} className="btn-outline btn-blue-outline" title="Export Excel">
          <Download size={18} />
        </button>
        <button onClick={handleTeamSelectionClick} className="btn-outline btn-blue-outline btn-flash" style={{ flex: 2, justifyContent: 'center' }}>
          <Users size={14} style={{ marginRight: '6px' }} /> TEAMS
        </button>
        <button onClick={() => setIsHistoryOpen(true)} className="btn-outline btn-blue-outline" style={{ flex: 1, justifyContent: 'center' }}>
          <History size={14} style={{ marginRight: '6px' }} /> LOGS
        </button>
        <button onClick={handleArchive} className="btn-outline btn-red-outline" title="Reset Series">
          <RotateCcw size={18} />
        </button>
      </div>

      <HistoryView isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <TeamPicker isOpen={isTeamPickerOpen} onClose={() => setIsTeamPickerOpen(false)} onComplete={fetchData} />
    </div >
  );
};

const App: React.FC = () => (
  <AdminProvider>
    <Dashboard />
  </AdminProvider>
);

export default App;
