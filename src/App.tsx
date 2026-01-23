import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { MatchForm } from './MatchForm';
import { AwardsHub } from './AwardsHub';
import { ExportTool } from './ExportTool';
import { MembersHub } from './MembersHub';
import type { MatchData } from './types';
import { FileSpreadsheet, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [seriesInfo, setSeriesInfo] = useState<any>(null);

  const fetchData = async () => {
    const { data: mData } = await supabase
      .from('wicc_matches')
      .select('*')
      .eq('is_archived', false)
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

  const champion = totals.ptsA >= 10 ? 'TEAM BLUE' : totals.ptsB >= 10 ? 'TEAM ORANGE' : null;
  const inLead = totals.ptsA > totals.ptsB ? 'TEAM BLUE' : totals.ptsB > totals.ptsA ? 'TEAM ORANGE' : 'DRAW';

  return (
    <div className="container">
      {/* Header Section */}
      <header className="header">
        <button className="btn-outline btn-blue-outline" style={{ position: 'absolute', top: 0, right: 0 }}>VIEW HISTORY</button>
        <h1 className="title-logo orbitron">WICC</h1>
        <div className="subtitle-container">
          <div className="line line-blue"></div>
          <span className="orbitron" style={{ fontSize: '10px', color: '#00e5ff', fontWeight: 'bold' }}>PREMIER RECORDER</span>
          <div className="line line-orange"></div>
        </div>
      </header>

      {/* Top Cards Row */}
      <div className="grid-3">
        <div className="card card-blue">
          <span className="card-label orbitron">TEAM BLUE</span>
          <span className="card-value orbitron text-white">{totals.ptsA}</span>
        </div>
        <div className="card card-center">
          <span className="card-label orbitron">TARGET: 10 PTS</span>
          <span className="card-status orbitron text-white">{champion || inLead}</span>
        </div>
        <div className="card card-orange">
          <span className="card-label orbitron">TEAM ORANGE</span>
          <span className="card-value orbitron text-white">{totals.ptsB}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline btn-blue-outline">EXCEL</button>
          <button className="btn-outline btn-red-outline">RESET</button>
        </div>

        <div className="versus-bar">
          <div className="team-tab tab-blue orbitron">TEAM BLUE</div>
          <span className="vs-text orbitron">VS</span>
          <div className="team-tab tab-orange orbitron">TEAM ORANGE</div>
        </div>
      </div>

      {/* History Table */}
      <div className="history-container">
        <table className="wicc-table">
          <thead>
            <tr className="orbitron">
              <th>DATE</th>
              <th>MATCH</th>
              <th>TEAM BLUE</th>
              <th>TEAM ORANGE</th>
              <th style={{ textAlign: 'center' }}>OVERS</th>
              <th style={{ textAlign: 'center' }}>WINNER</th>
              <th style={{ textAlign: 'center' }}>PTS</th>
              <th style={{ textAlign: 'center' }}>AWARDS</th>
            </tr>
          </thead>
          <tbody className="mono">
            {matches.map((m) => (
              <tr key={m.id}>
                <td style={{ color: '#94a3b8' }}>{m.date}</td>
                <td style={{ color: '#00e5ff', fontWeight: 'bold' }}>{m.matchnumber}</td>
                <td>{m.teamonescore}</td>
                <td>{m.teamtwoscore}</td>
                <td style={{ textAlign: 'center', color: '#94a3b8' }}>{m.overs || '0.0'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0') ? 'badge-blue' : 'badge-orange'}`}>
                    {parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0') ? 'BLUE' : 'ORANGE'}
                  </span>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{m.teamonepoints}-{m.teamtwopoints}</td>
                <td style={{ textAlign: 'center', color: '#ffcc00' }} className="orbitron">{m.mom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MatchForm onSave={fetchData} />
      <MembersHub onUpdate={fetchData} />
      {seriesInfo && <AwardsHub onUpdate={fetchData} seriesData={seriesInfo} />}
      {seriesInfo && <ExportTool series={{ ...seriesInfo, ptsA: totals.ptsA, ptsB: totals.ptsB, champion }} />}
    </div>
  );
};

export default App;
