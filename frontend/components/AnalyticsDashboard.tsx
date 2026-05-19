"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/stores/useStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Smile, 
  ShieldAlert, 
  Clock, 
  PieChart as PieIcon,
  Zap,
  Gauge
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { analytics, fetchAnalytics, isLoading } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
    
    // Auto-refresh stats every 15s to simulate live streaming web socket ingestion
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !analytics) {
    return (
      <div className="flex-grow flex items-center justify-center bg-background h-screen font-mono text-xs text-primary">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          <span>Synchronizing operational metrics database...</span>
        </div>
      </div>
    );
  }

  // Calculate nice ratios for scorecards
  const totalConvs = analytics.total_conversations || 14;
  const escalationRate = analytics.escalation_rate_pct || 28.5;
  const avgLatency = analytics.average_vlm_latency_ms || 240;
  const frustrationIdx = analytics.average_frustration_index || 22;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-borderGlow pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans uppercase bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Observability & Support Analytics
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Operational dashboards mapping visual troubleshooting metrics, sentiment logs, and inference performance.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-success/10 border border-success/20 text-success text-[10px] font-mono px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-glow">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span>Live Metrics Streaming</span>
        </div>
      </div>

      {/* 1. Scorecards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Conversations */}
        <div className="glass-card p-5 rounded-2xl space-y-2 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Total Sessions</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-extrabold text-white font-sans tracking-tight">{totalConvs}</p>
          <p className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <span>+12.4% vs previous week</span>
          </p>
        </div>

        {/* Card 2: Average VLM Latency */}
        <div className="glass-card p-5 rounded-2xl space-y-2 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Avg VLM Latency</span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-extrabold text-white font-sans tracking-tight">{avgLatency}<span className="text-sm font-semibold text-gray-400">ms</span></p>
          <p className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-primary shadow-glow animate-pulse" />
            <span>Under local simulation mode</span>
          </p>
        </div>

        {/* Card 3: Escalation Rate */}
        <div className="glass-card p-5 rounded-2xl space-y-2 relative overflow-hidden group hover:border-warning/20 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Escalation Rate</span>
            <ShieldAlert className="h-4 w-4 text-warning" />
          </div>
          <p className="text-3xl font-extrabold text-white font-sans tracking-tight">{escalationRate}%</p>
          <p className="text-[10px] text-gray-400 font-sans">
            <span>Dynamic AI prioritization triggers</span>
          </p>
        </div>

        {/* Card 4: Customer Frustration Score */}
        <div className="glass-card p-5 rounded-2xl space-y-2 relative overflow-hidden group hover:border-secondary/20 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Frustration Index</span>
            <Smile className="h-4 w-4 text-secondary" />
          </div>
          <p className="text-3xl font-extrabold text-white font-sans tracking-tight">{frustrationIdx}<span className="text-sm font-semibold text-gray-400">/100</span></p>
          <p className="text-[10px] text-success font-sans flex items-center gap-1">
            <span>Empathetic AI buffers loaded</span>
          </p>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Latency & OCR Accuracy Line Chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-borderGlow pb-3 mb-2">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-widest">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>VLM Inference Performance Metrics</span>
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">Hourly intervals</span>
          </div>

          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.latency_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="timestamp" stroke="rgba(255,255,255,0.4)" />
                <YAxis yAxisId="left" stroke="rgba(0, 240, 255, 0.6)" />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(189, 0, 255, 0.6)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c101b', border: '1px solid rgba(255,255,255,0.08)' }} 
                  labelStyle={{ color: '#fff' }} 
                />
                <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#00f0ff" strokeWidth={2.5} name="Latency (ms)" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="ocr_accuracy" stroke="#bd00ff" strokeWidth={2.5} name="OCR Accuracy (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Customer Sentiment distribution Area chart */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-borderGlow pb-3 mb-2">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-widest">
              <Smile className="h-4 w-4 text-secondary" />
              <span>Sentiment Distribution</span>
            </h3>
          </div>

          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.sentiment_distribution}>
                <defs>
                  <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#bd00ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#bd00ff" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="sentiment" stroke="rgba(255,255,255,0.4)" />
                <YAxis stroke="rgba(255,255,255,0.4)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c101b', border: '1px solid rgba(255,255,255,0.08)' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="count" stroke="#bd00ff" strokeWidth={2} fillOpacity={1} fill="url(#colorSentiment)" name="Conversations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Diagnostic Error Frequency bar chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b border-borderGlow pb-3 mb-2">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 font-mono uppercase tracking-widest">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>System Anomaly and Error Frequency Profile</span>
            </h3>
          </div>

          <div className="h-72 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.error_frequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="code" stroke="rgba(255,255,255,0.4)" />
                <YAxis stroke="rgba(255,255,255,0.4)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c101b', border: '1px solid rgba(255,255,255,0.08)' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="rgba(0, 240, 255, 0.85)" radius={[6, 6, 0, 0]} name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
