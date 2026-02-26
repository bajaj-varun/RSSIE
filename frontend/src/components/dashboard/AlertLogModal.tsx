"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Clock, MapPin, Hash, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Alert {
    id: string;
    timestamp: string;
    runwayId: string;
    mu: number;
    status: 'CRITICAL' | 'WARNING';
    location: [number, number];
}

interface AlertLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AlertLogModal({ isOpen, onClose }: AlertLogModalProps) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchAlerts = async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/api-proxy');
                    const res = await fetch(`${apiUrl}/telemetry/alerts`);
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        const validData = data.filter((a: any) => a && Array.isArray(a.location) && a.location.length === 2);
                        setAlerts(validData);
                    }
                } catch (e) {
                    console.error("Failed to fetch alerts", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchAlerts();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl max-h-[80vh] glass rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary/20 rounded-2xl text-secondary glow-orange">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">System Alert Log</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Historical Friction Anomalies (Mu &lt; 0.55)</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-black/20">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse text-slate-600">
                            <Hash size={32} className="animate-spin mb-4" />
                            <span className="text-[10px] font-bold uppercase">Decrypting Logs...</span>
                        </div>
                    ) : alerts.length > 0 ? (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={cn(
                                    "p-4 rounded-3xl border transition-all flex items-center justify-between group cursor-default",
                                    alert.status === 'CRITICAL' ? "bg-secondary/10 border-secondary/20 hover:bg-secondary/20" :
                                        "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={cn(
                                        "w-1 h-12 rounded-full",
                                        alert.status === 'CRITICAL' ? "bg-secondary" : "bg-yellow-500"
                                    )} />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-white">{alert.runwayId}</span>
                                            <span className={cn(
                                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase",
                                                alert.status === 'CRITICAL' ? "bg-secondary text-white" : "bg-yellow-500 text-black"
                                            )}>
                                                {alert.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                <span>{new Date(alert.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={12} />
                                                <span className="tabular-nums">{alert.location[1].toFixed(4)}, {alert.location[0].toFixed(4)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Measured</p>
                                    <p className={cn(
                                        "text-xl font-black tabular-nums",
                                        alert.status === 'CRITICAL' ? "text-secondary" : "text-white text-yellow-500"
                                    )}>
                                        {alert.mu.toFixed(2)}<span className="text-[10px] opacity-50 ml-0.5">μ</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <AlertCircle size={48} className="text-slate-600 mb-4" />
                            <p className="text-[10px] font-bold uppercase">No recorded anomalies in current session</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">
                        Logs restricted to last 50 high-priority events
                    </p>
                    <button className="flex items-center gap-2 group text-[9px] font-black text-primary uppercase tracking-widest hover:underline">
                        Export Full Forensic Report
                        <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
