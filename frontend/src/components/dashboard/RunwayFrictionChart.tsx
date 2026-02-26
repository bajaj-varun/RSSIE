"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Gauge } from 'lucide-react';
import { cn } from "@/lib/utils";

const RUNWAYS = ['RWY-04R', 'RWY-04L', 'RWY-13R', 'RWY-22L', 'RWY-31R', 'RWY-09L', 'RWY-09R'];

export default function RunwayFrictionChart() {
    const [mounted, setMounted] = useState(false);
    const [selectedRunway, setSelectedRunway] = useState('RWY-04R');
    const [frictionData, setFrictionData] = useState<{ time: string; friction: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFrictionData = async (runwayId: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/api-proxy');
            console.log(`API Url=>${apiUrl}`)
            const res = await fetch(`${apiUrl}/telemetry/friction?runwayId=${runwayId}`);
            if (!res.ok) throw new Error("Failed to fetch friction data");
            const data = await res.json();
            setFrictionData(data);
        } catch (e) {
            console.error("Friction fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchFrictionData(selectedRunway);

        const interval = setInterval(() => {
            fetchFrictionData(selectedRunway);
        }, 30000);

        return () => clearInterval(interval);
    }, [selectedRunway]);

    if (!mounted || loading) {
        return (
            <div className="glass p-6 rounded-2xl h-full animate-pulse border border-white/5">
                <div className="h-4 w-48 bg-white/5 rounded mb-4" />
                <div className="flex-1 bg-white/5 rounded-lg" />
            </div>
        );
    }

    const latestFriction = frictionData.length > 0 ? frictionData[frictionData.length - 1].friction : 0;

    return (
        <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                        <Gauge size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Runway Friction Status</h3>
                        <div className="mt-1 flex items-center gap-2">
                            <select
                                value={selectedRunway}
                                onChange={(e) => setSelectedRunway(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-primary/50"
                            >
                                {RUNWAYS.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ">
                                <span className="animate-pulse text-accent">Live Monitoring</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className={cn(
                        "text-2xl font-black tabular-nums transition-colors duration-500",
                        latestFriction < 0.42 ? "text-secondary" : "text-accent"
                    )}>
                        {latestFriction.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Current Mu (μ)</p>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={frictionData}>
                        <defs>
                            <linearGradient id="colorFrictionDark" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={latestFriction < 0.42 ? "#f97316" : "#10b981"} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={latestFriction < 0.42 ? "#f97316" : "#10b981"} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#475569"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#475569"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 1]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: 'bold'
                            }}
                            itemStyle={{ color: latestFriction < 0.42 ? '#f97316' : '#10b981' }}
                            formatter={(value: any) => [Number(value).toFixed(2), 'Friction (μ)']}
                        />
                        <Area
                            type="monotone"
                            dataKey="friction"
                            stroke={latestFriction < 0.42 ? "#f97316" : "#10b981"}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorFrictionDark)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-[9px] uppercase font-black tracking-tighter">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/10 rounded-md border border-accent/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-accent">Above 0.50 (Operational)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 rounded-md border border-yellow-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <span className="text-yellow-500">Below 0.50 (Caution)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/10 rounded-md border border-secondary/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="text-secondary">Below 0.42 (Restricted)</span>
                </div>
            </div>
        </div >
    );
}
