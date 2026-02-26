"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Bell, Calendar, Clock, AlertTriangle, Info, ShieldAlert, Search, Filter } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Notam {
    id: string;
    category: string;
    level: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    content: string;
    issued: string;
    expiry: string;
}

export default function NotamIntelligence() {
    const [notams, setNotams] = useState<Notam[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchNotams = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/api-proxy');
                const res = await fetch(`${apiUrl}/telemetry/notams`);
                const data = await res.json();
                setNotams(data);
            } catch (e) {
                console.error("Failed to fetch NOTAMs", e);
            } finally {
                setLoading(false);
            }
        };

        fetchNotams();
        const interval = setInterval(fetchNotams, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredNotams = notams.filter(notam =>
        notam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notam.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notam.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-full glass rounded-3xl flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-4 text-slate-500">
                <Activity className="animate-spin" size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Parsing NOTAM Database...</span>
            </div>
        </div>
    );

    return (
        <div className="h-full glass rounded-3xl flex flex-col overflow-hidden border border-white/5">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary/20 rounded-2xl text-secondary glow-orange">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white">NOTAM Intelligence</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Notice to Air Missions - Real-time Analysis</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 border border-secondary/20 rounded-full">
                        <ShieldAlert size={14} className="text-secondary" />
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-tight">Active Hazards Detected</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search NOTAMs (ID, content, etc.)..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-[10px] text-white focus:outline-none focus:border-secondary/50 placeholder:text-slate-600 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="px-4 py-2 glass border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
                        <Filter size={14} />
                        Category
                    </button>
                </div>
            </div>

            {/* NOTAM Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/10">
                {filteredNotams.map((notam) => (
                    <div key={notam.id} className={cn(
                        "glass p-5 rounded-2xl border transition-all hover:translate-x-1",
                        notam.level === 'CRITICAL' ? "border-secondary/30 bg-secondary/5" :
                            notam.level === 'WARNING' ? "border-yellow-500/30 bg-yellow-500/5" :
                                "border-white/5 hover:bg-white/5"
                    )}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-xl",
                                    notam.level === 'CRITICAL' ? "bg-secondary/20 text-secondary" :
                                        notam.level === 'WARNING' ? "bg-yellow-500/20 text-yellow-500" :
                                            "bg-primary/20 text-primary"
                                )}>
                                    {notam.level === 'CRITICAL' ? <ShieldAlert size={18} /> :
                                        notam.level === 'WARNING' ? <AlertTriangle size={18} /> :
                                            <Info size={18} />}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{notam.id}</span>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-tight">{notam.title}</h4>
                                </div>
                            </div>
                            <div className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-bold tracking-widest uppercase",
                                notam.level === 'CRITICAL' ? "bg-secondary text-white" :
                                    notam.level === 'WARNING' ? "bg-yellow-500 text-black" :
                                        "bg-primary/30 text-primary border border-primary/40"
                            )}>
                                {notam.category}
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed indent-2 border-l-2 border-white/10 py-1 mb-4 italic">
                            "{notam.content}"
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                    <Clock size={12} />
                                    <span>ISSUED: {new Date(notam.issued).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600">
                                    <Calendar size={12} />
                                    <span>EXP: {new Date(notam.expiry).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                </div>
                            </div>
                            <button className="text-[9px] font-bold text-secondary hover:underline uppercase tracking-widest">
                                Operational Impact Analysis
                            </button>
                        </div>
                    </div>
                ))}
                {filteredNotams.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <Search size={48} className="text-slate-600 mb-4" />
                        <p className="text-[10px] font-bold uppercase">No matching notices found</p>
                    </div>
                )}
            </div>

            {/* Radar Footer */}
            <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Live FAA/AIS Data Stream Active</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-[9px] font-bold text-slate-400">
                        <span className="text-slate-600">REGION:</span> NEW YORK METRO (ZNY)
                    </div>
                </div>
            </div>
        </div>
    );
}
