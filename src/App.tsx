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
    <div className="max-w-[1400px] mx-auto p-4 md:p-12">
      {/* Header Section */}
      <header className="relative text-center mb-16 pt-8">
        <button className="absolute top-0 right-0 py-1.5 px-4 bg-slate-900 border border-slate-800 text-slate-500 rounded text-[9px] orbitron font-bold">VIEW HISTORY</button>
        <h1 className="logo-main orbitron leading-none">WICC</h1>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="h-1 w-10 bg-blue-500 rounded-full"></div>
          <span className="orbitron text-[10px] tracking-[0.6em] text-cyan-400 font-bold">PREMIER RECORDER</span>
          <div className="h-1 w-10 bg-orange-500 rounded-full"></div>
        </div>
      </header>

      {/* Top Cards Row */}
      <div className="flex flex-col md:flex-row gap-6 mb-16">
        {/* Team Blue Card */}
        <div className="flex-1 card-glass p-10 card-blue text-center">
          <span className="orbitron text-[10px] text-slate-400 mb-6 block font-bold tracking-[0.2em]">TEAM BLUE</span>
          <span className="text-8xl orbitron font-black text-white">{totals.ptsA}</span>
        </div>

        {/* Middle Card */}
        <div className="flex-1 card-glass p-10 card-center text-center">
          <span className="orbitron text-[10px] text-slate-400 mb-6 block font-bold tracking-[0.2em]">TARGET: 10 PTS</span>
          <span className={`text-5xl orbitron font-black tracking-widest text-slate-100`}>
            {champion || inLead}
          </span>
        </div>

        {/* Team Orange Card */}
        <div className="flex-1 card-glass p-10 card-orange text-center">
          <span className="orbitron text-[10px] text-slate-400 mb-6 block font-bold tracking-[0.2em]">TEAM ORANGE</span>
          <span className="text-8xl orbitron font-black text-white">{totals.ptsB}</span>
        </div>
      </div>

      {/* Middle Action Bar */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex gap-2">
          <button className="btn-outline btn-blue-outline font-black">EXCEL</button>
          <button className="btn-outline btn-red-outline font-black">RESET</button>
        </div>

        <div className="flex-1 max-w-2xl flex items-center bg-[#000] border-2 border-slate-900 p-1.5 rounded-xl ml-8">
          <div className="flex-1 bg-cyan-700 py-3 rounded-lg text-white orbitron text-xs font-black text-center shadow-[0_0_20px_rgba(0,162,255,0.4)]">TEAM BLUE</div>
          <span className="px-8 orbitron italic text-white text-xl font-black">VS</span>
          <div className="flex-1 bg-orange-800 py-3 rounded-lg text-white orbitron text-xs font-black text-center shadow-[0_0_20px_rgba(255,115,0,0.4)]">TEAM ORANGE</div>
        </div>
      </div>

      {/* History Table */}
      <div className="card-glass overflow-hidden mb-16 bg-black border-slate-800 shadow-2xl">
        <table className="wicc-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Match</th>
              <th>Team Blue</th>
              <th>Team Orange</th>
              <th>Overs</th>
              <th>Winner</th>
              <th>Pts</th>
              <th>Awards</th>
            </tr>
          </thead>
          <tbody className="mono text-[11px]">
            {matches.map((m) => (
              <tr key={m.id}>
                <td className="text-slate-500">{m.date}</td>
                <td className="text-cyan-400 font-bold">{m.matchnumber}</td>
                <td className="text-slate-100">{m.teamonescore}</td>
                <td className="text-slate-100">{m.teamtwoscore}</td>
                <td className="text-center text-slate-500">{m.overs || '0.0'}</td>
                <td className="text-center">
                  <span className={`px-4 py-1.5 rounded-md text-[9px] font-black orbitron ${parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0')
                      ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800/50'
                      : parseInt(m.teamtwopoints || '0') > parseInt(m.teamonepoints || '0')
                        ? 'bg-orange-900/30 text-orange-400 border border-orange-800/50'
                        : 'bg-slate-900 text-slate-500'
                    }`}>
                    {parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0') ? 'BLUE' : parseInt(m.teamtwopoints || '0') > parseInt(m.teamonepoints || '0') ? 'ORANGE' : 'DRAW'}
                  </span>
                </td>
                <td className="text-center text-white font-black">{m.teamonepoints}-{m.teamtwopoints}</td>
                <td className="text-center text-yellow-500 orbitron text-[10px]">{m.mom}</td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr>
                <td colSpan={8} className="p-20 text-center text-slate-700 font-bold orbitron tracking-[0.4em] uppercase opacity-40">System Idle: Pending Data Entry</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MatchForm onSave={fetchData} />

      <MembersHub onUpdate={fetchData} />

      {seriesInfo && (
        <AwardsHub onUpdate={fetchData} seriesData={seriesInfo} />
      )}

      {seriesInfo && (
        <ExportTool
          series={{ ...seriesInfo, ptsA: totals.ptsA, ptsB: totals.ptsB, champion }}
        />
      )}
    </div>
  );
};

export default App;
