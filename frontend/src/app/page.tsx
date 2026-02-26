"use client";

import React, { useState, useEffect } from "react";
import ChatInterface from "@/components/chat/ChatInterface";
import RunwayFrictionChart from "@/components/dashboard/RunwayFrictionChart";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import ControlTowerMap from "@/components/dashboard/ControlTowerMap";
import IoTHealth from "@/components/dashboard/IoTHealth";
import NotamIntelligence from "@/components/dashboard/NotamIntelligence";
import PdfIngestion from "@/components/dashboard/PdfIngestion";
import { Plane, AlertTriangle, Activity, Map as MapIcon, Settings, MessageSquare, ChevronLeft, Wifi, HomeIcon, Bell, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [view, setView] = useState<'dashboard' | 'tower' | 'health' | 'notam' | 'ingest'>('dashboard');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleActionClick = (action: string) => {
    if (action === 'Control Tower') {
      setView('tower');
    } else if (action === 'IoT Health') {
      setView('health');
    } else if (action === 'NOTAM Intelligence') {
      setView('notam');
    } else if (action === 'Ingestion') {
      setView('ingest');
    } else if (action === 'Home') {
      setView('dashboard');
    } else {
      alert(`${action} module is coming soon in the next update! Currently in simulation mode.`);
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case 'tower': return 'Airfield Control Tower';
      case 'health': return 'IoT Infrastructure Health';
      case 'notam': return 'NOTAM Intelligence Center';
      case 'ingest': return 'Knowledge Base Ingestion';
      default: return 'Runway Surface & Safety Intelligence Engine';
    }
  };

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-8 gap-6 max-w-[1700px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center glow-blue cursor-pointer" onClick={() => setView('dashboard')}>
            <Plane className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              {view !== 'dashboard' && (
                <button onClick={() => setView('dashboard')} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <ChevronLeft size={24} className="text-primary" />
                </button>
              )}
              {getViewTitle()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 glass px-4 py-2 rounded-xl">
            <Activity className="text-accent animate-pulse" size={16} />
            <div className="text-[10px] font-bold">
              <p className="text-slate-500 uppercase">System Status</p>
              <p className="text-white">ALL SYSTEMS OPERATIONAL</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={cn(
                "p-2.5 rounded-xl border transition-all duration-300",
                isChatOpen ? "bg-primary text-white border-primary glow-blue" : "glass text-slate-400 border-white/5 hover:bg-white/10"
              )}
            >
              <MessageSquare size={20} />
            </button>
            <button className="p-2.5 rounded-xl glass hover:bg-white/10 transition-colors">
              <Settings size={20} className="text-slate-400" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center font-bold text-sm border border-white/10 text-white shadow-lg">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="flex flex-1 gap-6 min-h-0">

        {/* Main Content */}
        <div className={cn(
          "flex flex-col gap-6 transition-all duration-500 ease-in-out",
          isChatOpen ? "w-full lg:w-2/3 xl:w-3/4" : "w-full"
        )}>

          {view === 'dashboard' ? (
            <>
              {/* TopRow: Weather & Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WeatherWidget />
                <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Active Safety Intelligence</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0 animate-pulse" />
                      <p className="text-xs text-slate-300 flex-1">
                        RWY 09L friction levels reaching maintenance threshold (0.42μ). Automated inspection scheduled.
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-start gap-3 opacity-60">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      <p className="text-xs text-slate-400 flex-1">
                        Heavy precipitation alert cleared for KLGA. System recalibrating sensors for wet-surface recovery.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleActionClick('Intelligence')}
                    className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase transition-colors tracking-widest text-slate-400"
                  >
                    View Full Alert Log
                  </button>
                </div>
              </div>

              {/* Friction Chart */}
              <div className="flex-1 min-h-[400px]">
                <RunwayFrictionChart />
              </div>
            </>
          ) : view === 'tower' ? (
            <div className="flex-1 min-h-[600px]">
              <ControlTowerMap />
            </div>
          ) : view === 'health' ? (
            <div className="flex-1 min-h-[600px]">
              <IoTHealth />
            </div>
          ) : view === 'ingest' ? (
            <div className="flex-1 min-h-[600px]">
              <PdfIngestion />
            </div>
          ) : (
            <div className="flex-1 min-h-[600px]">
              <NotamIntelligence />
            </div>
          )}

          {/* Action Bar */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: 'Home', icon: HomeIcon },
              { label: 'Control Tower', icon: MapIcon },
              { label: 'NOTAM Intelligence', icon: Bell },
              { label: 'Ingestion', icon: Database },
              { label: 'IoT Health', icon: Wifi },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => handleActionClick(action.label)}
                className={cn(
                  "glass p-4 rounded-xl flex flex-col items-center gap-3 hover:bg-white/10 transition-all active:scale-95 group border-white/5",
                  (
                    (view === 'tower' && action.label === 'Control Tower') ||
                    (view === 'health' && action.label === 'IoT Health') ||
                    (view === 'notam' && action.label === 'NOTAM Intelligence') ||
                    (view === 'ingest' && action.label === 'Ingestion') ||
                    (view === 'dashboard' && action.label === 'Home')
                  ) ? "border-primary/50 bg-primary/10" : ""
                )}
              >
                <div className={cn(
                  "p-2.5 bg-white/5 rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-colors text-slate-400",
                  (
                    (view === 'tower' && action.label === 'Control Tower') ||
                    (view === 'health' && action.label === 'IoT Health') ||
                    (view === 'notam' && action.label === 'NOTAM Intelligence') ||
                    (view === 'ingest' && action.label === 'Ingestion') ||
                    (view === 'dashboard' && action.label === 'Home')
                  ) ? "bg-primary/20 text-primary" : ""
                )}>
                  <action.icon size={20} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-200 transition-colors",
                  (
                    (view === 'tower' && action.label === 'Control Tower') ||
                    (view === 'health' && action.label === 'IoT Health') ||
                    (view === 'notam' && action.label === 'NOTAM Intelligence') ||
                    (view === 'ingest' && action.label === 'Ingestion') ||
                    (view === 'dashboard' && action.label === 'Home')
                  ) ? "text-slate-200" : ""
                )}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible Chat Sidebar */}
        {isChatOpen && (
          <aside className="hidden lg:flex flex-col w-1/3 xl:w-1/4 transition-all duration-500 ease-in-out">
            <ChatInterface />
          </aside>
        )}

      </div>
    </main>
  );
}
