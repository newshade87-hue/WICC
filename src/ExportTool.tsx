import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { generateSeriesReport } from './aiAgent';
import { Camera, MessageSquare, Zap, Loader2, Share2 } from 'lucide-react';

export const ExportTool: React.FC<{ series: any }> = ({ series }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState('');

    const handleGenerateSeriesReport = async () => {
        setLoading(true);
        const text = await generateSeriesReport(series);
        setReport(text);
        setLoading(false);
    };

    const handleCapture = async () => {
        const element = document.getElementById('report-container');
        if (!element) return;

        setLoading(true);
        const canvas = await html2canvas(element, {
            backgroundColor: '#020617',
            scale: 2
        });
        const link = document.createElement('a');
        link.download = `WICC_Premier_Report_${new Date().toLocaleDateString()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        setLoading(false);
    };

    const handleWhatsApp = () => {
        if (!report) return;
        const url = `https://wa.me/?text=${encodeURIComponent(report)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="mt-12 space-y-8">
            {/* Visual Report Container (Hidden until generated) */}
            {report && (
                <div id="report-container" className="card-glass p-8 border-t-4 border-t-cyan-500 relative overflow-hidden bg-slate-900/90 shadow-[0_0_50px_rgba(0,162,255,0.1)]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <h1 className="orbitron text-9xl font-black">WICC</h1>
                    </div>
                    <h2 className="orbitron text-cyan-400 text-xl font-black mb-6 tracking-[0.3em]">SERIES BRIEFING // 2099</h2>
                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap mono text-base bg-slate-950/50 p-6 rounded-lg border border-slate-800">
                        {report}
                    </div>
                    <div className="mt-8 flex justify-between items-center opacity-40">
                        <span className="orbitron text-[8px] tracking-[0.5em] text-cyan-500 font-bold">WICC PREMIER INTERFACE V2.5</span>
                        <span className="mono text-[8px] text-slate-500">{new Date().toLocaleString()}</span>
                    </div>
                    <button
                        onClick={handleCapture}
                        className="mt-4 w-full bg-slate-800 hover:bg-slate-700 py-2 rounded orbitron text-[10px] text-slate-400 flex items-center justify-center gap-2 transition-all"
                    >
                        <Camera className="w-4 h-4" /> EXPORT AS MASTER IMAGE (PNG)
                    </button>
                </div>
            )}

            {/* Main Action Buttons as per Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={handleGenerateSeriesReport}
                    disabled={loading}
                    className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 p-6 rounded orbitron text-xs font-black tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,162,255,0.2)] transition-all transform hover:-translate-y-1"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                    GENERATE AI SERIES BRIEFING
                </button>

                <button
                    onClick={handleWhatsApp}
                    disabled={!report}
                    className={`p-6 rounded orbitron text-xs font-black tracking-[0.2em] flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 ${report
                            ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 shadow-[0_10px_30px_rgba(16,185,129,0.2)]'
                            : 'bg-slate-800/50 text-slate-600 cursor-not-allowed grayscale'
                        }`}
                >
                    <MessageSquare className="w-5 h-5" /> WHATSAPP SUMMARY
                </button>
            </div>
        </div>
    );
};
