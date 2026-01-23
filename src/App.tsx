import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { MatchForm } from './MatchForm';
import { AwardsHub } from './AwardsHub';
import { ExportTool } from './ExportTool';
import { MembersHub } from './MembersHub';
import type { MatchData } from './types';
import { Trophy, Users, Activity, FileSpreadsheet, RotateCcw } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="logo-main orbitron mb-0">WICC</h1>
        <div className="flex items-center justify-center gap-4 -mt-4">
          <div className="h-1.5 w-16 bg-gradient-to-r from-transparent to-cyan-500 rounded-full"></div>
          <span className="orbitron text-[10px] tracking-[0.5em] text-cyan-500 font-bold uppercase">Premier Recorder</span>
          <div className="h-1.5 w-16 bg-gradient-to-l from-transparent to-orange-500 rounded-full"></div>
        </div>
      </header>

      {/* Top Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Team Blue Total */}
        <div className="card-glass p-8 card-blue text-center flex flex-col justify-center min-h-[160px]">
          <span className="orbitron text-[10px] text-cyan-500 mb-2 uppercase tracking-widest font-bold">Team Blue</span>
          <span className="text-7xl orbitron font-black text-white">{totals.ptsA}</span>
        </div>

        {/* Target / Status */}
        <div className="card-glass p-8 card-center text-center flex flex-col justify-center min-h-[160px] border-slate-700">
          <span className="orbitron text-[10px] text-slate-500 mb-4 uppercase tracking-widest font-bold">Target: 10 Pts</span>
          <span className={`text-4xl orbitron font-bold tracking-widest ${inLead === 'DRAW' ? 'text-white' : inLead === 'TEAM BLUE' ? 'text-cyan-400' : 'text-orange-400'}`}>
            {champion ? 'WINNER' : inLead}
          </span>
        </div>

        {/* Team Orange Total */}
        <div className="card-glass p-8 card-orange text-center flex flex-col justify-center min-h-[160px]">
          <span className="orbitron text-[10px] text-orange-500 mb-2 uppercase tracking-widest font-bold">Team Orange</span>
          <span className="text-7xl orbitron font-black text-white">{totals.ptsB}</span>
        </div>
      </div>

      {/* Global Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div className="flex gap-4">
          <button className="px-6 py-2 border border-cyan-800 bg-cyan-900/20 text-cyan-400 orbitron text-[10px] rounded hover:bg-cyan-900/40 transition-all flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5" /> EXCEL
          </button>
          <button className="px-6 py-2 border border-red-800 bg-red-900/20 text-red-500 orbitron text-[10px] rounded hover:bg-red-900/40 transition-all flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" /> RESET
          </button>
        </div>

        <div className="flex-1 max-w-lg bg-slate-900/80 rounded-full p-1.5 flex items-center justify-between border border-slate-800">
          <div className="flex-1 bg-cyan-600 rounded-full py-2 orbitron text-[10px] font-bold text-center text-white shadow-[0_0_15px_rgba(0,162,255,0.4)]">TEAM BLUE</div>
          <span className="px-6 orbitron italic text-slate-500 text-xs font-black">VS</span>
          <div className="flex-1 bg-orange-700 rounded-full py-2 orbitron text-[10px] font-bold text-center text-white shadow-[0_0_15px_rgba(255,115,0,0.4)]">TEAM ORANGE</div>
        </div>

        <div className="hidden md:block">
          <button className="px-6 py-2 border border-slate-700 text-slate-500 orbitron text-[10px] rounded bg-slate-900/50 hover:text-white transition-all">
            VIEW HISTORY
          </button>
        </div>
      </div>

      {/* History Table Container */}
      <div className="card-glass overflow-hidden mb-12 border-slate-800">
        <div className="overflow-x-auto">
          <table className="wicc-table text-xs">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Match</th>
                <th className="text-left">Team Blue</th>
                <th className="text-left">Team Orange</th>
                <th className="text-center">Overs</th>
                <th className="text-center">Winner</th>
                <th className="text-center">Pts</th>
                <th className="text-center">Awards</th>
              </tr>
            </thead>
            <tbody className="mono">
              {matches.map((m) => (
                <tr key={m.id}>
                  <td className="text-slate-400">{m.date}</td>
                  <td className="text-cyan-400 font-bold tracking-widest">{m.matchnumber}</td>
                  <td className="text-cyan-100">{m.teamonescore} <span className="text-[10px] text-slate-500">runs</span></td>
                  <td className="text-orange-100">{m.teamtwoscore} <span className="text-[10px] text-slate-500">runs</span></td>
                  <td className="text-center text-slate-400">{m.overs || '---'}</td>
                  <td className="text-center">
                    <span className={`px-3 py-1 rounded text-[9px] font-black orbitron ${parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0')
                        ? 'text-cyan-400'
                        : parseInt(m.teamtwopoints || '0') > parseInt(m.teamonepoints || '0')
                          ? 'text-orange-400'
                          : 'text-slate-500'
                      }`}>
                      {parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0') ? 'BLUE' : parseInt(m.teamtwopoints || '0') > parseInt(m.teamonepoints || '0') ? 'ORANGE' : 'DRAW'}
                    </span>
                  </td>
                  <td className="text-center text-white font-bold">{m.teamonepoints}-{m.teamtwopoints}</td>
                  <td className="text-center text-yellow-400 orbitron text-[10px]">{m.mom}</td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-600 orbitron text-[10px] uppercase tracking-[0.3em]">
                    System Waiting for Match Entry Data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
