"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Battery, MapPin, Signal, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Sensor {
    id: string;
    type: string;
    location: string;
    status: 'ONLINE' | 'WARNING' | 'OFFLINE';
    battery: string;
    lastHeartbeat: string;
}

interface HealthData {
    overallStatus: string;
    totalDevices: number;
    onlineCount: number;
    warningCount: number;
    sensors: Sensor[];
}

export default function IoTHealth() {
    const [data, setData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/api-proxy');
                const res = await fetch(`${apiUrl}/telemetry/health`);
                const healthData = await res.json();
                setData(healthData);
            } catch (e) {
                console.error("Failed to fetch IoT health", e);
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="h-full glass rounded-3xl flex items-center justify-center animate-pulse">
            <div className="flex flex-col items-center gap-4 text-slate-500">
                <Activity className="animate-bounce" size={32} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Diagnosing Network...</span>
            </div>
        </div>
    );

    return (
        <div className="h-full glass rounded-3xl flex flex-col overflow-hidden border border-white/5">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-2xl text-primary glow-blue">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">IoT Infrastructure Health</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Mesh Network Status: {data?.overallStatus}</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[20px] font-bold text-white leading-none">{data?.onlineCount}/{data?.totalDevices}</p>
                        <p className="text-[9px] text-accent font-bold uppercase">Devices Online</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[20px] font-bold text-secondary leading-none">{data?.warningCount}</p>
                        <p className="text-[9px] text-secondary font-bold uppercase">Alerts Active</p>
                    </div>
                </div>
            </div>

            {/* Grid of Sensors */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-black/10">
                {data?.sensors.map((sensor) => (
                    <div key={sensor.id} className="glass p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all group relative overflow-hidden">
                        {/* Status Background Glow */}
                        <div className={cn(
                            "absolute -right-4 -top-4 w-16 h-16 blur-2xl opacity-20 transition-all group-hover:opacity-40",
                            sensor.status === 'ONLINE' ? "bg-accent" : "bg-secondary"
                        )} />

                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-white/5 rounded-xl text-slate-400 group-hover:text-white transition-colors">
                                <Signal size={18} />
                            </div>
                            <div className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-bold tracking-tighter uppercase",
                                sensor.status === 'ONLINE' ? "bg-accent/20 text-accent border border-accent/30" : "bg-secondary/20 text-secondary border border-secondary/30"
                            )}>
                                {sensor.status}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors">{sensor.id}</h4>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">{sensor.type}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <MapPin size={10} />
                                    <span className="text-[9px] font-bold">{sensor.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Battery size={10} />
                                    <span className="text-[9px] font-bold">{sensor.battery}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500">
                                    <Clock size={10} />
                                    <span>Last: {new Date(sensor.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                </div>
                                {sensor.status === 'WARNING' && (
                                    <AlertCircle size={12} className="text-secondary animate-pulse" />
                                )}
                                {sensor.status === 'ONLINE' && (
                                    <ShieldCheck size={12} className="text-accent" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer System Info */}
            <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Secure AES-256 Mesh Encrypted</span>
                </div>
                <button className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest">
                    Run Network Diagnostic
                </button>
            </div>
        </div>
    );
}
