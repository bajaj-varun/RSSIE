"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface IngestionStatus {
    step: 'idle' | 'uploading' | 'completed' | 'error';
    progress: number;
    message: string;
}

const PdfIngestion = () => {
    const [status, setStatus] = useState<IngestionStatus>({
        step: 'idle',
        progress: 0,
        message: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file || file.type !== 'application/pdf') {
            setStatus({ step: 'error', progress: 0, message: 'Please upload a valid PDF file.' });
            return;
        }

        try {
            setStatus({ step: 'uploading', progress: 50, message: 'Uploading document to server for processing...' });

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api-proxy/safety-manuals/ingest', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to upload and process document');
            }

            setStatus({ step: 'completed', progress: 100, message: 'Documentation successfully processed and indexed on backend!' });
        } catch (error: any) {
            console.error('Ingestion error:', error);
            setStatus({ step: 'error', progress: 0, message: error.message || 'An error occurred during ingestion.' });
        }
    };

    return (
        <div className="glass p-6 rounded-2xl border border-white/5 h-full flex flex-col justify-center items-center gap-6">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Knowledge Base Ingestion</h3>
                <p className="text-sm text-slate-400">Upload aviation safety manuals for AI analysis</p>
            </div>

            <div className="relative group w-full max-w-sm">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    ref={fileInputRef}
                    disabled={status.step !== 'idle' && status.step !== 'completed' && status.step !== 'error'}
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={status.step !== 'idle' && status.step !== 'completed' && status.step !== 'error'}
                    className="w-full h-40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all group active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                    {status.step === 'idle' || status.step === 'completed' || status.step === 'error' ? (
                        <>
                            <div className="p-4 bg-white/5 rounded-full group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                <Upload size={32} />
                            </div>
                            <span className="text-sm font-medium text-slate-300">Select PDF Manual</span>
                        </>
                    ) : (
                        <>
                            <Loader2 className="animate-spin text-primary" size={48} />
                            <span className="text-sm font-medium text-slate-300">{status.message}</span>
                        </>
                    )}
                </button>
            </div>

            {status.step !== 'idle' && (
                <div className="w-full max-w-sm space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                        <span className={status.step === 'error' ? 'text-red-400' : 'text-primary'}>
                            {status.step.toUpperCase()}
                        </span>
                        <span className="text-slate-500">{Math.round(status.progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${status.step === 'error' ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${status.progress}%` }}
                        />
                    </div>

                    {status.step === 'completed' && (
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 p-3 rounded-xl border border-emerald-400/20">
                            <CheckCircle2 size={16} />
                            <p className="text-xs font-medium">{status.message}</p>
                        </div>
                    )}

                    {status.step === 'error' && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                            <AlertCircle size={16} />
                            <p className="text-xs font-medium">{status.message}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-6 opacity-40">
                <div className="flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">PDF ONLY</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">EMBEDDED ON CLOUD</span>
                </div>
            </div>
        </div>
    );
};

export default PdfIngestion;
