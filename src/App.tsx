import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { MatchForm } from './MatchForm';
import { AwardsHub } from './AwardsHub';
import { ExportTool } from './ExportTool';
import type { MatchData } from './types';
import { Trophy, Users, Activity } from 'lucide-react';

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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-32">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl orbitron font-bold text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 header-pulse inline-block">
          WICC
        </h1>
        <p className="text-xs tracking-[0.5em] text-cyan-500 mt-2 font-semibold">CORE RECORDER V.2 CLOUD</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className={`relative overflow-hidden glass p-6 text-center transition-all ${champion === 'TEAM BLUE' ? 'border-2 border-yellow-500 shadow-[0_0_30px_rgba(251,191,36,0.3)]' : 'glow-a'}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 opacity-30"></div>
          <h3 className="orbitron text-cyan-400 flex items-center justify-center gap-2 mb-2">
            <Users className="w-5 h-5" /> TEAM BLUE
          </h3>
          <div className="text-5xl orbitron font-bold mono text-white">{totals.ptsA}</div>
          <p className="text-[10px] text-slate-500 uppercase mt-2">Series Points</p>
        </div>
        <div className={`relative overflow-hidden glass p-6 text-center transition-all ${champion === 'TEAM ORANGE' ? 'border-2 border-yellow-500 shadow-[0_0_30px_rgba(251,191,36,0.3)]' : 'glow-b'}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 opacity-30"></div>
          <h3 className="orbitron text-orange-400 flex items-center justify-center gap-2 mb-2">
            <Users className="w-5 h-5" /> TEAM ORANGE
          </h3>
          <div className="text-5xl orbitron font-bold mono text-white">{totals.ptsB}</div>
          <p className="text-[10px] text-slate-500 uppercase mt-2">Series Points</p>
        </div>
      </div>

      {champion && (
        <div className="glass p-8 mb-12 text-center border-yellow-500 shadow-[0_0_40px_rgba(251,191,36,0.2)] animate-pulse">
          <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="orbitron text-4xl text-yellow-400">SERIES CHAMPIONS</h2>
          <p className="orbitron text-2xl text-white mt-2 font-bold tracking-widest">{champion}</p>
        </div>
      )}

      <MatchForm onSave={fetchData} />

      {seriesInfo && (
        <ExportTool
          series={{ ...seriesInfo, ptsA: totals.ptsA, ptsB: totals.ptsB, champion }}
        />
      )}

      <AwardsHub onUpdate={fetchData} />

      <div className="glass overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="orbitron text-xs flex items-center gap-2 text-cyan-500">
            <Activity className="w-4 h-4" /> Deployment Dashboard
          </h2>
          <span className="text-[10px] text-slate-500 orbitron">V2.0.0-Cloud</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs mono">
            <thead className="bg-slate-900 text-slate-500 uppercase tracking-tighter">
              <tr>
                <th className="p-4 border-r border-slate-800">Match</th>
                <th className="p-4 border-r border-slate-800">Date</th>
                <th className="p-4 border-r border-slate-800 text-center">Innings</th>
                <th className="p-4 border-r border-slate-800">Team Blue</th>
                <th className="p-4 border-r border-slate-800">Team Orange</th>
                <th className="p-4 border-r border-slate-800 text-center">Winner</th>
                <th className="p-4">MVP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {matches.map((m) => (
                <tr key={m.id} className="hover:bg-cyan-500/5 transition-colors group">
                  <td className="p-4 text-cyan-400 font-bold border-r border-slate-800">#{m.matchnumber}</td>
                  <td className="p-4 text-slate-400 border-r border-slate-800">{m.date}</td>
                  <td className="p-4 text-slate-500 border-r border-slate-800 text-center">{m.innings === '1-Inning' ? '1-INN' : '2-INN'}</td>
                  <td className="p-4 text-cyan-100 border-r border-slate-800">
                    <div className="flex justify-between">
                      <span>{m.teamonescore}</span>
                      <span className="text-cyan-600 text-[10px]">{m.teamonepoints}PT</span>
                    </div>
                  </td>
                  <td className="p-4 text-orange-100 border-r border-slate-800">
                    <div className="flex justify-between">
                      <span>{m.teamtwoscore}</span>
                      <span className="text-orange-600 text-[10px]">{m.teamtwopoints}PT</span>
                    </div>
                  </td>
                  <td className="p-4 text-center border-r border-slate-800">
                    <span className={`px-2 py-1 rounded inline-block min-w-[60px] text-[8px] font-bold ${parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0')
                        ? 'bg-cyan-900 border border-cyan-700 text-cyan-300'
                        : parseInt(m.teamtwopoints || '0') > parseInt(m.teamonepoints || '0')
                          ? 'bg-orange-900 border border-orange-700 text-orange-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}>
                      {parseInt(m.teamonepoints || '0') > parseInt(m.teamtwopoints || '0') ? 'BLUE' : parseInt(m.teamtwopoints || '0') > parseInt(m.teamonepoints || '0') ? 'ORANGE' : 'DRAW'}
                    </span>
                  </td>
                  <td className="p-4 text-yellow-400 orbitron group-hover:text-yellow-300 transition-colors">{m.mom}</td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-600 orbitron text-xs tracking-widest">
                    No Match Data Found. Initialize Series Recording.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
