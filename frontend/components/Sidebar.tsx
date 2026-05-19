"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Tv, 
  MessageSquareCode, 
  Activity, 
  ShieldAlert, 
  BarChart3, 
  Cpu
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Visual Support", path: "/", icon: MessageSquareCode },
    { name: "Device Diagnostics", path: "/diagnostics", icon: Activity },
    { name: "Escalation Desk", path: "/tickets", icon: ShieldAlert },
    { name: "AI Analytics", path: "/analytics", icon: BarChart3 }
  ];

  return (
    <aside className="w-72 border-r border-borderGlow bg-background flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col flex-1">
        {/* Brand Header */}
        <div className="p-6 border-b border-borderGlow flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-glow">
            <Tv className="h-5 w-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent uppercase font-sans">
              VisioCare
            </h1>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
              VLM Diagnostic OS
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-r from-primary/10 to-secondary/5 text-primary border border-primary/20 shadow-glow" 
                    : "text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-gray-400"}`} />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-glow animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Metrics */}
      <div className="p-4 border-t border-borderGlow">
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-success">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="font-mono uppercase tracking-wider text-[10px]">VLM Engine Standby</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono pt-1">
            <span>Core Latency</span>
            <span className="text-primary font-bold">~240ms</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Accuracy Ratio</span>
            <span className="text-secondary font-bold">96.8%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
