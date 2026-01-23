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
        const canvas = await html2canvas(element, { backgroundColor: '#020617', scale: 2 });
        const link = document.createElement('a');
        link.download = `WICC_Report.png`;
        link.href = canvas.toDataURL();
        link.click();
        setLoading(false);
    };

    const handleWhatsApp = () => {
        if (!report) return;
        window.open(`https://wa.me/?text=${encodeURIComponent(report)}`, '_blank');
    };

    return (
        <div style={{ marginTop: '4rem' }}>
            {report && (
                <div id="report-container" className="form-card" style={{ borderTop: '4px solid var(--accent-cyan)' }}>
                    <h2 className="orbitron" style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}>SERIES BRIEFING // 2099</h2>
                    <div className="mono" style={{ background: '#000', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1e293b', lineHeight: '1.6', fontSize: '1rem' }}>{report}</div>
                    <button onClick={handleCapture} className="btn-commit orbitron" style={{ width: '100%', marginTop: '1rem', background: '#1e293b', color: '#94a3b8' }}>
                        <Camera size={16} /> EXPORT PNG
                    </button>
                </div>
            )}

            <div className="export-grid">
                <button onClick={handleGenerateSeriesReport} disabled={loading} className="btn-export bg-cyan-gradient orbitron shadow-blue">
                    {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />} GENERATE AI SERIES BRIEFING
                </button>
                <button onClick={handleWhatsApp} disabled={!report} className={`btn-export orbitron ${report ? 'bg-green-gradient' : 'btn-commit'}`} style={{ color: report ? 'white' : 'black', opacity: report ? 1 : 0.5 }}>
                    <MessageSquare size={18} /> WHATSAPP SUMMARY
                </button>
            </div>
        </div>
    );
};
