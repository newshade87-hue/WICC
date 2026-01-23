import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { generateSeriesReport } from './aiAgent';
import { Camera, MessageSquare, Zap, Loader2 } from 'lucide-react';

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
        link.download = `WICC_Series_Report_${new Date().toLocaleDateString()}.png`;
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
        <div className="mb-12">
            <div className="flex flex-wrap gap-4 mb-6">
                <button
                    onClick={handleGenerateSeriesReport}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded orbitron text-xs flex items-center gap-2 glow-a transition-all"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    GENERATE AI REPORT
                </button>
                {report && (
                    <>
                        <button
                            onClick={handleCapture}
                            className="bg-slate-800 p-3 rounded orbitron text-xs flex items-center gap-2 hover:bg-slate-700 transition-all"
                        >
                            <Camera className="w-4 h-4" /> CAPTURE PNG
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="bg-green-600 p-3 rounded orbitron text-xs flex items-center gap-2 hover:bg-green-500 transition-all shadow-[0_0_15px_rgba(22,163,74,0.4)]"
                        >
                            <MessageSquare className="w-4 h-4" /> SHARE TO WHATSAPP
                        </button>
                    </>
                )}
            </div>

            {report && (
                <div id="report-container" className="glass p-8 border-t-4 border-t-purple-600 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <h1 className="orbitron text-6xl">WICC</h1>
                    </div>
                    <h2 className="orbitron text-purple-400 text-xl mb-4">CYBER-REPORT 2099</h2>
                    <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap mono text-sm">
                        {report}
                    </div>
                    <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center opacity-50">
                        <span className="orbitron text-[8px] tracking-widest text-cyan-500">WICC DIGITAL SCOREBOOK V2</span>
                        <span className="mono text-[8px] text-slate-500">{new Date().toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
