"use client";

import React, { useState, useEffect } from 'react';
import { Crosshair, Map as MapIcon, Info, AlertOctagon, Terminal } from 'lucide-react';
import { cn } from "@/lib/utils";
import AlertLogModal from './AlertLogModal';

interface RunwayStatus {
    id: string;
    mu: number;
    status: 'CRITICAL' | 'WARNING' | 'NORMAL';
    location: [number, number];
}

export default function ControlTowerMap() {
    const [runways, setRunways] = useState<RunwayStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLogOpen, setIsLogOpen] = useState(false);

    const fetchStatus = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/api-proxy');
            // console.log(`[TowerMap] Fetching status from: ${apiUrl}/telemetry/tower (Env: ${process.env.NEXT_PUBLIC_API_URL})`);
            const res = await fetch(`${apiUrl}/telemetry/tower`);

            if (!res.ok) {
                console.error(`[TowerMap] HTTP Error: ${res.status}`);
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            // console.log(`[TowerMap] Received data:`, data);

            if (Array.isArray(data)) {
                // Filter out any corrupted records missing location to prevent crash
                const validData = data.filter(r => r && Array.isArray(r.location) && r.location.length === 2);
                setRunways(validData);
            } else {
                console.error("[TowerMap] Expected array but received:", data);
            }
        } catch (e) {
            console.error("[TowerMap] Fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    // Simple projection for JFK runways [lon, lat]
    // Bounding box approx: [-73.82, 40.62] to [-73.74, 40.66]
    const project = (coords: [number, number]) => {
        const lonMin = -73.82;
        const lonMax = -73.74;
        const latMin = 40.62;
        const latMax = 40.66;

        const x = ((coords[0] - lonMin) / (lonMax - lonMin)) * 100;
        const y = 100 - ((coords[1] - latMin) / (latMax - latMin)) * 100;
        return { x: `${x}%`, y: `${y}%` };
    };

    if (loading) return (
        <div className="h-full glass rounded-3xl flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-4 text-slate-500">
                <Crosshair className="animate-spin" size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Scanning Airfield...</span>
            </div>
        </div>
    );

    return (
        <div className="h-full glass rounded-3xl flex flex-col overflow-hidden relative border border-white/5">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                        <MapIcon size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white">Live Airfield Topology</h3>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">KJFK Control Tower - Ground Radar</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 border border-white/10 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-300">RADAR ACTIVE</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-black/40 p-6 scrollbar-hide">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Runway Status Inventory</h4>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsLogOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 glass border border-white/10 rounded-full text-[9px] font-bold text-slate-300 hover:text-white hover:border-secondary/50 hover:bg-secondary/10 transition-all group"
                        >
                            <Terminal size={12} className="text-secondary group-hover:animate-pulse" />
                            VIEW FULL ALERT LOG
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Operating</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Action Required</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {runways.map((runway) => (
                        <div
                            key={`card-${runway.id}`}
                            className={cn(
                                "p-5 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden",
                                runway.status === 'CRITICAL' ? "bg-secondary/5 border-secondary/20 hover:bg-secondary/10" :
                                    runway.status === 'WARNING' ? "bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10" :
                                        "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                        >
                            {/* Decorative ID background */}
                            <div className="absolute -right-4 -top-4 text-[40px] font-black text-white/5 select-none pointer-events-none group-hover:text-white/10 transition-colors">
                                {runway.id.split('-')[1]}
                            </div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h5 className="text-sm font-black text-white tracking-tight">{runway.id}</h5>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Primary Friction Surface</p>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border",
                                    runway.status === 'CRITICAL' ? "bg-secondary/10 text-secondary border-secondary/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]" :
                                        runway.status === 'WARNING' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                            "bg-accent/10 text-accent border-accent/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                )}>
                                    {runway.status}
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Coefficient (μ)</span>
                                        <span className={cn(
                                            "text-lg font-black tabular-nums",
                                            runway.status === 'CRITICAL' ? "text-secondary" : "text-white"
                                        )}>{runway.mu.toFixed(2)}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-1000 ease-out",
                                                runway.status === 'CRITICAL' ? "bg-secondary shadow-[0_0_10px_rgba(249,115,22,0.5)]" :
                                                    runway.status === 'WARNING' ? "bg-yellow-500" : "bg-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            )}
                                            style={{ width: `${runway.mu * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[7px] text-slate-500 font-black uppercase mb-1">LATITUDE</p>
                                        <p className="text-[10px] text-slate-300 font-bold tabular-nums">{runway.location[1].toFixed(5)}°</p>
                                    </div>
                                    <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-[7px] text-slate-500 font-black uppercase mb-1">LONGITUDE</p>
                                        <p className="text-[10px] text-slate-300 font-bold tabular-nums">{runway.location[0].toFixed(5)}°</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Panel */}
            <div className="p-4 bg-black/40 border-t border-white/5 flex items-center gap-4">
                <Info size={16} className="text-primary flex-shrink-0" />
                <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight italic">
                    Ground Radar simulating real-time Mu measurements across JFK airfield topology. High granularity detection active for all surfaces.
                </p>
            </div>

            <AlertLogModal
                isOpen={isLogOpen}
                onClose={() => setIsLogOpen(false)}
            />
        </div>
    );
}
