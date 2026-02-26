"use client";

import React, { useState, useEffect } from 'react';
import { Send, Bot, User, ShieldCheck } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'I am your Runway Surface & Safety Intelligence Engine. I have access to all FAA/EASA safety manuals and real-time runway sensor data. How can I assist you today?',
        timestamp: new Date(),
      }
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api-proxy/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });

      if (!response.ok) throw new Error('Failed to connect to safety engine');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.insight || 'I processed your query but couldn\'t find specific safety manual guidelines.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'System Error: Unable to reach the Safety Intelligence Engine. Please ensure the backend services are operational.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  if (!mounted) return <div className="h-full glass rounded-2xl animate-pulse" />;

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden border border-white/5">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-secondary w-5 h-5" />
          <h2 className="font-semibold text-xs uppercase tracking-wider text-slate-200">Aviation Safety Agent</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] text-accent font-bold uppercase">Live RAG System</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl flex gap-3 ${msg.role === 'user'
                ? 'bg-primary/20 border border-primary/30 text-white rounded-tr-none'
                : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                }`}
            >
              <div className="shrink-0 pt-1">
                {msg.role === 'assistant' ? <Bot size={18} className="text-primary" /> : <User size={18} className="text-secondary" />}
              </div>
              <div>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <div className="text-[10px] opacity-40 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white/5 border-t border-white/10">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query safety manuals..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-slate-500 text-white"
          />
          <button
            onClick={handleSend}
            className="absolute right-1.5 p-1.5 bg-primary rounded-lg hover:bg-primary/80 transition-all active:scale-95"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
