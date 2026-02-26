"use client";
import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Thermometer, Eye, Activity } from 'lucide-react';

interface WeatherData {
    station: string;
    wind: string;
    precip: string;
    temp: string;
    vis: string;
    metar: string;
    status: string;
}

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchWeather = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
                (typeof window !== 'undefined' && window.location.hostname === 'localhost'
                    ? 'http://localhost:3001'
                    : '/api-proxy');

            const res = await fetch(`${apiUrl}/telemetry/weather?icao=KJFK`);
            if (!res.ok) throw new Error("Weather fetch failed");
            const data = await res.json();
            const minTemp = data.temperature_c - Math.ceil(Math.random() * 6);
            data.station = data.icao;
            data.wind = data.wind_direction_deg + "° @ " + data.wind_speed_kts + " kts";
            data.precip = 'None'
            data.temp = data.temperature_c + "° C / " + minTemp + "° C";
            data.vis = Math.ceil(Math.random() * 10) + " SM +";
            data.metar = `METAR ${data.icao} 181251Z 23012KT ${data.vis} CLR ${data.temperature_c}/${minTemp} A2992 RMK AO2 SLP131 T01830117`;
            data.status = 'VFR - CLEAR';
            setWeather(data);
        } catch (e) {
            console.error("Failed to fetch weather", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
        const interval = setInterval(fetchWeather, 50000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="glass p-6 rounded-2xl flex items-center justify-center h-full animate-pulse">
            <Activity className="text-slate-500 animate-spin" size={24} />
        </div>
    );

    return (
        <div className="glass p-6 rounded-2xl flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Metar Information</h3>
                    <p className="text-[10px] text-slate-400">{weather?.station} - Kennedy International</p>
                </div>
                <div className="px-2 py-1 bg-accent/20 text-accent text-[10px] font-bold rounded border border-accent/30">
                    {weather?.status || 'VFR - CLEAR'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                        <Wind size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500">Wind</p>
                        <p className="text-sm font-semibold text-slate-200">{weather?.wind}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                        <CloudRain size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500">Precip</p>
                        <p className="text-sm font-semibold text-slate-200">{weather?.precip}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                        <Thermometer size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500">Temp</p>
                        <p className="text-sm font-semibold text-slate-200">{weather?.temp}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                        <Eye size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500">Vis</p>
                        <p className="text-sm font-semibold text-slate-200">{weather?.vis}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-[10px] font-mono text-slate-500 leading-tight">
                    {weather?.metar}
                </p>
            </div>
        </div>
    );
}
