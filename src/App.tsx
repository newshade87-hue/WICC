import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { MatchForm } from './MatchForm';
import { AwardsHub } from './AwardsHub';
import { ExportTool } from './ExportTool';
import { MembersHub } from './MembersHub';
import type { MatchData } from './types';
import { Trash2, Edit2, Download, RotateCcw, Camera } from 'lucide-react';
import wiccLogo from './assets/wicc_logo.png';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [seriesInfo, setSeriesInfo] = useState<any>(null);
  const [teamOneName, setTeamOneName] = useState('TEAM BLUE');
  const [teamTwoName, setTeamTwoName] = useState('TEAM ORANGE');
  const [editingMatch, setEditingMatch] = useState<MatchData | null>(null);

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

    if (mData) setMatches(mData);
    if (sData) setSeriesInfo(sData);
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
    if (window.confirm('Are you sure you want to delete this match record?')) {
      const { error } = await supabase.from('wicc_matches').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const handleArchive = async () => {
    if (window.confirm('This will archive all current matches and reset the series. Continue?')) {
      const { error } = await supabase.from('wicc_matches').update({ is_archived: true }).eq('is_archived', false);
      if (!error) fetchData();
    }
  };

  const takeScreenshot = async () => {
    const element = document.body;
    const canvas = await html2canvas(element, {
      backgroundColor: '#020617',
      useCORS: true,
      scale: 2,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
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
        <button onClick={takeScreenshot} className="btn-outline btn-blue-outline" style={{ position: 'absolute', top: 0, right: 0, fontSize: '10px' }}>
          <Camera size={14} /> FULL SNAPSHOT
        </button>
        <div className="logo-container">
          <img src={wiccLogo} alt="WICC Logo" className="title-logo-img" />
        </div>
        <div className="subtitle-container">
          <div className="line line-blue"></div>
          <span className="orbitron" style={{ fontSize: '12px', color: '#00e5ff', fontWeight: 'bold', letterSpacing: '0.8em' }}>PREMIER RECORDER</span>
          <div className="line line-orange"></div>
        </div>
      </header>

      {/* Top Cards Row */}
      <div className="grid-3">
        <div className="card card-blue">
          <span className="card-label orbitron">{teamOneName} POINTS</span>
          <span className="card-value orbitron text-white">{totals.ptsA}</span>
        </div>
        <div className="card card-center">
          <span className="card-label orbitron">SERIES STATUS</span>
          <span className="card-status orbitron text-white">{champion || inLead}</span>
          <div className="card-label orbitron" style={{ marginTop: '1rem' }}>TARGET: 10 PTS</div>
        </div>
        <div className="card card-orange">
          <span className="card-label orbitron">{teamTwoName} POINTS</span>
          <span className="card-value orbitron text-white">{totals.ptsB}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex-between" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button onClick={exportToExcel} className="btn-outline btn-blue-outline">
            <Download size={14} /> EXCEL
          </button>
          <button onClick={handleArchive} className="btn-outline btn-red-outline">
            <RotateCcw size={14} /> RESET & ARCHIVE
          </button>
        </div>

        <div className="versus-bar">
          <input
            className="team-tab tab-blue orbitron"
            value={teamOneName}
            onChange={e => setTeamOneName(e.target.value.toUpperCase())}
            placeholder="TEAM BLUE NAME"
            spellCheck={false}
          />
          <span className="vs-text orbitron">VS</span>
          <input
            className="team-tab tab-orange orbitron"
            value={teamTwoName}
            onChange={e => setTeamTwoName(e.target.value.toUpperCase())}
            placeholder="TEAM ORANGE NAME"
            spellCheck={false}
          />
        </div>
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
                PLAYERS
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
                  <div className="orbitron" style={{ color: '#ffcc00', fontSize: '10px', fontWeight: 'bold' }}>MOM: {m.mom}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', justifyContent: 'center', marginTop: '0.2rem' }}>
                    {m.moi1 && <span style={{ fontSize: '7px', background: 'rgba(0,162,255,0.1)', color: '#00e5ff', padding: '2px 4px', borderRadius: '4px' }}>MOI 1: {m.moi1}</span>}
                    {m.moi2 && <span style={{ fontSize: '7px', background: 'rgba(255,115,0,0.1)', color: '#ff9100', padding: '2px 4px', borderRadius: '4px' }}>MOI 2: {m.moi2}</span>}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Edit2 size={14} className="text-cyan-500 cursor-pointer hover:scale-110 transition" onClick={() => { setEditingMatch(m); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }} />
                    <Trash2 size={16} className="text-red-500 cursor-pointer hover:scale-110 transition" onClick={() => handleDelete(m.id!)} />
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

      <MatchForm
        onSave={() => { fetchData(); setEditingMatch(null); }}
        teamOneName={teamOneName}
        teamTwoName={teamTwoName}
        matchesCount={matches.length}
        editingMatch={editingMatch}
        onCancel={() => setEditingMatch(null)}
      />
      <MembersHub onUpdate={fetchData} />
      {seriesInfo && <AwardsHub onUpdate={fetchData} seriesData={seriesInfo} />}
      {seriesInfo && <ExportTool series={{ ...seriesInfo, ptsA: totals.ptsA, ptsB: totals.ptsB, champion }} />}
    </div>
  );
};

export default App;
